import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import ChatComponent from './components/ChatComponent';
import { getWorkspaceChannels } from '../../api/channel';
import ChannelLoading from './components/ChannelLoading';

// ==============================|| Chatting PAGE ||============================== //

export default function ChannelPage() {
    const { user } = useContext(ConfigContext); // ✅ Context에서 로그인 유저 정보 가져오기
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스

    const WSID = activeWorkspace.wsId
    const [channelId, setChannelId] = useState(null); // 선택된 채널 ID
    const [channelName, setChannelName] = useState(null); // 선택된 채널 이름

    useEffect(() => {
        if (!activeWorkspace) return;

        // ✅ 현재 워크스페이스의 채널 목록 불러오기
        const fetchChannels = async () => {
            console.log("현재웤스", WSID);
            try {
                const channels = await getWorkspaceChannels(WSID);
                console.log("무슨무슨채널", channels);
                if (channels.length > 0) {
                    setChannelId(channels[0].channelId); // 첫 번째 채널을 기본 선택
                    setChannelName(channels[0].channelName); // 이름 받아오기
                }
            } catch (error) {
                console.error("채널 조회 실패:", error);
            }
        };

        fetchChannels();
    }, [activeWorkspace]);

    const handleChannelChange = (id, name) => {
        setChannelId(id);
        setChannelName(name);
    };

    if (!channelId) return <ChannelLoading />;

    return (
        // <ChatComponent channelId={11} />
        <ChatComponent
            channelId={channelId}
            workspaceId={activeWorkspace?.id}
            channelName={channelName}
            setChannel={handleChannelChange} // ✅ ChatComponent에 전달
        />
    );
}
