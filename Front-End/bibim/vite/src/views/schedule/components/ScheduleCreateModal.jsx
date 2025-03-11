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
import { createSchedule } from "../../../api/schedule"; // ✅ 일정 생성 API 추가
import { useSelector } from "react-redux"; // ✅ Redux에서 현재 워크스페이스 가져오기

// 태그 API 함수 import 추가
import { fetchLargeTags, fetchMediumTags, fetchSmallTags } from "../../../api/tag";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        width: "100%",
    },
}));

const ScheduleCreateModal = ({ open, onClose }) => {
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ 현재 워크스페이스 가져오기

    const [formData, setFormData] = useState({
        scheduleTitle: "",
        scheduleContent: "",
        tag1: "",
        tag2: "",
        tag3: "",
        scheduleStatus: "UNASSIGNED",
        scheduleStartDate: "",
        scheduleFinishDate: "",
    });

    useEffect(() => {
        if (open) {
            setFormData({
                scheduleTitle: "",
                scheduleContent: "",
                tag1: "",
                tag2: "",
                tag3: "",
                scheduleStatus: "UNASSIGNED",
                scheduleStartDate: "",
                scheduleFinishDate: "",
            });
        }
    }, [open]);


    const [largeTags, setLargeTags] = useState([]);
    const [mediumTags, setMediumTags] = useState([]);
    const [smallTags, setSmallTags] = useState([]);

    // 모달이 열릴 때 대분류 태그 가져오기
    useEffect(() => {
        if (open && activeWorkspace?.wsId) {
            fetchLargeTags(activeWorkspace.wsId)
                .then((tags) => setLargeTags(tags))
                .catch((error) => console.error("대분류 태그 fetch 실패:", error));
        }
    }, [open, activeWorkspace]);

    // 대분류 선택 시 중분류 태그 가져오기
    useEffect(() => {
        if (formData.tag1 && activeWorkspace?.wsId) {
            // formData.tag1은 tagName이므로, 해당 tag의 tagNumber 찾기
            const selectedLargeTag = largeTags.find(tag => tag.tagName === formData.tag1);
            if (selectedLargeTag) {
                fetchMediumTags(activeWorkspace.wsId, selectedLargeTag.tagNumber)
                    .then((tags) => setMediumTags(tags))
                    .catch((error) => console.error("중분류 태그 fetch 실패:", error));
            }
        }
    }, [formData.tag1, activeWorkspace, largeTags]);

    // 중분류 선택 시 소분류 태그 가져오기
    useEffect(() => {
        if (formData.tag2 && formData.tag1 && activeWorkspace?.wsId) {
            const selectedLargeTag = largeTags.find(tag => tag.tagName === formData.tag1);
            const selectedMediumTag = mediumTags.find(tag => tag.tagName === formData.tag2);
            if (selectedLargeTag && selectedMediumTag) {
                fetchSmallTags(activeWorkspace.wsId, selectedLargeTag.tagNumber, selectedMediumTag.tagNumber)
                    .then((tags) => setSmallTags(tags))
                    .catch((error) => console.error("소분류 태그 fetch 실패:", error));
            }
        }
    }, [formData.tag2, formData.tag1, activeWorkspace, largeTags, mediumTags]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.scheduleTitle || !formData.scheduleStartDate || !formData.scheduleFinishDate) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (!activeWorkspace || !activeWorkspace.wsId) {
            alert("워크스페이스 정보가 없습니다.");
            return;
        }

        try {
            const requestData = {
                wsId: activeWorkspace.wsId, // ✅ 워크스페이스 ID 추가
                scheduleTitle: formData.scheduleTitle,
                scheduleContent: formData.scheduleContent,
                tag1: formData.tag1,
                tag2: formData.tag2,
                tag3: formData.tag3,
                scheduleStartDate: `${formData.scheduleStartDate}T00:00:00`, // ✅ T00:00:00으로 수정
                scheduleFinishDate: `${formData.scheduleFinishDate}T00:00:00`, // ✅ API 명세서와 일치
            };

            console.log("📌 일정 생성 요청 데이터:", requestData);

            await createSchedule(requestData);

            alert("일정이 생성되었습니다.");
            onClose(); // 모달 닫기
            // window.location.reload(); // 페이지 새로고침하여 캘린더 반영
        } catch (error) {
            console.error("❌ 일정 생성 실패:", error);
            alert("일정 생성 중 오류가 발생했습니다.");
        }
    };


    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                    일정 등록
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <form onSubmit={handleSubmit}>
                {/* ✅ 제목 입력 */}
                <TextField
                    fullWidth
                    label="일정 제목*"
                    value={formData.scheduleTitle}
                    onChange={(e) => setFormData({ ...formData, scheduleTitle: e.target.value })}
                    sx={{ mt: 2 }}
                />

                {/* ✅ 내용 수정 */}
                <TextField
                    fullWidth
                    label="일정 내용"
                    multiline
                    rows={4}
                    value={formData.scheduleContent}
                    onChange={(e) => setFormData({ ...formData, scheduleContent: e.target.value })}
                    sx={{ mt: 2 }}
                />

                {/* ✅ 날짜 입력 */}
                <Typography sx={{ mt: 2, mb: 1 }}>날짜 설정*</Typography>
                <Box display="flex" gap={2}>
                    <TextField
                        type="date"
                        value={formData.scheduleStartDate}
                        onChange={(e) => setFormData({ ...formData, scheduleStartDate: e.target.value })}
                        sx={{ flex: 1 }}
                    />
                    <Typography>~</Typography>
                    <TextField
                        type="date"
                        value={formData.scheduleFinishDate}
                        onChange={(e) => setFormData({ ...formData, scheduleFinishDate: e.target.value })}
                        sx={{ flex: 1 }}
                    />
                </Box>

                {/* ✅ 태그 수정 (대, 중, 소분류) */}
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>대분류*</InputLabel>
                    <Select
                        value={formData.tag1}
                        onChange={(e) => setFormData({ ...formData, tag1: e.target.value, tag2: "", tag3: "" })}
                    >
                        {largeTags.map((tag) => (
                            <MenuItem key={tag.tagNumber} value={tag.tagName}>
                                {tag.tagName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>중분류*</InputLabel>
                    <Select
                        value={formData.tag2}
                        onChange={(e) => setFormData({ ...formData, tag2: e.target.value, tag3: "" })}
                        disabled={!formData.tag1}
                    >
                        {mediumTags.map((tag) => (
                            <MenuItem key={tag.tagNumber} value={tag.tagName}>
                                {tag.tagName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>소분류*</InputLabel>
                    <Select
                        value={formData.tag3}
                        onChange={(e) => setFormData({ ...formData, tag3: e.target.value })}
                        disabled={!formData.tag2}
                    >
                        {smallTags.map((tag) => (
                            <MenuItem key={tag.tagNumber} value={tag.tagName}>
                                {tag.tagName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" variant="contained" sx={{ mt: 3, bgcolor: "#7C3AED" }}>
                    생성하기
                </Button>
            </form>
        </StyledDialog>
    );
};

export default ScheduleCreateModal;
