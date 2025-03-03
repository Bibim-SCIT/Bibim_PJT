import { useState } from 'react';
import { Button } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import WsSettingModal from './WsSettingModal';
import { updateWorkspace } from 'api/workspace'; // API 함수 필요

// ==============================|| SAMPLE PAGE ||============================== //

export default function WsSettingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const workspace = {
        wsId: 1, // 현재 워크스페이스 ID
        wsName: '현재 워크스페이스 이름',
        wsImg: '현재 워크스페이스 이미지 URL'
    };

    const handleUpdate = async (formData) => {
        try {
            await updateWorkspace(formData);
            // 성공 처리 (예: 알림 표시)
            alert('워크스페이스가 업데이트되었습니다.');
        } catch (error) {
            console.error('업데이트 실패:', error);
            alert('업데이트에 실패했습니다.');
        }
    };

    return (
        <MainCard title="워크스페이스 세팅">
            <Button 
                variant="contained" 
                color="primary"
                onClick={() => setIsModalOpen(true)}
            >
                워크스페이스 설정
            </Button>

            <WsSettingModal
                open={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
                workspace={workspace}
                onUpdate={handleUpdate}
            />
        </MainCard>
    );
}
