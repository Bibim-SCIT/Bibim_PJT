// 채팅 컴퍼넌트 import
import ChatComponent from './components/ChatComponent';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

// ==============================|| Chatting PAGE ||============================== //

export default function ChannelPage() {
    const { user } = useContext(ConfigContext); // ✅ Context에서 로그인 유저 정보 가져오기
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스

    return (
        <ChatComponent channelId={11} />
    );
}
