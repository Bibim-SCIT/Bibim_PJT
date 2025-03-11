// material-ui
import Typography from '@mui/material/Typography';

// project imports
import MainCard2 from 'ui-component/cards/MainCard2';
import MainCard3 from '../../../ui-component/cards/MainCard3';
import CatImg from '../../../assets/images/cat_profile.jpg'

// ==============================|| SAMPLE PAGE ||============================== //

export default function OverallView() {
    return (
        // <MainCard3
        //     title="📂 자료실"
        //     backgroundImage={CatImg}
        //     backgroundPosition="left"   // 🔹 배경을 위쪽 정렬
        //     backgroundBlur={2}                // 🔹 흐림 효과 적용 (px)
        //     backgroundBrightness={0.9}        // 🔹 배경을 약간 어둡게
        //     backgroundDarken={0.1}            // 🔹 오버레이를 좀 더 진하게
        // >
        //     <Typography variant="body2">
        //         Lorem ipsum dolor sit amen, consenter nipissing eli, sed do elusion tempos incident ut laborers et doolie magna alissa. Ut enif ad
        //         minim venice, quin nostrum exercitation illampu laborings nisi ut liquid ex ea commons construal. Duos aube grue dolor in
        //         reprehended in voltage veil esse colum doolie eu fujian bulla parian. Exceptive sin ocean cuspidate non president, sunk in culpa qui
        //         officiate descent molls anim id est labours.
        //     </Typography>
        // </MainCard3>
        <MainCard2
            title="📂 자료실"
            backgroundImage={CatImg}
        >
            <Typography variant="body2">
                Lorem ipsum dolor sit amen, consenter nipissing eli, sed do elusion tempos incident ut laborers et doolie magna alissa. Ut enif ad
                minim venice, quin nostrum exercitation illampu laborings nisi ut liquid ex ea commons construal. Duos aube grue dolor in
                reprehended in voltage veil esse colum doolie eu fujian bulla parian. Exceptive sin ocean cuspidate non president, sunk in culpa qui
                officiate descent molls anim id est labours.
            </Typography>
        </MainCard2>
    );
}
