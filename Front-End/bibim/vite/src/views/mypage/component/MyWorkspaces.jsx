import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Button, Box, Stack, Divider } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/grid';
import { getMyWorkspaces } from '../../../api/mypage';

const MyWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([
    { id: 1, name: '프로젝트 A', role: '프로젝트 매니저', image: 'https://via.placeholder.com/56' },
    { id: 2, name: '디자인팀', role: 'UI/UX 디자이너', image: 'https://via.placeholder.com/56' },
    { id: 3, name: '마케팅팀', role: '마케팅 스페셜리스트', image: 'https://via.placeholder.com/56' },
    { id: 4, name: '개발팀', role: '프론트엔드 개발자', image: 'https://via.placeholder.com/56' },
    { id: 5, name: '운영팀', role: '운영 매니저', image: 'https://via.placeholder.com/56' },
    { id: 6, name: '인사팀', role: 'HR 매니저', image: 'https://via.placeholder.com/56' }
  ]);

  useEffect(() => {
    // API 호출 부분을 주석 처리하여 더미 데이터만 사용
    /*
    const fetchWorkspaces = async () => {
      try {
        const data = await getMyWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        console.error('워크스페이스 목록을 불러오는데 실패했습니다:', error);
      }
    };

    fetchWorkspaces();
    */
    // 더미 데이터가 이미 useState에 설정되어 있으므로 추가 작업 필요 없음
    console.log('더미 데이터 사용 중:', workspaces);
  }, []);

  const onSelect = (ws) => {
    console.log('선택된 워크스페이스:', ws);
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
        <Typography variant="h4" sx={{ mb: 2 }}>
          참여중인 워크스페이스
        </Typography>
        <Divider sx={{ my: 2 }} />
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
            style={{ paddingBottom: '40px' }}
          >
            {workspaces.map((workspace) => (
              <SwiperSlide key={workspace.id}>
                <Card sx={{ 
                  maxWidth: '100%', 
                  border: '1px solid #1976d2', 
                  borderRadius: 2,
                  position: 'relative',
                  height: '90px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ padding: 2 }}>
                    <Avatar alt={workspace.name} src={workspace.image} sx={{ width: 56, height: 56 }} variant="rounded" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" component="div">
                        {workspace.name}
                      </Typography>
                    </Box>
                    <Button variant="outlined" color="error" onClick={() => onSelect(workspace)} sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}>
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
              backgroundColor: 'white'
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
              backgroundColor: 'white'
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
      </Box>
    </Box>
  );
};

export default MyWorkspaces; 