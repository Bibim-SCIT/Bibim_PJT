import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, Card } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import InviteWorkspaceModal from './InviteWorkspaceModal'; // 초대 모달 import

export default function WorkspaceList({ workspaces = [], onSelect }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    console.log("📌 현재 workspaces 배열:", workspaces);

    return (
        <Box
            sx={{
                p: 3,
                border: '1px solid #ddd',
                borderRadius: 2,
                boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                width: '90%', // 좌우 90% 영역 차지
                maxWidth: 1100, // 최대 너비 지정
                mx: 'auto', // 가운데 정렬
                textAlign: 'center',
                backgroundColor: '#DBE2EF'
            }}
        >
            <Typography variant="h4" sx={{ mb: 2 }}>
                현재 생성된 워크스페이스
            </Typography>

            {/* ✅ workspaces가 정의되지 않았을 경우 안전하게 처리 */}
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
                                    mt: 2,
                                    border: '2px solid #ccc',
                                    borderRadius: 2,
                                    boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s ease-in-out',
                                    // backgroundColor: '#DBE2EF',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        border: '2px solid #1976d2',
                                    }
                                }}
                            >
                                <Avatar
                                    src={ws.wsImg}
                                    sx={{ width: 56, height: 56, margin: '0 auto' }}
                                    variant="rounded" // 둥근 네모식으로 만들기 
                                />
                                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                                    {ws.wsName}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        backgroundColor: '#3F72AF'
                                    }}
                                    onClick={() => onSelect(ws)} // ✅ 클릭 시 선택
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

            {/* 새 워크스페이스 생성 버튼 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" sx={{ width: 200, backgroundColor: '#3F72AF' }} onClick={() => setModalOpen(true)}>
                    새 워크스페이스 생성하기
                </Button>
                <Button variant="contained" sx={{ width: 200, ml: 2, backgroundColor: '#3F72AF' }} onClick={() => setInviteModalOpen(true)}>
                    워크스페이스 초대하기
                </Button>
            </Box>

            {/* 워크스페이스 생성 모달 */}
            <CreateWorkspaceModal open={modalOpen} onClose={() => setModalOpen(false)} />
            <InviteWorkspaceModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
        </Box>
    );
}
