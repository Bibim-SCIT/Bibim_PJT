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
  Divider,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import ScheduleEditModal from './ScheduleEditModal';

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

  return (
    <>
      <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* 모달 헤더 */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" fontWeight="bold">스케줄 상세 정보</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 스케줄 정보 */}
        <DialogContent>
          <Typography color="textSecondary" sx={{ mb: 2, fontSize: '14px' }}>
            마지막 수정: {formatDate(localSchedule.scheduleModifytime)}
          </Typography>

          <InfoBox>
            <Typography fontWeight="600">📌 제목:</Typography>
            <Typography>{localSchedule.scheduleTitle}</Typography>
          </InfoBox>

          {/* 담당자 정보 */}
          <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 2 }}>
            {localSchedule.nickname ? (
              <>
                <Avatar src={localSchedule.userProfileImage} sx={{ width: 40, height: 40 }} />
                <Typography fontWeight="500">{localSchedule.nickname}</Typography>
              </>
            ) : (
              <Typography color="text.secondary">담당자가 지정되지 않았습니다</Typography>
            )}
          </Paper>

          <InfoBox>
            <Typography fontWeight="600">🗓 시작일:</Typography>
            <Typography>{formatDate(localSchedule.scheduleStartDate)}</Typography>
          </InfoBox>

          <InfoBox>
            <Typography fontWeight="600">⏳ 완료일:</Typography>
            <Typography>{formatDate(localSchedule.scheduleFinishDate)}</Typography>
          </InfoBox>

          <InfoBox>
            <Typography fontWeight="600">📄 내용:</Typography>
            <Typography>{localSchedule.scheduleContent || "내용이 없습니다."}</Typography>
          </InfoBox>

          {/* 태그 */}
          <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
            {localSchedule.tag1 && <Chip label={`# ${localSchedule.tag1}`} color="primary" />}
            {localSchedule.tag2 && <Chip label={`# ${localSchedule.tag2}`} color="secondary" />}
            {localSchedule.tag3 && <Chip label={`# ${localSchedule.tag3}`} color="success" />}
          </Box>

          {/* 수정 버튼 */}
          <Box display="flex" justifyContent="center" mt={3}>
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
          </Box>
        </DialogContent>
      </StyledDialog>

      {/* 수정 모달 */}
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
