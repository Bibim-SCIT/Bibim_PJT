import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import ScheduleEditModal from './ScheduleEditModal';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
  },
}));

const ScheduleDetailModal = ({ schedule, open, onClose, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [localSchedule, setLocalSchedule] = React.useState(schedule);

  React.useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  if (!localSchedule) return null;

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

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleScheduleUpdate = (updatedSchedule) => {
    setLocalSchedule(updatedSchedule);
    onUpdate(updatedSchedule);
    setEditModalOpen(false);
  };

  // ✅ 모달 닫기 시 selectedSchedule을 초기화하지 않고 유지
  const handleClose = () => {
    console.log("📌 모달 닫기 실행됨");
    onClose(); // ✅ 모달만 닫고 기존 데이터 유지
  };

  return (
    <>
      <StyledDialog
        open={open} // ✅ props.open을 기반으로 상태 관리
        onClose={handleClose} // ✅ 수정된 닫기 함수 사용
        maxWidth="sm"
        fullWidth
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">스케줄 보기</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography color="textSecondary" sx={{ mb: 3 }}>
          마지막 수정 시간 : {formatDate(localSchedule.scheduleModifytime)}
        </Typography>

        <Box>
          <Box display="flex" gap={2} mb={2}>
            <Typography fontWeight="500">스케줄 제목:</Typography>
            <Typography>{localSchedule.scheduleTitle}</Typography>
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Typography fontWeight="500">담당자:</Typography>
            {localSchedule.nickname ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={localSchedule.userProfileImage}
                  sx={{ width: 24, height: 24 }}
                />
                <Typography>{localSchedule.nickname}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">담당자가 없습니다</Typography>
            )}
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Typography fontWeight="500">스케줄 시작일:</Typography>
            <Typography>{formatDate(localSchedule.scheduleStartDate)}</Typography>
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Typography fontWeight="500">스케줄 완료일:</Typography>
            <Typography>{formatDate(localSchedule.scheduleFinishDate)}</Typography>
          </Box>

          {localSchedule.scheduleContent && (
            <Box display="flex" gap={2} mb={2}>
              <Typography fontWeight="500">스케줄 내용:</Typography>
              <Typography>{localSchedule.scheduleContent}</Typography>
            </Box>
          )}

          <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
            {localSchedule.tag1 && <Chip label={localSchedule.tag1} size="small" />}
            {localSchedule.tag2 && <Chip label={localSchedule.tag2} size="small" />}
            {localSchedule.tag3 && <Chip label={localSchedule.tag3} size="small" />}
          </Box>

          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{ minWidth: '120px' }}
            >
              수정하기
            </Button>
          </Box>
        </Box>
      </StyledDialog>

      <ScheduleEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        scheduleData={localSchedule}
        onUpdate={handleScheduleUpdate}
      />
    </>
  );
};

export default ScheduleDetailModal;
