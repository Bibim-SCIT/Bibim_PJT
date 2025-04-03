import React, { useState, useEffect } from "react";
import {
    Dialog,
    IconButton,
    Typography,
    Box,
    TextField,
    Button,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Popover,
    Alert,
    CircularProgress,
    Snackbar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { SketchPicker } from "react-color"; // 🎨 색상 선택기 추가
import { useSelector } from "react-redux";
import {
    fetchAllTags, updateLargeTag, updateMediumTag, updateSmallTag,
    deleteLargeTag, deleteMediumTag, deleteSmallTag
} from "../../../api/tag"; // ✅ 태그 API 호출

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        width: "100%",
    },
}));

const TagEditModal = ({ open, onClose }) => {
    const wsId = useSelector((state) => state.workspace.activeWorkspace?.wsId);
    const [tags, setTags] = useState([]);
    const [largeTags, setLargeTags] = useState([]);
    const [mediumTags, setMediumTags] = useState([]);
    const [smallTags, setSmallTags] = useState([]);

    const [selectedLargeTag, setSelectedLargeTag] = useState(null);
    const [selectedMediumTag, setSelectedMediumTag] = useState(null);
    const [selectedSmallTag, setSelectedSmallTag] = useState(null);
    const [newTagName, setNewTagName] = useState("");
    const [tagColor, setTagColor] = useState("#000000"); // 🎨 기본 색상
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null); // 색상 선택기 위치 상태
    const [currentTagName, setCurrentTagName] = useState(""); // ✅ 기존 태그명 저장
    const [isLoading, setIsLoading] = useState(false);
    
    // 스낵바 상태 추가
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 스낵바 닫기 함수
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // ✅ 태그 목록 가져오기
    useEffect(() => {
        if (wsId && open) {
            setIsLoading(true);
            fetchAllTags(wsId).then((response) => {
                console.log("📌 전체 태그 데이터 로드됨:", response);
                if (response && response.largeTags) {
                    setLargeTags(response.largeTags);
                }
                if (response && response.mediumTags) {
                    setMediumTags(response.mediumTags);
                }
                if (response && response.smallTags) {
                    setSmallTags(response.smallTags);
                }
                setIsLoading(false);
            }).catch(error => {
                console.error("❌ 태그 데이터 불러오기 실패:", error);
                setLargeTags([]);
                setMediumTags([]);
                setSmallTags([]);
                setIsLoading(false);
                setSnackbar({
                    open: true,
                    message: "태그 목록을 불러오는데 실패했습니다.",
                    severity: "error"
                });
            });
        }
    }, [wsId, open]);

    // ✅ 대분류 태그 선택 시 색상 설정
    useEffect(() => {
        if (selectedLargeTag) {
            setTagColor(selectedLargeTag.tagColor || "#000000");
            setCurrentTagName(selectedLargeTag.tagName || "");  // ✅ 기존 태그명 저장
            setMediumTags([]);
            setSmallTags([]);
            setSelectedMediumTag(null);
            setSelectedSmallTag(null);
        }
    }, [selectedLargeTag]);

    // ✅ 중분류 태그 필터링 (선택된 대분류의 중분류만 표시)
    useEffect(() => {
        if (selectedLargeTag) {
            setMediumTags(mediumTags.filter(tag => tag.largeTagNumber === selectedLargeTag.largeTagNumber));
            setSelectedMediumTag(null);
            setSelectedSmallTag(null);
        } else {
            setMediumTags([]);
        }
    }, [selectedLargeTag]);


    // ✅ 소분류 태그 필터링
    useEffect(() => {
        if (selectedMediumTag) {
            setSmallTags(tags.filter(tag => tag.mediumTagNumber === selectedMediumTag.mediumTagNumber && tag.smallTagNumber !== null));
            setSelectedSmallTag(null);
        } else {
            setSmallTags([]);
        }
    }, [selectedMediumTag, tags]);

    // ✅ 태그 수정 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTagName.trim()) {
            setSnackbar({
                open: true,
                message: "새로운 태그명을 입력하세요.",
                severity: "error"
            });
            return;
        }

        let tagId, tagType;
        if (selectedSmallTag) {
            tagId = selectedSmallTag.smallTagNumber;
            tagType = "small";
        } else if (selectedMediumTag) {
            tagId = selectedMediumTag.mediumTagNumber;
            tagType = "medium";
        } else if (selectedLargeTag) {
            tagId = selectedLargeTag.largeTagNumber;
            tagType = "large";
        } else {
            setSnackbar({
                open: true,
                message: "수정할 태그를 선택하세요.",
                severity: "error"
            });
            return;
        }

        setIsLoading(true);

        try {
            if (tagType === "large") {
                await updateLargeTag(wsId, selectedLargeTag.largeTagNumber, currentTagName, newTagName, tagColor);
            } else if (tagType === "medium") {
                await updateMediumTag(selectedLargeTag.largeTagNumber, tagId, newTagName);
            } else if (tagType === "small") {
                await updateSmallTag(selectedMediumTag.mediumTagNumber, tagId, newTagName);
            }

            setSnackbar({
                open: true,
                message: "태그가 성공적으로 수정되었습니다.",
                severity: "success"
            });
            
            // 업데이트된 태그 목록 가져오기
            const updatedTags = await fetchAllTags(wsId);
            console.log("업데이트된 태그 데이터:", updatedTags);
            
            // 응답 데이터 구조 확인 후 적절히 처리
            if (updatedTags) {
                if (updatedTags.largeTags) {
                    setLargeTags(updatedTags.largeTags);
                }
                if (updatedTags.mediumTags) {
                    setMediumTags(updatedTags.mediumTags);
                }
                if (updatedTags.smallTags) {
                    setSmallTags(updatedTags.smallTags);
                }
                // 태그 배열 구조인 경우 처리
                if (Array.isArray(updatedTags)) {
                    setTags(updatedTags);
                }
            }

            // 폼 초기화
            setSelectedLargeTag(null);
            setSelectedMediumTag(null);
            setSelectedSmallTag(null);
            setNewTagName("");
            
            // 모달 닫기 검토
            // onClose();
        } catch (error) {
            console.error("태그 수정 중 오류:", error);
            setSnackbar({
                open: true,
                message: "태그 수정 중 오류가 발생했습니다.",
                severity: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ 태그 삭제 처리 (삭제 기능 추가)
    const handleDelete = async () => {
        let tagId, tagType;
        if (selectedSmallTag) {
            tagId = selectedSmallTag.smallTagNumber;
            tagType = "small";
        } else if (selectedMediumTag) {
            tagId = selectedMediumTag.mediumTagNumber;
            tagType = "medium";
        } else if (selectedLargeTag) {
            tagId = selectedLargeTag.largeTagNumber;
            tagType = "large";
        } else {
            setSnackbar({
                open: true,
                message: "삭제할 태그를 선택하세요.",
                severity: "error"
            });
            return;
        }

        if (!window.confirm(`정말 ${tagType} 태그를 삭제하시겠습니까?`)) return;

        setIsLoading(true);

        try {
            if (tagType === "large") {
                await deleteLargeTag(tagId);
            } else if (tagType === "medium") {
                await deleteMediumTag(tagId);
            } else if (tagType === "small") {
                await deleteSmallTag(tagId);
            }

            setSnackbar({
                open: true,
                message: "태그가 성공적으로 삭제되었습니다.",
                severity: "success"
            });
            
            // 업데이트된 태그 목록 가져오기
            const updatedTags = await fetchAllTags(wsId);
            console.log("삭제 후 업데이트된 태그 데이터:", updatedTags);
            
            // 응답 데이터 구조 확인 후 적절히 처리
            if (updatedTags) {
                if (updatedTags.largeTags) {
                    setLargeTags(updatedTags.largeTags);
                }
                if (updatedTags.mediumTags) {
                    setMediumTags(updatedTags.mediumTags);
                }
                if (updatedTags.smallTags) {
                    setSmallTags(updatedTags.smallTags);
                }
                // 태그 배열 구조인 경우 처리
                if (Array.isArray(updatedTags)) {
                    setTags(updatedTags);
                }
            }

            // 폼 초기화
            setSelectedLargeTag(null);
            setSelectedMediumTag(null);
            setSelectedSmallTag(null);
            setNewTagName("");
            
            // 모달 닫기 검토
            // onClose();
        } catch (error) {
            console.error("태그 삭제 중 오류:", error);
            setSnackbar({
                open: true,
                message: "태그 삭제 중 오류가 발생했습니다.",
                severity: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="600">태그 수정 및 삭제</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <form onSubmit={handleSubmit}>
                    {/* ✅ 대분류 태그 선택 */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>대분류 태그 선택</InputLabel>
                        <Select value={selectedLargeTag || ""} onChange={(e) => setSelectedLargeTag(e.target.value)}>
                            {largeTags.map(tag => (
                                <MenuItem key={tag.largeTagNumber} value={tag}>
                                    {/* {tag.tagName} */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: tag.tagColor }}></Box>
                                        {tag.tagName}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* ✅ 태그 색상 선택 (대분류 태그일 경우) */}
                    {selectedLargeTag && (
                        <Box mt={2}>
                            <Typography variant="subtitle2">태그 색상 선택</Typography>
                            <Button
                                variant="outlined"
                                onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                                sx={{
                                    minWidth: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    bgcolor: tagColor,
                                    border: "2px solid gray"
                                }}
                            />
                            <Popover
                                open={Boolean(colorPickerAnchor)}
                                anchorEl={colorPickerAnchor}
                                onClose={() => setColorPickerAnchor(null)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            >
                                <SketchPicker
                                    color={tagColor}
                                    onChangeComplete={(color) => setTagColor(color.hex)}
                                />
                            </Popover>
                        </Box>
                    )}

                    {/* ✅ 중분류 태그 선택 */}
                    {selectedLargeTag && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>중분류 태그 선택</InputLabel>
                            <Select value={selectedMediumTag || ""} onChange={(e) => setSelectedMediumTag(e.target.value)}>
                                {mediumTags.map(tag => (
                                    <MenuItem key={tag.mediumTagNumber} value={tag}>{tag.mediumTagName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* ✅ 소분류 태그 선택 */}
                    {selectedMediumTag && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>소분류 태그 선택</InputLabel>
                            <Select value={selectedSmallTag || ""} onChange={(e) => setSelectedSmallTag(e.target.value)}>
                                {smallTags.map(tag => (
                                    <MenuItem key={tag.smallTagNumber} value={tag}>{tag.smallTagName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* ✅ 새로운 태그명 입력 */}
                    <TextField
                        fullWidth
                        label="새로운 태그명"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        sx={{ mt: 2 }}
                    />

                    <Box display="flex" justifyContent="space-between" mt={3}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{ bgcolor: "#7C3AED" }}
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "수정하기"}
                        </Button>
                        <Button 
                            variant="contained" 
                            sx={{ bgcolor: "#E53E3E" }} 
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "삭제하기"}
                        </Button>
                    </Box>
                </form>
            </StyledDialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default TagEditModal;
