import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import useTagData from '../../../hooks/useTagData';
import { updateSchedule } from '../../../api/schedule';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
  },
}));

const ScheduleEditModal = ({ open, onClose, scheduleData, onUpdate }) => {
  const { largeTags, mediumTags, smallTags, fetchLargeTags, fetchMediumTags, fetchSmallTags, setLoading } = useTagData();

  const [formData, setFormData] = useState({
    scheduleTitle: '',
    scheduleContent: '',
    tag1: '',
    tag2: '',
    tag3: '',
    scheduleStartDate: '',
    scheduleFinishDate: '',
  });

  useEffect(() => {
    if (scheduleData) {
      const wsId = scheduleData.wsId;
      if (!wsId) return;

      setLoading(true);

      fetchLargeTags(wsId)
        .then((tags) => {
          console.log('📌 대분류 태그 로드 완료:', tags);
          if (scheduleData.tag1) {
            const largeTag = tags.find(tag => tag.tagName === scheduleData.tag1);
            if (largeTag) {
              fetchMediumTags(wsId, largeTag.largeTagNumber).then((medTags) => {
                console.log('📌 중분류 태그 로드 완료:', medTags);
                if (scheduleData.tag2) {
                  const mediumTag = medTags.find(tag => tag.tagName === scheduleData.tag2);
                  if (mediumTag) {
                    fetchSmallTags(wsId, largeTag.largeTagNumber, mediumTag.mediumTagNumber)
                      .then((smTags) => console.log('📌 소분류 태그 로드 완료:', smTags));
                  }
                }
              });
            }
          }
        })
        .finally(() => setLoading(false));

      setFormData({
        scheduleTitle: scheduleData.scheduleTitle || '',
        scheduleContent: scheduleData.scheduleContent || '',
        tag1: scheduleData.tag1 || '',
        tag2: scheduleData.tag2 || '',
        tag3: scheduleData.tag3 || '',
        scheduleStartDate: scheduleData.scheduleStartDate?.split('T')[0] || '',
        scheduleFinishDate: scheduleData.scheduleFinishDate?.split('T')[0] || '',
      });
    }
  }, [scheduleData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📌 수정 요청 시작:', formData);

      const changeScheduleDTO = {
        scheduleTitle: formData.scheduleTitle,
        scheduleContent: formData.scheduleContent,
        tag1: formData.tag1,
        tag2: formData.tag2,
        tag3: formData.tag3,
        scheduleStartDate: formData.scheduleStartDate ? `${formData.scheduleStartDate}T00:00:00` : null,
        scheduleFinishDate: formData.scheduleFinishDate ? `${formData.scheduleFinishDate}T23:59:59` : null,
      };

      console.log('📌 스케줄 수정 요청 데이터:', changeScheduleDTO);

      const result = await updateSchedule(scheduleData.scheduleNumber, changeScheduleDTO);

      console.log('✅ 스케줄 수정 성공:', result);

      if (onUpdate) {
        onUpdate({ ...scheduleData, ...changeScheduleDTO });
      }

      onClose();
    } catch (error) {
      console.error('❌ 스케줄 수정 실패:', error);
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="600">팀스케줄 수정</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="스케줄 제목*" value={formData.scheduleTitle} onChange={(e) => setFormData({ ...formData, scheduleTitle: e.target.value })} />
        <TextField fullWidth label="스케줄 내용" multiline rows={4} value={formData.scheduleContent} onChange={(e) => setFormData({ ...formData, scheduleContent: e.target.value })} sx={{ mt: 2 }} />

        <Box display="flex" gap={2} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>대분류*</InputLabel>
            <Select value={formData.tag1} onChange={(e) => setFormData({ ...formData, tag1: e.target.value })}>
              <MenuItem value="">취소</MenuItem>
              {largeTags.map((tag) => <MenuItem key={tag.tagNumber} value={tag.tagName}>{tag.tagName}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>중분류*</InputLabel>
            <Select value={formData.tag2} onChange={(e) => setFormData({ ...formData, tag2: e.target.value })} disabled={!formData.tag1}>
              <MenuItem value="">취소</MenuItem>
              {mediumTags.map((tag) => <MenuItem key={tag.tagNumber} value={tag.tagName}>{tag.tagName}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>소분류*</InputLabel>
            <Select value={formData.tag3} onChange={(e) => setFormData({ ...formData, tag3: e.target.value })} disabled={!formData.tag2}>
              <MenuItem value="">취소</MenuItem>
              {smallTags.map((tag) => <MenuItem key={tag.tagNumber} value={tag.tagName}>{tag.tagName}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Typography sx={{ mt: 2, mb: 1 }}>날짜 설정*</Typography>
        <Box display="flex" gap={2}>
          <TextField type="date" value={formData.scheduleStartDate} onChange={(e) => setFormData({ ...formData, scheduleStartDate: e.target.value })} sx={{ flex: 1 }} />
          <Typography>~</Typography>
          <TextField type="date" value={formData.scheduleFinishDate} onChange={(e) => setFormData({ ...formData, scheduleFinishDate: e.target.value })} sx={{ flex: 1 }} />
        </Box>

        <Box display="flex" gap={2} mt={3}>
          <Button variant="outlined" onClick={onClose} sx={{ flex: 1 }}>취소</Button>
          <Button variant="contained" type="submit" sx={{ flex: 1, bgcolor: '#7C3AED' }}>수정하기</Button>
        </Box>
      </form>
    </StyledDialog>
  );
};

export default ScheduleEditModal;
