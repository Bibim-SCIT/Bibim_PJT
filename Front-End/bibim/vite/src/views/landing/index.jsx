// material-ui
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

// ==============================|| Landing PAGE ||============================== //

export default function LandingPage() {
    const navigate = useNavigate();

    // 페이지 이동
    const moveMain = () => {
        navigate("/");
    };

    return (
        <MainCard title="메인 시작 페이지입니다">
            <Typography variant="body2">
                랜딩페이지입니다. 당신의 꿈을 펼쳐보세요
            </Typography>
            <Button color="secondary" type="submit" variant="contained" onClick={moveMain}>
                메인으로 탈출
            </Button>
        </MainCard>
    );
}
