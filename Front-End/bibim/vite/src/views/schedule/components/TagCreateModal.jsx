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
import { fetchLargeTags, fetchMediumTags, createTag } from "../../../api/tag";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        width: "100%",
    },
}));

const TagCreateModal = ({ open, onClose }) => {
    const wsId = useSelector((state) => state.workspace.activeWorkspace?.wsId);

    const [formData, setFormData] = useState({
        tagName: "",
        tagType: "large", // 기본값: 대분류
        parentTag: "",
        subParentTag: "",
    });

    const [largeTags, setLargeTags] = useState([]);
    const [mediumTags, setMediumTags] = useState([]);

    // ✅ 대분류 태그 가져오기
    useEffect(() => {
        if (wsId && open) {
            fetchLargeTags(wsId).then((data) => {
                if (Array.isArray(data)) {
                    console.log("📌 대분류 태그 불러오기 성공:", data);
                    setLargeTags(data);
                }
            }).catch(error => console.error("❌ 대분류 태그 불러오기 실패:", error));
        }
    }, [wsId, open]);

    // ✅ 중분류 태그 가져오기
    useEffect(() => {
        if (wsId && formData.parentTag) {
            console.log("📌 중분류 태그 요청 (대분류 선택됨):", formData.parentTag);
            fetchMediumTags(wsId, formData.parentTag).then((data) => {
                if (Array.isArray(data)) {
                    console.log("📌 중분류 태그 불러오기 성공:", data);
                    setMediumTags(data);
                }
            }).catch(error => console.error("❌ 중분류 태그 불러오기 실패:", error));
        }
    }, [wsId, formData.parentTag]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.tagName) {
            alert("태그명을 입력해주세요.");
            return;
        }

        if (formData.tagType === "medium" && !formData.parentTag) {
            alert("중분류 태그를 생성하려면 대분류 태그를 선택해야 합니다.");
            return;
        }

        if (formData.tagType === "small" && (!formData.parentTag || !formData.subParentTag)) {
            alert("소분류 태그를 생성하려면 대분류 및 중분류 태그를 선택해야 합니다.");
            return;
        }

        try {
            await createTag(wsId, formData);
            alert("태그가 생성되었습니다.");
            onClose();
            setFormData({ tagName: "", tagType: "large", parentTag: "", subParentTag: "" });
        } catch (error) {
            alert("태그 생성 중 오류가 발생했습니다.");
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                    태그 생성
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="태그명*"
                    value={formData.tagName}
                    onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                    sx={{ mt: 2 }}
                />

                {/* ✅ 태그 종류 선택 */}
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

                {/* ✅ 중분류 태그 생성 시 대분류 선택 */}
                {formData.tagType === "medium" && (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>상위 태그 (대분류)</InputLabel>
                        <Select
                            value={formData.parentTag || ""}
                            onChange={(e) => {
                                console.log("📌 대분류 태그 선택됨:", e.target.value);
                                setFormData((prev) => ({ ...prev, parentTag: e.target.value }));
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

                <Button type="submit" variant="contained" sx={{ mt: 3, bgcolor: "#7C3AED" }}>
                    생성하기
                </Button>
            </form>
        </StyledDialog>
    );
};

export default TagCreateModal;
