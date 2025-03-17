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
    Chip,
    Grid,
    Divider,
    Alert,
    CircularProgress,
    Popover
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check"; // ✔️ 체크 아이콘 추가
import { SketchPicker } from "react-color"; // 🎨 색상 선택기 추가
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { fetchLargeTags, fetchMediumTags, fetchSmallTags, createTag } from "../../../api/tag";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "700px",
        width: "100%",
    },
}));

// 🎨 기본 색상 팔레트 (6가지 색상)
const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFB533", "#8D33FF"];

const TagCreateModal = ({ open, onClose }) => {
    const wsId = useSelector((state) => state.workspace.activeWorkspace?.wsId);

    const [formData, setFormData] = useState({
        tagName: "",
        tagType: "large", // 기본값: 대분류
        parentTag: "",
        subParentTag: "",
        tagColor: colorPalette[0], // 기본 색상
    });

    const [largeTags, setLargeTags] = useState([]);
    const [mediumTags, setMediumTags] = useState([]);
    const [smallTags, setSmallTags] = useState([]);
    const [existingTags, setExistingTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가
    const [isCreating, setIsCreating] = useState(false); // ✅ 생성 버튼 로딩 상태
    const [errorMessage, setErrorMessage] = useState("");
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null); // 색상 선택기 위치 상태

    // ✅ 대분류 태그 가져오기
    useEffect(() => {
        if (wsId && open) {
            setIsLoading(true);
            fetchLargeTags(wsId).then((data) => {
                if (Array.isArray(data)) {
                    console.log("📌 대분류 태그 불러오기 성공:", data);
                    setLargeTags(data);
                }
            }).catch(error => console.error("❌ 대분류 태그 불러오기 실패:", error))
                .finally(() => setIsLoading(false));
        }
    }, [wsId, open]);

    // ✅ 중분류 태그 가져오기
    useEffect(() => {
        if (wsId && formData.parentTag) {
            setIsLoading(true);
            console.log("📌 중분류 태그 요청 (대분류 선택됨):", formData.parentTag);
            fetchMediumTags(wsId, formData.parentTag).then((data) => {
                if (Array.isArray(data)) {
                    console.log("📌 중분류 태그 불러오기 성공:", data);
                    setMediumTags(data);
                }
            }).catch(error => console.error("❌ 중분류 태그 불러오기 실패:", error))
                .finally(() => setIsLoading(false));
        }
    }, [wsId, formData.parentTag]);

    // ✅ 소분류 태그 가져오기 (중분류 태그 선택 시)
    useEffect(() => {
        if (wsId && formData.parentTag && formData.subParentTag) {
            setIsLoading(true);
            fetchSmallTags(wsId, formData.parentTag, formData.subParentTag)
                .then((data) => {
                    setSmallTags(data || []);
                    console.log("소분류", data);
                })
                .catch(error => console.error("❌ 소분류 태그 불러오기 실패:", error))
                .finally(() => setIsLoading(false));
        }
    }, [wsId, formData.parentTag, formData.subParentTag]);

    // ✅ 태그 종류 변경 시 기존 태그 리스트 업데이트
    useEffect(() => {
        if (formData.tagType === "large") {
            setExistingTags(largeTags);
        } else if (formData.tagType === "medium") {
            setExistingTags(mediumTags);
        } else if (formData.tagType === "small") {
            setExistingTags(smallTags);
        }
    }, [formData.tagType, largeTags, mediumTags, smallTags]);

    // ✅ 태그명 중복 확인
    const handleTagNameChange = (e) => {
        const tagName = e.target.value.trim();
        setFormData({ ...formData, tagName });

        if (existingTags.some(tag => tag.tagName === tagName)) {
            setErrorMessage("이미 존재하는 태그명입니다.");
        } else {
            setErrorMessage("");
        }
    };

    // ✅ 태그 생성
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tagName || isCreating) return;

        setIsCreating(true); // ✅ 버튼 비활성화 및 로딩 중 표시

        // ✅ 부모 태그 정보 확인 (비동기 업데이트 방지)
        let updatedParentTag = formData.parentTag;
        let updatedSubParentTag = formData.subParentTag;

        if (formData.tagType === "medium" && !updatedParentTag) {
            alert("🚨 중분류 태그를 생성하려면 대분류 태그를 선택해야 합니다.");
            setIsCreating(false);
            return;
        }

        if (formData.tagType === "small" && (!updatedParentTag || !updatedSubParentTag)) {
            alert("🚨 소분류 태그를 생성하려면 대분류 및 중분류 태그를 선택해야 합니다.");
            setIsCreating(false);
            return;
        }

        const tagData = {
            wsId,
            tagName: formData.tagName,
            tagType: formData.tagType,
            ...(formData.tagType === "large" && { tagColor: formData.tagColor }),
            ...(formData.tagType === "medium" && { largeTagNumber: updatedParentTag }),
            ...(formData.tagType === "small" && {
                largeTagNumber: updatedParentTag,
                mediumTagNumber: updatedSubParentTag
            })
        };

        console.log("📌 최종 API 요청 데이터:", tagData); // ✅ 디버깅용 로그

        try {
            // await createTag(wsId, formData);
            await createTag(wsId, tagData);
            alert("태그가 생성되었습니다.");
            onClose();
            setFormData({
                tagName: "",
                tagType: "large",
                parentTag: "",
                subParentTag: "",
                tagColor: colorPalette[0],
                isCustomColor: false,
            });
            setErrorMessage("");
        } catch (error) {
            setErrorMessage("태그 생성 중 오류가 발생했습니다.");
        } finally {
            setIsCreating(false); // ✅ 로딩 종료 후 버튼 활성화
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h3" fontWeight="600">
                    태그 생성
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <Grid container spacing={2}>
                {/* 왼쪽: 태그 생성 입력 폼 */}
                <Grid item xs={5}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="태그명*"
                            value={formData.tagName}
                            onChange={handleTagNameChange}
                            sx={{ mt: 2 }}
                            error={!!errorMessage}
                            helperText={errorMessage}
                        />

                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>태그 종류</InputLabel>
                            <Select
                                value={formData.tagType}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    tagType: e.target.value,
                                    parentTag: "",
                                    subParentTag: ""
                                })}
                            >
                                <MenuItem value="large">대분류</MenuItem>
                                <MenuItem value="medium">중분류</MenuItem>
                                <MenuItem value="small">소분류</MenuItem>
                            </Select>
                        </FormControl>

                        {/* 🎨 대분류 태그일 때만 색상 선택 가능 */}
                        {formData.tagType === "large" && (
                            <Box mt={2}>
                                <Typography variant="subtitle2" gutterBottom>
                                    태그 색상 선택
                                </Typography>
                                <Box display="flex" gap={1} alignItems="center">
                                    {/* 🎨 기본 색상 버튼 */}
                                    {colorPalette.map((color) => (
                                        <Button
                                            key={color}
                                            sx={{
                                                bgcolor: color,
                                                width: 30,
                                                height: 30,
                                                minWidth: 0,
                                                borderRadius: "50%",
                                                border: formData.tagColor === color ? "3px solid black" : "none",
                                                position: "relative"
                                            }}
                                            onClick={() => setFormData({ ...formData, tagColor: color })}
                                        >
                                            {formData.tagColor === color && !formData.isCustomColor && (
                                                <CheckIcon sx={{ color: "white", fontSize: 18 }} />
                                            )}
                                        </Button>
                                    ))}
                                    {/* 🎨 색상 선택기 버튼 */}
                                    {/* <Button
                                        variant="outlined"
                                        onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                                        sx={{ minWidth: 30, height: 30, borderRadius: "50%", bgcolor: formData.tagColor }}
                                    >
                                        {formData.tagColor === color && (
                                            <CheckIcon sx={{ color: "white", fontSize: 18 }} />
                                        )}
                                    </Button> */}
                                </Box>

                                <Divider sx={{ my: 2 }} /> {/* 📌 구분선 추가 */}
                                <Typography variant="subtitle2" gutterBottom>
                                    🎨 사용자 지정 색상
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                                    sx={{
                                        minWidth: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        bgcolor: formData.tagColor,
                                        border: formData.isCustomColor ? "3px solid black" : "2px dashed gray",
                                        position: "relative"
                                    }}
                                >
                                    {formData.isCustomColor && <CheckIcon sx={{ color: "white", fontSize: 18 }} />}
                                </Button>

                            </Box>
                        )}

                        {/* 🎨 색상 선택기 (Popover) */}
                        <Popover
                            open={Boolean(colorPickerAnchor)}
                            anchorEl={colorPickerAnchor}
                            onClose={() => setColorPickerAnchor(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        >
                            <SketchPicker
                                color={formData.tagColor}
                                onChangeComplete={(color) => setFormData({
                                    ...formData,
                                    tagColor: color.hex,
                                    isCustomColor: true
                                })}
                            />
                        </Popover>

                        {/* ✅ 중분류 태그 선택 */}
                        {formData.tagType === "medium" && (
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>상위 태그 (대분류)</InputLabel>
                                <Select
                                    value={formData.parentTag || ""}
                                    onChange={(e) => setFormData({ ...formData, parentTag: e.target.value })}
                                    disabled={largeTags.length === 0}
                                >
                                    {largeTags.map(tag => (
                                        <MenuItem key={tag.largeTagNumber} value={tag.largeTagNumber}>
                                            {tag.tagName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* ✅ 소분류 태그 생성 시 대/중분류 선택 */}
                        {formData.tagType === "small" && (
                            <>
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>상위 태그 (대분류)</InputLabel>
                                    <Select
                                        value={formData.parentTag || ""}
                                        onChange={(e) => {
                                            console.log("📌 대분류 태그 선택됨:", e.target.value);
                                            setFormData((prev) => ({ ...prev, parentTag: e.target.value, subParentTag: "" }));
                                        }}
                                        disabled={largeTags.length === 0}
                                    >
                                        {largeTags.map(tag => (
                                            <MenuItem key={tag.largeTagNumber} value={tag.largeTagNumber}>
                                                {tag.tagName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>상위 태그 (중분류)</InputLabel>
                                    <Select
                                        value={formData.subParentTag || ""}
                                        onChange={(e) => {
                                            console.log("📌 중분류 태그 선택됨:", e.target.value);
                                            setFormData((prev) => ({ ...prev, subParentTag: e.target.value }));
                                        }}
                                        disabled={!formData.parentTag || mediumTags.length === 0}
                                    >
                                        {mediumTags.map(tag => (
                                            <MenuItem key={tag.mediumTagNumber} value={tag.mediumTagNumber}>
                                                {tag.tagName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 3, bgcolor: "#7C3AED" }}
                            disabled={isCreating} // ✅ 생성 중일 때 비활성화
                            onClick={handleSubmit}
                        >
                            {isCreating ? <CircularProgress size={20} sx={{ color: "white" }} /> : "생성하기"}
                        </Button>
                    </form>
                </Grid>

                {/* 구분선 추가 */}
                <Grid item xs={1}>
                    <Divider orientation="vertical" sx={{ height: "100%" }} />
                </Grid>

                {/* 오른쪽: 현재 생성된 태그 리스트 */}
                <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        현재 생성된 {formData.tagType === "large" ? "대분류" : formData.tagType === "medium" ? "중분류" : "소분류"} 태그
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
                        {isLoading ? (
                            <Box display="flex" alignItems="center">
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                <Typography>태그 불러오는 중...</Typography>
                            </Box>
                        ) : existingTags.length > 0 ? (
                            existingTags.map(tag => (
                                // <Chip key={tag.id} label={tag.tagName} color="primary" variant="outlined" />
                                <Chip
                                    key={tag.largeTagNumber}
                                    label={tag.tagName}
                                    sx={{
                                        backgroundColor: tag.tagColor ? tag.tagColor : "default",
                                        color: tag.tagColor ? "white" : "black", // 배경색이 있을 경우 글씨색을 흰색으로 변경
                                        border: tag.tagColor ? `1px solid ${tag.tagColor}` : "1px solid #ccc",
                                        // fontWeight: "bold"
                                    }}
                                />
                            ))
                        ) : (
                            <Typography color="textSecondary">등록된 태그가 없습니다.</Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </StyledDialog>
    );
};

export default TagCreateModal;
