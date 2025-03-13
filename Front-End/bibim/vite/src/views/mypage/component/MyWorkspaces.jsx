import React from 'react';
import { Card, Avatar, Typography, Button, Box } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const MyWorkspaces = () => {
  // 임시 데이터 (나중에 API로 대체)
  const workspaces = [
    { wsId: 1, wsName: '프로젝트 A팀', wsImg: 'https://via.placeholder.com/56' },
    { wsId: 2, wsName: '디자인팀', wsImg: 'https://via.placeholder.com/56' },
    { wsId: 3, wsName: '개발팀', wsImg: 'https://via.placeholder.com/56' },
    { wsId: 4, wsName: '마케팅팀', wsImg: 'https://via.placeholder.com/56' },
    { wsId: 5, wsName: '기획팀', wsImg: 'https://via.placeholder.com/56' },
    { wsId: 6, wsName: '인사팀', wsImg: 'https://via.placeholder.com/56' },
    { wsId: 7, wsName: '영업팀', wsImg: 'https://via.placeholder.com/56' },
  ];

  const onSelect = (ws) => {
    console.log('선택된 워크스페이스:', ws);
    // TODO: 워크스페이스 선택 로직 구현
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>내 워크스페이스</Typography>
      {workspaces.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 25 },
            1024: { slidesPerView: 4, spaceBetween: 30 }
          }}
          navigation
          pagination={{ clickable: true }}
          style={{ paddingBottom: '60px' }}
        >
          {workspaces.map((ws) => (
            <SwiperSlide key={ws.wsId}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 2,
                  mx: 'auto',
                  width: '90%',
                  border: '2px solid #ccc',
                  borderRadius: 2,
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    border: '2px solid #1976d2'
                  }
                }}
              >
                <Avatar
                  src={ws.wsImg}
                  sx={{ width: 56, height: 56, margin: '0 auto' }}
                  variant="rounded"
                />
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  {ws.wsName}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => onSelect(ws)}
                >
                  변경
                </Button>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <Typography variant="body2" sx={{ textAlign: 'center', my: 2 }}>
          현재 생성된 워크스페이스가 없습니다
        </Typography>
      )}
    </Box>
  );
};

export default MyWorkspaces; 