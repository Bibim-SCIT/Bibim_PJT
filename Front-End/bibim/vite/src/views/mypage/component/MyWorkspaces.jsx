import React, { useEffect, useState, useCallback } from 'react';
import { Card, Avatar, Typography, Button, Box, Stack, Divider, Snackbar, Alert } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/grid';
import { getMyWorkspaces } from '../../../api/mypage';
import { leaveWorkspace } from '../../../api/workspaceApi';
import CreateWorkspaceModal from '../../../views/ws-select/components/CreateWorkspaceModal';

const MyWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // 스낵바 상태 관리
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // fetchWorkspaces 함수를 useCallback으로 감싸서 재사용 가능하게 만듭니다
  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyWorkspaces();
      console.log('API 응답 데이터:', result); // 데이터 구조 확인용 로그
      
      // 배열 형태로 직접 받아오는 경우
      if (Array.isArray(result)) {
        setWorkspaces(result);
      }
      // data 속성 내에 배열이 있는 경우
      else if (result && result.data && Array.isArray(result.data)) {
        setWorkspaces(result.data);
      } 
      // 데이터가 없는 경우
      else {
        console.warn('워크스페이스 데이터가 없거나 형식이 올바르지 않습니다:', result);
        setError('워크스페이스 목록 조회 중 오류 발생');
      }
    } catch (err) {
      console.error('워크스페이스 목록을 불러오는데 실패했습니다:', err);
      setError('워크스페이스 목록 조회 중 오류 발생');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const onSelect = (ws) => {
    console.log('선택된 워크스페이스:', ws);
  };

  // 워크스페이스 탈퇴 함수
  const handleLeaveWorkspace = async (workspace) => {
    try {
      console.log('워크스페이스 탈퇴 시도:', workspace.wsId);
      const result = await leaveWorkspace(workspace.wsId);
      console.log('워크스페이스 탈퇴 결과:', result);
      
      setSnackbar({
        open: true,
        message: '워크스페이스에서 성공적으로 탈퇴했습니다.',
        severity: 'success'
      });
      
      // 워크스페이스 목록 새로고침
      fetchWorkspaces();
    } catch (error) {
      console.error('워크스페이스 탈퇴 오류:', error);
      setSnackbar({
        open: true,
        message: '워크스페이스 탈퇴 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  // 모달이 닫힐 때 워크스페이스 목록을 새로 조회합니다
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // 워크스페이스 생성 성공 시 호출될 콜백 함수
  const handleCreateSuccess = () => {
    console.log('워크스페이스 생성 성공, 목록 새로고침');
    fetchWorkspaces(); // 워크스페이스 생성 성공 시 목록 새로고침
    setSnackbar({
      open: true,
      message: '워크스페이스가 성공적으로 생성되었습니다.',
      severity: 'success'
    });
  };

  // 스낵바 닫기 함수
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{
        p: 3,
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 1
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            참여중인 워크스페이스
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setModalOpen(true)}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            워크스페이스 생성하기
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>로딩 중...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', mt: 2, px: 8 }}>
            {/* 화살표와 카드 영역을 감싸는 컨테이너 - 좌우 여백 추가 */}
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{ 
                clickable: true,
                el: '.swiper-pagination'
              }}
              spaceBetween={10}
              slidesPerView={3}
              style={{ paddingBottom: '40px', paddingTop: '10px' }}
            >
              {workspaces.map((workspace) => (
                <SwiperSlide key={workspace.wsId} style={{ padding: '5px 0' }}>
                  <Card 
                    sx={{ 
                      maxWidth: '100%', 
                      border: '1.5px solid #bdbdbd', 
                      borderRadius: 2,
                      position: 'relative',
                      height: '90px',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-3px)'
                      }
                    }}
                    onClick={() => onSelect(workspace)}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ padding: 2 }}>
                      <Avatar alt={workspace.wsName} src={workspace.wsImg} sx={{ width: 56, height: 56 }} variant="rounded" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" component="div">
                          {workspace.wsName}
                        </Typography>
                      </Box>
                      <Button variant="outlined" color="error" onClick={(e) => {
                        e.stopPropagation(); // 이벤트 버블링 방지
                        handleLeaveWorkspace(workspace);
                      }} sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}>
                        나가기
                      </Button>
                    </Stack>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* 화살표 버튼 - 왼쪽 */}
            <Box 
              className="swiper-button-prev" 
              sx={{ 
                position: 'absolute', 
                left: 0, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                zIndex: 10,
                width: '40px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1976d2',
                cursor: 'pointer',
                backgroundColor: 'white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            />
            
            {/* 화살표 버튼 - 오른쪽 */}
            <Box 
              className="swiper-button-next" 
              sx={{ 
                position: 'absolute', 
                right: 0, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                zIndex: 10,
                width: '40px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1976d2',
                cursor: 'pointer',
                backgroundColor: 'white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            />
            
            {/* 페이지네이션 표시 영역 */}
            <Box 
              className="swiper-pagination" 
              sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}
            />
          </Box>
        )}
      </Box>
      <CreateWorkspaceModal 
        open={modalOpen} 
        onClose={handleModalClose} 
        onSuccess={handleCreateSuccess} 
      />

      {/* 스낵바 컴포넌트 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyWorkspaces; 