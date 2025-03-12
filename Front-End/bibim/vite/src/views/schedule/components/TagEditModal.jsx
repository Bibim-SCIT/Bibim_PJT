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
import { fetchLargeTags, fetchMediumTags, fetchSmallTags, updateTag } from "../../../api/tag";

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
    const [selectedTag, setSelectedTag] = useState(null);
    const [newTagName, setNewTagName] = useState("");
    
    const [largeTags, setLargeTags] = useState([]);
    const [mediumTags, setMediumTags] = useState([]);
    const [smallTags, setSmallTags] = useState([]);

    useEffect(() => {
        if (wsId && open) {
            fetchLargeTags(wsId).then(setLargeTags);
        }
    }, [wsId, open]);

    useEffect(() => {
        if (wsId && selectedTag?.type === "medium" && selectedTag?.parentId) {
            fetchMediumTags(wsId, selectedTag.parentId).then(setMediumTags);
        }
    }, [wsId, selectedTag]);

    useEffect(() => {
        if (wsId && selectedTag?.type === "small" && selectedTag?.parentId && selectedTag?.subParentId) {
            fetchSmallTags(wsId, selectedTag.parentId, selectedTag.subParentId).then(setSmallTags);
        }
    }, [wsId, selectedTag]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTag || !newTagName) {
            alert("수정할 태그와 새로운 이름을 입력하세요.");
            return;
        }

        try {
            await updateTag(selectedTag.type, selectedTag.id, newTagName);
            alert("태그가 수정되었습니다.");
            onClose();
            setSelectedTag(null);
            setNewTagName("");
        } catch (error) {
            alert("태그 수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                    태그 수정
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>수정할 태그 선택</InputLabel>
                    <Select
                        value={selectedTag?.id || ""}
                        onChange={(e) => {
                            const tag = largeTags.find(tag => tag.tagNumber === e.target.value) ||
                                         mediumTags.find(tag => tag.tagNumber === e.target.value) ||
                                         smallTags.find(tag => tag.tagNumber === e.target.value);
                            if (tag) {
                                setSelectedTag({
                                    id: tag.tagNumber,
                                    name: tag.tagName,
                                    type: tag.largeTagNumber ? "large" : tag.mediumTagNumber ? "medium" : "small",
                                    parentId: tag.largeTagNumber || null,
                                    subParentId: tag.mediumTagNumber || null,
                                });
                            }
                        }}
                    >
                        {largeTags.map(tag => (
                            <MenuItem key={tag.tagNumber} value={tag.tagNumber}>{tag.tagName} (대분류)</MenuItem>
                        ))}
                        {mediumTags.map(tag => (
                            <MenuItem key={tag.tagNumber} value={tag.tagNumber}>{tag.tagName} (중분류)</MenuItem>
                        ))}
                        {smallTags.map(tag => (
                            <MenuItem key={tag.tagNumber} value={tag.tagNumber}>{tag.tagName} (소분류)</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label="새로운 태그명"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    sx={{ mt: 2 }}
                />

                <Button type="submit" variant="contained" sx={{ mt: 3, bgcolor: "#7C3AED" }}>
                    수정하기
                </Button>
            </form>
        </StyledDialog>
    );
};

export default TagEditModal;
