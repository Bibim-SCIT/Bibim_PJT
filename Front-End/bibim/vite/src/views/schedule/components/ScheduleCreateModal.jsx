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
    Snackbar,
    Alert,
    Modal,
    Divider,
    CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { createSchedule } from "../../../api/schedule"; // ✅ 일정 생성 API 추가
import { useSelector } from "react-redux"; // ✅ Redux에서 현재 워크스페이스 가져오기

// 태그 API 함수 import 추가
import { fetchLargeTags, fetchMediumTags, fetchSmallTags } from "../../../api/tag";

// 모달 스타일 정의
const style = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 24,
    p: 0,
    position: 'relative',
    outline: 'none',
    maxHeight: '90vh',
    overflow: 'auto'
};

const ScheduleCreateModal = ({ open, onClose, onCreateSuccess }) => {
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

    const [isCreating, setIsCreating] = useState(false); // ✅ 생성 중 상태 추가

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

    // 태그 상태 관리
    const [largeTags, setLargeTags] = useState([]);
    const [mediumTags, setMediumTags] = useState([]);
    const [smallTags, setSmallTags] = useState([]);

    // 스낵바 상태 추가
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 모달이 열릴 때 대분류 태그 가져오기
    useEffect(() => {
        if (open && activeWorkspace?.wsId) {
            fetchLargeTags(activeWorkspace.wsId)
                .then((tags) => setLargeTags(tags))
                .catch((error) => console.error("대분류 태그 fetch 실패:", error));
        }
    }, [open, activeWorkspace]);

    console.log("대분류태그 함보자", largeTags);

    // 대분류 선택 시 중분류 태그 가져오기
    useEffect(() => {
        if (formData.tag1 && activeWorkspace?.wsId) {
            // formData.tag1은 tagName이므로, 해당 tag의 tagNumber 찾기
            const selectedLargeTag = largeTags.find(tag => tag.tagName === formData.tag1);
            if (selectedLargeTag) {
                console.log("대분류에서 중분류로", activeWorkspace.wsId, selectedLargeTag.largeTagNumber);
                fetchMediumTags(activeWorkspace.wsId, selectedLargeTag.largeTagNumber)
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
                console.log("중분류에서 소분류로", activeWorkspace.wsId, selectedLargeTag.largeTagNumber, selectedMediumTag.mediumTagNumber);
                fetchSmallTags(activeWorkspace.wsId, selectedLargeTag.largeTagNumber, selectedMediumTag.mediumTagNumber)
                    .then((tags) => setSmallTags(tags))
                    .catch((error) => console.error("소분류 태그 fetch 실패:", error));
            }
        }
    }, [formData.tag2, formData.tag1, activeWorkspace, largeTags, mediumTags]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.scheduleTitle || !formData.scheduleStartDate || !formData.scheduleFinishDate) {
            // alert("모든 필드를 입력해주세요.");
            setSnackbar({
                open: true,
                message: '모든 필드를 입력해주세요.',
                severity: 'error'
            });
            return;
        }

        if (!activeWorkspace || !activeWorkspace.wsId) {
            // alert("워크스페이스 정보가 없습니다.");
            setSnackbar({
                open: true,
                message: '워크스페이스 정보가 없습니다.',
                severity: 'error'
            });
            return;
        }

        try {
            setIsCreating(true); // ✅ 생성 중 상태 활성화

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

            // await createSchedule(requestData);
            const newSchedule = await createSchedule(requestData); // ✅ 생성된 일정 반환
            console.log("새스케줄", newSchedule);

            // alert("일정이 생성되었습니다.");
            setSnackbar({
                open: true,
                message: '일정이 성공적으로 생성되었습니다.',
                severity: 'success'
            });
            onClose(); // 모달 닫기
            // window.location.reload(); // 페이지 새로고침하여 캘린더 반영

            // ✅ 방법 2: 전체 일정 다시 불러오기 (fetch 요청)
            if (onCreateSuccess) {
                onCreateSuccess(); // SchedulePage에서 fetchScheduleTasks(wsId) 호출
            }

        } catch (error) {
            console.error("❌ 일정 생성 실패:", error);
            // alert("일정 생성 중 오류가 발생했습니다.");
            setSnackbar({
                open: true,
                message: '일정 생성에 실패했습니다.',
                severity: 'error'
            });
        } finally {
            setIsCreating(false); // ✅ 생성 완료 후 버튼 다시 활성화
        }
    };

    // 스낵바 닫기 핸들러
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Box sx={style}>
                    {/* 헤더 영역 */}
                    <Box sx={{ p: 3, pb: 2 }}>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 400,
                                mb: 0
                            }}
                        >
                            일정 생성
                        </Typography>
                    </Box>

                    <Divider sx={{ borderColor: '#e0e0e0' }} />

                    {/* 내용 영역 */}
                    <Box sx={{ p: 3 }}>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="일정 제목"
                                value={formData.scheduleTitle}
                                onChange={(e) => setFormData({ ...formData, scheduleTitle: e.target.value })}
                                sx={{ mb: 2 }}
                                color="secondary"
                            />

                            <TextField
                                fullWidth
                                label="일정 내용"
                                multiline
                                rows={3}
                                value={formData.scheduleContent}
                                onChange={(e) => setFormData({ ...formData, scheduleContent: e.target.value })}
                                sx={{ mb: 2 }}
                                color="secondary"
                            />

                            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="시작일"
                                    type="date"
                                    value={formData.scheduleStartDate}
                                    onChange={(e) => setFormData({ ...formData, scheduleStartDate: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    fullWidth
                                    label="종료일"
                                    type="date"
                                    value={formData.scheduleFinishDate}
                                    onChange={(e) => setFormData({ ...formData, scheduleFinishDate: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>대분류*</InputLabel>
                                <Select
                                    value={formData.tag1}
                                    onChange={(e) => setFormData({ ...formData, tag1: e.target.value, tag2: "", tag3: "" })}
                                >
                                    {largeTags.map((tag) => (
                                        <MenuItem key={tag.tagNumber} value={tag.tagName}>
                                            {/* {tag.tagName} */}
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: tag.tagColor }}></Box>
                                                {tag.tagName}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
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

                            <FormControl fullWidth sx={{ mb: 2 }}>
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
                        </form>
                    </Box>

                    {/* 하단 버튼 영역 */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                        p: 2,
                        bgcolor: '#f8f9fa',
                        borderTop: '1px solid #e0e0e0'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                color: '#666',
                                borderColor: '#d0d0d0',
                                boxShadow: 'none'
                            }}
                        >
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isCreating} // ✅ 생성 중 비활성화
                            sx={{
                                bgcolor: '#7C3AED',
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#6D28D9',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            {isCreating ? (
                                <>
                                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                    생성 중...
                                </>
                            ) : "생성하기"}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* 스낵바 추가 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ScheduleCreateModal;
