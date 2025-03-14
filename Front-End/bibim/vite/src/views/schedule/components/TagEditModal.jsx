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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
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

    // ✅ 태그 목록 가져오기
    useEffect(() => {
        if (wsId && open) {
            fetchAllTags(wsId).then((data) => {
                setTags(data);
                setLargeTags(data.filter(tag => tag.largeTagNumber !== null)); // ✅ 대분류 태그만 필터링
            });
        }
    }, [wsId, open]);

    // ✅ 중분류 태그 필터링
    useEffect(() => {
        if (selectedLargeTag) {
            setMediumTags(tags.filter(tag => tag.largeTagNumber === selectedLargeTag.largeTagNumber && tag.mediumTagNumber !== null));
            setSelectedMediumTag(null);
            setSelectedSmallTag(null);
        } else {
            setMediumTags([]);
        }
    }, [selectedLargeTag, tags]);

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
            alert("새로운 태그명을 입력하세요.");
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
            alert("수정할 태그를 선택하세요.");
            return;
        }

        try {
            if (tagType === "large") {
                await updateLargeTag(wsId, tagId, newTagName);
            } else if (tagType === "medium") {
                await updateMediumTag(selectedLargeTag.largeTagNumber, tagId, newTagName);
            } else if (tagType === "small") {
                await updateSmallTag(selectedMediumTag.mediumTagNumber, tagId, newTagName);
            }

            alert("태그가 수정되었습니다.");
            const updatedTags = await fetchAllTags(wsId);
            setTags(updatedTags);
            setLargeTags(updatedTags.filter(tag => tag.largeTagNumber !== null));

            setSelectedLargeTag(null);
            setSelectedMediumTag(null);
            setSelectedSmallTag(null);
            setNewTagName("");
        } catch (error) {
            alert("태그 수정 중 오류가 발생했습니다.");
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
            alert("삭제할 태그를 선택하세요.");
            return;
        }

        if (!window.confirm(`정말 ${tagType} 태그를 삭제하시겠습니까?`)) return;

        try {
            if (tagType === "large") {
                await deleteLargeTag(tagId);
            } else if (tagType === "medium") {
                await deleteMediumTag(tagId);
            } else if (tagType === "small") {
                await deleteSmallTag(tagId);
            }

            alert("태그가 삭제되었습니다.");
            const updatedTags = await fetchAllTags(wsId);
            setTags(updatedTags);
            setLargeTags(updatedTags.filter(tag => tag.largeTagNumber !== null));

            setSelectedLargeTag(null);
            setSelectedMediumTag(null);
            setSelectedSmallTag(null);
            setNewTagName("");
        } catch (error) {
            alert("태그 삭제 중 오류가 발생했습니다.");
        }
    };

    return (
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
                            <MenuItem key={tag.largeTagNumber} value={tag}>{tag.largeTagName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

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
                    <Button type="submit" variant="contained" sx={{ bgcolor: "#7C3AED" }}>수정하기</Button>
                    <Button variant="contained" sx={{ bgcolor: "#E53E3E" }} onClick={handleDelete}>삭제하기</Button>
                </Box>
            </form>
        </StyledDialog>
    );
};

export default TagEditModal;
