import React, { useState } from "react";
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
import { createSchedule } from "../../../../api/schedule"; // ✅ 일정 생성 API 추가
import { useSelector } from "react-redux"; // ✅ Redux에서 현재 워크스페이스 가져오기

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

    const [largeTags, setLargeTags] = useState([]);
    const [mediumTags, setMediumTags] = useState([]);
    const [smallTags, setSmallTags] = useState([]);

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
                        onChange={(e) => setFormData({ ...formData, tag1: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, tag2: e.target.value })}
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
