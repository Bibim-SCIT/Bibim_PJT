import React, { useState, useEffect } from "react";
import {
  Dialog,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { updateSchedule } from "../../../api/schedule";
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

const MyScheduleEditModal = ({ open, onClose, scheduleData, onUpdate }) => {
  const [formData, setFormData] = useState({
    scheduleTitle: "",
    scheduleContent: "",
    tag1: "",
    tag2: "",
    tag3: "",
    scheduleStartDate: "",
    scheduleFinishDate: "",
  });

  const [largeTags, setLargeTags] = useState([]);
  const [mediumTags, setMediumTags] = useState([]);
  const [smallTags, setSmallTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 스낵바 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (scheduleData) {
      setFormData({
        scheduleTitle: scheduleData.scheduleTitle || "",
        scheduleContent: scheduleData.scheduleContent || "",
        tag1: scheduleData.tag1 || "",
        tag2: scheduleData.tag2 || "",
        tag3: scheduleData.tag3 || "",
        scheduleStartDate: scheduleData.scheduleStartDate?.split("T")[0] || "",
        scheduleFinishDate: scheduleData.scheduleFinishDate?.split("T")[0] || "",
      });

      const wsId = scheduleData.wsId;
      if (!wsId) return;

      // 대분류 태그 가져오기
      fetchLargeTags(wsId).then((tags) => {
        setLargeTags(tags);
        if (scheduleData.tag1) {
          const largeTag = tags.find((tag) => tag.tagName === scheduleData.tag1);
          if (largeTag) {
            fetchMediumTags(wsId, largeTag.largeTagNumber).then((medTags) => {
              setMediumTags(medTags);
              if (scheduleData.tag2) {
                const mediumTag = medTags.find((tag) => tag.tagName === scheduleData.tag2);
                if (mediumTag) {
                  fetchSmallTags(wsId, largeTag.largeTagNumber, mediumTag.mediumTagNumber).then(setSmallTags);
                }
              }
            });
          }
        }
      });
    }
  }, [scheduleData]);

  // 중분류 태그 변경 시 소분류 태그 업데이트
  useEffect(() => {
    if (formData.tag1 && formData.tag2) {
      const largeTag = largeTags.find(tag => tag.tagName === formData.tag1);
      const mediumTag = mediumTags.find(tag => tag.tagName === formData.tag2);

      if (largeTag && mediumTag) {
        fetchSmallTags(scheduleData.wsId, largeTag.largeTagNumber, mediumTag.mediumTagNumber).then(setSmallTags);
      }
    }
  }, [formData.tag1, formData.tag2, largeTags, mediumTags]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData?.scheduleNumber) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("일정 수정 요청 시작:", formData);

      const updatedData = {
        scheduleTitle: formData.scheduleTitle,
        scheduleContent: formData.scheduleContent,
        tag1: formData.tag1,
        tag2: formData.tag2,
        tag3: formData.tag3,
        scheduleStartDate: formData.scheduleStartDate
          ? `${formData.scheduleStartDate}T00:00:00`
          : null,
        scheduleFinishDate: formData.scheduleFinishDate
          ? `${formData.scheduleFinishDate}T23:59:59`
          : null,
      };

      console.log("스케줄 수정 요청 데이터:", updatedData);

      await updateSchedule(scheduleData.scheduleNumber, updatedData);

      console.log("스케줄 수정 성공");

      // 성공 스낵바 표시
      setSnackbar({
        open: true,
        message: '일정이 성공적으로 수정되었습니다.',
        severity: 'success'
      });

      // 부모 컴포넌트에 업데이트 알림
      if (onUpdate) {
        onUpdate({ ...scheduleData, ...updatedData });
      }

      // 모달 닫기
      onClose();
    } catch (error) {
      console.error("스케줄 수정 실패:", error);

      // 실패 스낵바 표시
      setSnackbar({
        open: true,
        message: '일정 수정에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
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
              variant="h4"
              sx={{
                fontWeight: 400,
                mb: 0
              }}
            >
              내 일정 수정
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
                required
              />

              <TextField
                fullWidth
                label="일정 내용"
                multiline
                rows={3}
                value={formData.scheduleContent}
                onChange={(e) => setFormData({ ...formData, scheduleContent: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="시작일"
                  type="date"
                  value={formData.scheduleStartDate}
                  onChange={(e) => setFormData({ ...formData, scheduleStartDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  fullWidth
                  label="종료일"
                  type="date"
                  value={formData.scheduleFinishDate}
                  onChange={(e) => setFormData({ ...formData, scheduleFinishDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
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
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                bgcolor: '#7C3AED',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#6D28D9',
                  boxShadow: 'none'
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  저장 중...
                </>
              ) : (
                "수정하기"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>

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

export default MyScheduleEditModal; 