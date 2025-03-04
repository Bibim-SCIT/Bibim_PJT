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
import scheduleApi from '../../../api/scheduleApi';

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
  alignItems: 'center',
  marginBottom: '8px',
});

const SubTitle = styled(Typography)({
  color: '#666',
  fontSize: '14px',
  marginBottom: '24px',
});

const FormSection = styled(Box)({
  '& .MuiFormControl-root': {
    marginBottom: '16px',
  },
});

const DateContainer = styled(Box)({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  marginBottom: '16px',
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
});

const ScheduleEditModal = ({ open, onClose, scheduleData, onUpdate }) => {
  const { 
    largeTags, 
    mediumTags, 
    smallTags, 
    loading,
    fetchLargeTags,
    fetchMediumTags,
    fetchSmallTags,
    setLoading
  } = useTagData();

  const [formData, setFormData] = React.useState({
    scheduleTitle: '',
    scheduleContent: '',
    tag1: '',
    tag2: '',
    tag3: '',
    scheduleStartDate: '',
    scheduleFinishDate: '',
  });

  // 초기 데이터 로드
  useEffect(() => {
    const initializeTags = async () => {
      if (scheduleData) {
        const wsId = scheduleData.wsId;
        console.log('초기화 시 wsId:', wsId);
        console.log('초기화 시 tag1:', scheduleData.tag1);
        console.log('초기화 시 scheduleData:', scheduleData);
        
        if (!wsId) return;

        setLoading(true);
        try {
          const largeTags = await fetchLargeTags(wsId);
          console.log('초기 대분류 태그 로드:', largeTags);
          
          if (scheduleData.tag1 && largeTags.length > 0) {
            const largeTag = largeTags.find(tag => tag.tagName === scheduleData.tag1);
            console.log('찾은 초기 대분류 태그:', largeTag);
            
            if (largeTag) {
              // 대분류 태그의 실제 속성명을 확인하기 위한 로깅
              console.log('대분류 태그 객체의 모든 속성:', Object.keys(largeTag));
              
              const tagNumber = largeTag.largeTagNumber;
              if (tagNumber) {
                console.log('중분류 태그 요청 시작:', {
                  wsId,
                  largeTagNumber: tagNumber
                });
                const mediumTags = await fetchMediumTags(wsId, tagNumber);
                console.log('초기 중분류 태그 로드:', mediumTags);
                
                if (scheduleData.tag2 && mediumTags.length > 0) {
                  const mediumTag = mediumTags.find(tag => tag.tagName === scheduleData.tag2);

                  if (mediumTag) {
                    console.log('소분류 태그 요청 시작:', {
                      wsId,
                      largeTagNumber: tagNumber,
                      mediumTagNumber: mediumTag.mediumTagNumber
                    });
                    await fetchSmallTags(wsId, tagNumber, mediumTag.mediumTagNumber);
                    console.log('초기 소분류 태그 로드:', smallTags);
                  }
                }
              } else {
                console.error('대분류 태그에서 tagNumber를 찾을 수 없습니다:', largeTag);
              }
            }
          }

          setFormData({
            scheduleTitle: scheduleData.scheduleTitle || '',
            scheduleContent: scheduleData.scheduleContent || '',
            tag1: scheduleData.tag1 || '',
            tag2: scheduleData.tag2 || '',
            tag3: scheduleData.tag3 || '',
            scheduleStartDate: scheduleData.scheduleStartDate?.split('T')[0] || '',
            scheduleFinishDate: scheduleData.scheduleFinishDate?.split('T')[0] || '',
          });
        } catch (error) {
          console.error('태그 초기화 실패:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeTags();
  }, [scheduleData]);

  // API 응답 구조 확인을 위한 useEffect
  useEffect(() => {
    console.log('현재 largeTags:', largeTags);
    console.log('현재 mediumTags:', mediumTags);
    console.log('현재 smallTags:', smallTags);
  }, [largeTags, mediumTags, smallTags]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const changeScheduleDTO = {
        scheduleTitle: formData.scheduleTitle,
        scheduleContent: formData.scheduleContent,
        tag1: formData.tag1,
        tag2: formData.tag2,
        tag3: formData.tag3,
        scheduleStartDate: formData.scheduleStartDate ? `${formData.scheduleStartDate}T00:00:00` : null,
        scheduleFinishDate: formData.scheduleFinishDate ? `${formData.scheduleFinishDate}T23:59:59` : null
      };

      console.log('스케줄 수정 요청:', changeScheduleDTO);
      
      const result = await scheduleApi.updateSchedule(
        scheduleData.scheduleNumber,
        changeScheduleDTO
      );

      console.log('스케줄 수정 성공:', result);
      
      // 수정된 스케줄 데이터로 상태 업데이트
      const updatedSchedule = {
        ...scheduleData,
        ...changeScheduleDTO,
        scheduleNumber: scheduleData.scheduleNumber,
        wsId: scheduleData.wsId
      };
      
      if (onUpdate) {
        onUpdate(updatedSchedule); // 수정된 데이터를 전달하여 상태 업데이트
      }
      
      onClose();
    } catch (error) {
      console.error('스케줄 수정 실패:', error);
    }
  };

  // 대분류 태그 변경 핸들러
  const handleTag1Change = async (e) => {
    const selectedTagName = e.target.value;
    console.log('선택된 대분류 태그:', selectedTagName);
    
    if (selectedTagName === '') {
      // "취소" 선택 시 초기화
      setFormData({
        ...formData,
        tag1: '',
        tag2: '',
        tag3: ''
      });
      return;
    }

    const selectedTag = largeTags.find(tag => tag.tagName === selectedTagName);
    console.log('찾은 대분류 태그 객체:', selectedTag);
    
    setFormData({
      ...formData,
      tag1: selectedTagName,
      tag2: '',  // 하위 태그 초기화
      tag3: ''   // 하위 태그 초기화
    });

    if (selectedTag) {
      try {
        console.log('중분류 태그 요청 파라미터:', {
          wsId: scheduleData.wsId,
          largeTagNumber: selectedTag.largeTagNumber
        });
        await fetchMediumTags(scheduleData.wsId, selectedTag.largeTagNumber);
      } catch (error) {
        console.error('중분류 태그 로드 실패:', error);
      }
    }
  };

  // 중분류 태그 변경 핸들러
  const handleTag2Change = async (e) => {
    const selectedTagName = e.target.value;
    
    if (selectedTagName === '') {
      // "취소" 선택 시 초기화
      setFormData({
        ...formData,
        tag2: '',
        tag3: ''
      });
      return;
    }

    const selectedTag = mediumTags.find(tag => tag.tagName === selectedTagName);
    
    setFormData({
      ...formData,
      tag2: selectedTagName,
      tag3: '' // 하위 태그 초기화
    });

    if (selectedTag) {
      try {
        const selectedLargeTag = largeTags.find(tag => tag.tagName === formData.tag1);
        console.log('소분류 태그 요청 파라미터:', {
          wsId: scheduleData.wsId,
          largeTagNumber: selectedLargeTag.largeTagNumber,
          mediumTagNumber: selectedTag.mediumTagNumber
        });
        await fetchSmallTags(
          scheduleData.wsId,
          selectedLargeTag.largeTagNumber,
          selectedTag.mediumTagNumber
        );
      } catch (error) {
        console.error('소분류 태그 로드 실패:', error);
      }
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <HeaderSection>
        <Box>
          <Typography variant="h6" fontWeight="600">팀스케줄 수정</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </HeaderSection>
      
      <SubTitle>팀 스케줄을 수정합니다.</SubTitle>

      <form onSubmit={handleSubmit}>
        <FormSection>
          <TextField
            fullWidth
            label="스케줄 제목*"
            placeholder="What is your title?"
            value={formData.scheduleTitle}
            onChange={(e) => setFormData({...formData, scheduleTitle: e.target.value})}
          />

          <TextField
            fullWidth
            label="스케줄 내용"
            placeholder="스케줄에 대한 설명을 입력하세요"
            multiline
            rows={4}
            value={formData.scheduleContent}
            onChange={(e) => setFormData({...formData, scheduleContent: e.target.value})}
            sx={{ mt: 2 }}
          />

          <Box display="flex" gap={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>대분류*</InputLabel>
              <Select
                value={formData.tag1}
                label="대분류*"
                onChange={handleTag1Change}
                disabled={loading}
              >
                <MenuItem value="">취소</MenuItem>
                {largeTags.map((tag) => (
                  <MenuItem 
                    key={`${tag.wsId}-${tag.tagName}`} 
                    value={tag.tagName}
                  >
                    {tag.tagName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>중분류*</InputLabel>
              <Select
                value={formData.tag2}
                label="중분류*"
                onChange={handleTag2Change}
                disabled={!formData.tag1 || loading}
              >
                <MenuItem value="">취소</MenuItem>
                {mediumTags.map((tag) => (
                  <MenuItem 
                    key={`${tag.tagNumber}-${tag.tagName}`} 
                    value={tag.tagName}
                  >
                    {tag.tagName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>소분류*</InputLabel>
              <Select
                value={formData.tag3}
                label="소분류*"
                onChange={(e) => setFormData({...formData, tag3: e.target.value})}
                disabled={!formData.tag2 || loading}
              >
                <MenuItem value="">취소</MenuItem>
                {smallTags.map((tag) => (
                  <MenuItem 
                    key={`${tag.tagNumber}-${tag.tagName}`} 
                    value={tag.tagName}
                  >
                    {tag.tagName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography sx={{ mt: 2, mb: 1 }}>날짜 설정*</Typography>
          <DateContainer>
            <TextField
              type="date"
              value={formData.scheduleStartDate}
              onChange={(e) => setFormData({...formData, scheduleStartDate: e.target.value})}
              sx={{ flex: 1 }}
            />
            <Typography>~</Typography>
            <TextField
              type="date"
              value={formData.scheduleFinishDate}
              onChange={(e) => setFormData({...formData, scheduleFinishDate: e.target.value})}
              sx={{ flex: 1 }}
            />
          </DateContainer>
        </FormSection>

        <ButtonContainer>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ flex: 1, color: '#666', borderColor: '#ccc' }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            type="submit"
            sx={{ 
              flex: 1,
              bgcolor: '#7C3AED',
              '&:hover': {
                bgcolor: '#6D28D9'
              }
            }}
          >
            수정하기
          </Button>
        </ButtonContainer>
      </form>
    </StyledDialog>
  );
};

export default ScheduleEditModal; 