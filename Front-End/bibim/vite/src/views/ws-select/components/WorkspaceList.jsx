import { Box, Typography, Avatar, Button, Card } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';

export default function WorkspaceList({ workspaces, onCreate }) {
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

            {workspaces.length > 0 ? (
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}  // ✅ 카드 사이의 간격을 30px로 늘림
                    slidesPerView={1} // 기본 1개씩 표시
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 }, // 2개씩, 간격 20px
                        768: { slidesPerView: 3, spaceBetween: 25 }, // 3개씩, 간격 25px
                        1024: { slidesPerView: 4, spaceBetween: 30 } // 4개씩, 간격 30px
                    }}
                    navigation
                    pagination={{ clickable: true }}
                    style={{ paddingBottom: '60px' }} // ✅ 페이지네이션과 카드 사이 간격 추가
                >
                    {workspaces.map((ws) => (
                        <SwiperSlide key={ws.id}>
                            <Card
                                sx={{
                                    textAlign: 'center',
                                    p: 2,
                                    mx: 'auto',
                                    width: '90%',
                                    border: '2px solid #ccc',  // ✅ 구분선 추가
                                    borderRadius: 2, // ✅ 부드러운 모서리
                                    boxShadow: '2px 2px 8px rgba(0,0,0,0.1)', // ✅ 살짝 그림자 효과
                                    transition: 'transform 0.2s ease-in-out', // ✅ 마우스 호버 시 자연스럽게 변형
                                    '&:hover': {
                                        transform: 'scale(1.05)', // ✅ 호버 시 살짝 확대 효과
                                        border: '2px solid #1976d2' // ✅ 호버 시 강조 효과
                                    }
                                }}
                            >
                                <Avatar src={ws.avatar} sx={{ width: 56, height: 56, margin: '0 auto' }} />
                                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                                    {ws.name}
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

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="outlined" sx={{ width: 200 }} onClick={onCreate}>
                    새 워크스페이스 생성하기
                </Button>
            </Box>
        </Box>
    );
}
