import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // 미배정
import PlayCircleIcon from '@mui/icons-material/PlayCircle'; // 진행 중
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // 완료
import PauseCircleIcon from '@mui/icons-material/PauseCircle'; // 보류
import { styled } from '@mui/material/styles';
import { getSchedule, deleteSchedule } from '../../../api/schedule';
import MyScheduleEditModal from './MyScheduleEditModal';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '550px',
    width: '100%',
    backgroundColor: theme.palette.background.default,
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: theme.palette.grey[100],
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '12px',
}));

const statusMapping = {
  UNASSIGNED: { label: "미배정", icon: <HourglassEmptyIcon />, color: "default" },
  IN_PROGRESS: { label: "진행 중", icon: <PlayCircleIcon />, color: "primary" },
  COMPLETED: { label: "완료", icon: <CheckCircleIcon />, color: "success" },
  ON_HOLD: { label: "보류", icon: <PauseCircleIcon />, color: "warning" },
};

const MyScheduleDetailModal = ({ schedule, open, onClose, onUpdate, onDeleteSuccess }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 스낵바 상태
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 스케줄 정보 업데이트
  useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  // 모달이 열릴 때마다 최신 데이터 가져오기
  useEffect(() => {
    if (open && schedule?.scheduleNumber) {
      setLoading(true);
      console.log(`최신 스케줄 데이터 다시 불러오기: scheduleNumber=${schedule.scheduleNumber}`);

      getSchedule(schedule.scheduleNumber)
        .then((updatedSchedule) => {
          console.log("최신 스케줄 데이터 가져옴:", updatedSchedule);
          setLocalSchedule(updatedSchedule.data);
        })
        .catch((error) => {
          console.error("스케줄 데이터를 불러오지 못함:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, schedule]);

  if (!localSchedule) return null;

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 수정 모달 열기
  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  // 스케줄 업데이트 핸들러
  const handleScheduleUpdate = (updatedSchedule) => {
    setLocalSchedule(updatedSchedule);
    if (onUpdate) {
      onUpdate(updatedSchedule);
    }
    setEditModalOpen(false);
  };

  // 스케줄 삭제 핸들러
  const handleDeleteSchedule = async () => {
    if (!localSchedule.scheduleNumber) return;
    setIsDeleting(true);

    try {
      await deleteSchedule(localSchedule.scheduleNumber);

      // 스낵바를 먼저 띄우고, 모달을 닫는 것을 약간 지연
      setSnackbar({
        open: true,
        message: '일정이 삭제되었습니다.',
        severity: 'success'
      });

      // 500ms 후 모달 닫기 (스낵바가 먼저 뜨도록)
      setTimeout(() => {
        onClose();

        // 부모 컴포넌트에도 삭제 성공 알림
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      }, 500);

    } catch (error) {
      console.error("일정 삭제 실패:", error);
      setSnackbar({
        open: true,
        message: '일정 삭제에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 스낵바 닫기 핸들러
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // 상태값에 따른 아이콘과 라벨 가져오기
  const scheduleStatus = statusMapping[localSchedule.scheduleStatus] || { label: "알 수 없음", icon: null, color: "default" };

  return (
    <>
      <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* 모달 헤더 */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" fontWeight="bold">내 일정 상세 정보</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 스케줄 정보 */}
        <DialogContent>
          {/* 로딩 중일 때 표시 */}
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>로딩 중...</Typography>
            </Box>
          ) : (
            <>
              <Typography color="textSecondary" sx={{ mb: 2, fontSize: '12px' }}>
                마지막 수정: {formatDate(localSchedule.scheduleModifytime)}
              </Typography>

              <InfoBox>
                <Typography fontWeight="600" minWidth="80px">제목</Typography>
                <Typography>{localSchedule.scheduleTitle}</Typography>
              </InfoBox>

              {/* 워크스페이스 정보 - Paper로 눈에 띄게 표시 */}
              <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff' }}>
                <Typography fontWeight="600" minWidth="80px">워크스페이스</Typography>
                <Typography>{localSchedule.wsName || '정보 없음'}</Typography>
              </Paper>

              <InfoBox>
                <Typography fontWeight="600" minWidth="80px">상태</Typography>
                <Chip
                  icon={scheduleStatus.icon}
                  label={scheduleStatus.label}
                  color={scheduleStatus.color}
                  variant="outlined"
                />
              </InfoBox>

              <InfoBox>
                <Typography fontWeight="600" minWidth="80px">시작일</Typography>
                <Typography>{formatDate(localSchedule.scheduleStartDate)}</Typography>
              </InfoBox>

              <InfoBox>
                <Typography fontWeight="600" minWidth="80px">완료일</Typography>
                <Typography>{formatDate(localSchedule.scheduleFinishDate)}</Typography>
              </InfoBox>

              <InfoBox>
                <Typography fontWeight="600" minWidth="80px">내용</Typography>
                <Typography>{localSchedule.scheduleContent || "내용이 없습니다."}</Typography>
              </InfoBox>

              <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                {localSchedule.tag1 && <Chip label={`# ${localSchedule.tag1}`} color="primary" />}
                {localSchedule.tag2 && <Chip label={`# ${localSchedule.tag2}`} color="secondary" />}
                {localSchedule.tag3 && <Chip label={`# ${localSchedule.tag3}`} color="success" />}
              </Box>

              <Box display="flex" justifyContent="center" gap={2} mt={3}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{
                    minWidth: '140px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: "#1976d2",
                    "&:hover": { backgroundColor: "#1565c0" },
                  }}
                >
                  수정하기
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSchedule}
                  disabled={isDeleting}
                  sx={{
                    minWidth: '140px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {isDeleting ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      삭제 중...
                    </>
                  ) : (
                    "삭제하기"
                  )}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </StyledDialog>

      {/* 삭제 성공/실패 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 수정 모달 */}
      {editModalOpen && (
        <MyScheduleEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          scheduleData={localSchedule}
          onUpdate={handleScheduleUpdate}
        />
      )}
    </>
  );
};

export default MyScheduleDetailModal; 