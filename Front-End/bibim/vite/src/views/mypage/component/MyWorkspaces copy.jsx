import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Button, Box, Stack, Divider } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getMyWorkspaces } from '../../../api/mypage';

const MyWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const data = await getMyWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        console.error('워크스페이스 목록을 불러오는데 실패했습니다:', error);
      }
    };

    fetchWorkspaces();
  }, []);

  const onSelect = (ws) => {
    console.log('선택된 워크스페이스:', ws);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
            참여중인 워크스페이스
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button variant="outlined" size="small">
              새 워크스페이스
            </Button>
          </Box>
        </Stack>

        <Divider sx={{ mt: 2, mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {workspaces.map((ws) => (
            <Card
              key={ws.wsId}
              sx={{
                textAlign: 'center',
                p: 2,
                mx: 'auto',
                width: '300px',
                border: '1px solid #eee',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Avatar
                src={ws.wsImg}
                sx={{ width: 80, height: 80, margin: '0 auto' }}
                variant="rounded"
              />
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                {ws.wsName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                (역할)
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  mt: 1,
                  color: 'red',
                  borderColor: 'red',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    borderColor: 'red',
                  }
                }}
                onClick={() => console.log('나가기 클릭:', ws)}
              >
                나가기
              </Button>
            </Card>
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

export default MyWorkspaces; 