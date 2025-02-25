import React, { useEffect } from 'react';
import MyInfoUpdate from './myInfoUpdate.jsx';  // .jsx 확장자 추가

// material-ui
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| 프로필 수정 페이지 ||============================== //

const ProfileUpdatePage = () => {
    useEffect(() => {
        // 임시 토큰 설정
        const tempToken = 'your_temp_token_here';  // 여기에 실제 테스트용 토큰 값을 넣으세요
        localStorage.setItem('token', tempToken);
        
        // 선택적: Bearer 형식으로 저장
        // localStorage.setItem('token', `Bearer ${tempToken}`);
    }, []);

    return (
    <MyInfoUpdate />
    );
};

export default ProfileUpdatePage;

// export default function ProfileUpdatePage() {
//      return (
//         <MainCard title="프로필 수정 페이지">
//             <Typography variant="body2">
//                 Lorem ipsum dolor sit amen, consenter nipissing eli, sed do elusion tempos incident ut laborers et doolie magna alissa. Ut enif ad
//                 minim venice, quin nostrum exercitation illampu laborings nisi ut liquid ex ea commons construal. Duos aube grue dolor in
//                 reprehended in voltage veil esse colum
//             </Typography>
//         </MainCard>
//     );
// }
