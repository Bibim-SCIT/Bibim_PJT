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

const ScheduleDetailModal = ({ open, onClose, scheduleData }) => {
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  if (!open || !scheduleData) return null;

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

  return (
    <>
      <StyledDialog
        open={open}
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
          마지막 수정 시간 : {formatDate(scheduleData.updatedAt)}
        </Typography>

        <ContentSection>
          <DetailRow>
            <Typography className="label">스케줄 제목</Typography>
            <Typography className="value" fontWeight="500">
              {scheduleData.scheduleTitle}
            </Typography>
          </DetailRow>

          <DetailRow>
            <Typography className="label">담당자</Typography>
            {scheduleData.nickname ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={scheduleData.userProfileImage}
                  sx={{ width: 24, height: 24 }}
                />
                <Typography>{scheduleData.nickname}</Typography>
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
              {formatDate(scheduleData.scheduleStartDate)}
            </Typography>
          </DetailRow>

          <DetailRow>
            <Typography className="label">스케줄 완료일</Typography>
            <Typography className="value">
              {formatDate(scheduleData.scheduleFinishDate)}
            </Typography>
          </DetailRow>

          {scheduleData.scheduleContent && (
            <DetailRow>
              <Typography className="label">스케줄 내용</Typography>
              <Typography className="value">
                {scheduleData.scheduleContent}
              </Typography>
            </DetailRow>
          )}

          <TagsContainer>
            {(scheduleData.tag1 || scheduleData.tag2 || scheduleData.tag3) ? (
              <>
                {scheduleData.tag1 && (
                  <Chip
                    label={scheduleData.tag1}
                    size="small"
                    sx={{ backgroundColor: '#e3f2fd' }}
                  />
                )}
                {scheduleData.tag2 && (
                  <Chip
                    label={scheduleData.tag2}
                    size="small"
                    sx={{ backgroundColor: '#e8f5e9' }}
                  />
                )}
                {scheduleData.tag3 && (
                  <Chip
                    label={scheduleData.tag3}
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
        scheduleData={scheduleData}
      />
    </>
  );
};

export default ScheduleDetailModal; 