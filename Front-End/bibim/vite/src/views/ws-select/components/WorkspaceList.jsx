import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, Card } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';
import CreateWorkspaceModal from './CreateWorkspaceModal';

export default function WorkspaceList({ workspaces = [], onCreate }) {
    const [modalOpen, setModalOpen] = useState(false);

    console.log("📌 현재 workspaces 배열:", workspaces);

    // 로딩속도 측정 (삭제할 코드)
    // useEffect(() => {
    //     workspaces.forEach((ws) => {
    //         console.log(`🖼️ 이미지 URL 확인: ${ws.wsImg}`);
    //         if (ws.wsImg) {
    //             const timerLabel = `🖼️ 이미지 로딩 시간 - ${ws.wsName}`;

    //             // 🛑 기존 타이머가 존재하면 종료 후 새 타이머 시작
    //             try {
    //                 console.timeEnd(timerLabel);
    //             } catch (e) {
    //                 // 타이머가 없으면 무시
    //             }

    //             console.time(timerLabel);

    //             const img = new Image();
    //             img.src = ws.wsImg; // S3 이미지 URL 사용

    //             img.onload = () => {
    //                 console.timeEnd(timerLabel);
    //                 console.log(`✅ 이미지 로딩 성공: ${ws.wsImg}`);
    //             };

    //             img.onerror = () => {
    //                 console.timeEnd(timerLabel);
    //                 console.error(`❌ 이미지 로딩 실패: ${ws.wsImg}`);
    //             };
    //         }
    //     });
    // }, [workspaces]);



    return (
        <Box
            sx={{
                p: 3,
                border: '1px solid #ddd',
                borderRadius: 2,
                width: '90%', // 좌우 90% 영역 차지
                maxWidth: 1100, // 최대 너비 지정
                mx: 'auto', // 가운데 정렬
                textAlign: 'center'
            }}
        >
            <Typography variant="h6" sx={{ mb: 2 }}>
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
                                <Avatar src={ws.wsImg} sx={{ width: 56, height: 56, margin: '0 auto' }} />
                                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                                    {ws.wsName}
                                </Typography>
                                <Button variant="contained" size="small" sx={{ mt: 1 }}>
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
                <Button variant="outlined" sx={{ width: 200 }} onClick={() => setModalOpen(true)}>
                    새 워크스페이스 생성하기
                </Button>
            </Box>

            {/* 워크스페이스 생성 모달 */}
            <CreateWorkspaceModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </Box>
    );
}
