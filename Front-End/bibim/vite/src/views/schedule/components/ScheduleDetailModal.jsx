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

const HeaderSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '24px',
});

const ContentSection = styled(Box)({
  '& > div': {
    marginBottom: '16px',
  },
});

const DetailRow = styled(Box)({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '12px',
  '& .label': {
    color: '#666',
    minWidth: '80px',
  },
  '& .value': {
    color: '#333',
    flex: 1,
  },
});

const TagsContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '16px',
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '24px',
  padding: '16px 0',
  borderTop: '1px solid #eee',
});

const ScheduleDetailModal = ({ schedule, onClose, onUpdate, ...props }) => {
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
      <StyledDialog
        open={Boolean(localSchedule)}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <HeaderSection>
          <Box display="flex" alignItems="center" gap={2}>
            <Box component="img" src="/path/to/schedule-icon.png" width={24} height={24} />
            <Typography variant="h6">스케줄 보기</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </HeaderSection>

        <Typography color="textSecondary" sx={{ mb: 3 }}>
          마지막 수정 시간 : {formatDate(localSchedule.scheduleModifytime)}
        </Typography>

        <ContentSection>
          <DetailRow>
            <Typography className="label">스케줄 제목</Typography>
            <Typography className="value" fontWeight="500">
              {localSchedule.scheduleTitle}
            </Typography>
          </DetailRow>

          <DetailRow>
            <Typography className="label">담당자</Typography>
            {localSchedule.nickname ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={localSchedule.userProfileImage}
                  sx={{ width: 24, height: 24 }}
                />
                <Typography>{localSchedule.nickname}</Typography>
              </Box>
            ) : (
              <Typography className="value" color="text.secondary">
                담당자가 없습니다
              </Typography>
            )}
          </DetailRow>

          <DetailRow>
            <Typography className="label">스케줄 시작일</Typography>
            <Typography className="value">
              {formatDate(localSchedule.scheduleStartDate)}
            </Typography>
          </DetailRow>

          <DetailRow>
            <Typography className="label">스케줄 완료일</Typography>
            <Typography className="value">
              {formatDate(localSchedule.scheduleFinishDate)}
            </Typography>
          </DetailRow>

          {localSchedule.scheduleContent && (
            <DetailRow>
              <Typography className="label">스케줄 내용</Typography>
              <Typography className="value">
                {localSchedule.scheduleContent}
              </Typography>
            </DetailRow>
          )}

          <TagsContainer>
            {(localSchedule.tag1 || localSchedule.tag2 || localSchedule.tag3) ? (
              <>
                {localSchedule.tag1 && (
                  <Chip
                    label={localSchedule.tag1}
                    size="small"
                    sx={{ backgroundColor: '#e3f2fd' }}
                  />
                )}
                {localSchedule.tag2 && (
                  <Chip
                    label={localSchedule.tag2}
                    size="small"
                    sx={{ backgroundColor: '#e8f5e9' }}
                  />
                )}
                {localSchedule.tag3 && (
                  <Chip
                    label={localSchedule.tag3}
                    size="small"
                    sx={{ backgroundColor: '#fce4ec' }}
                  />
                )}
              </>
            ) : (
              <Typography color="text.secondary">
                설정된 태그가 없습니다
              </Typography>
            )}
          </TagsContainer>

          <ButtonContainer>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{
                backgroundColor: '#6366f1',
                '&:hover': {
                  backgroundColor: '#4f46e5'
                },
                minWidth: '120px',
                padding: '8px 24px',
              }}
            >
              수정하기
            </Button>
          </ButtonContainer>
        </ContentSection>
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