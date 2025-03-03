import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const ChatComponent = ({ channelId }) =>
{
    const [client, setClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() =>
    {
        console.log("✅ 전달된 channelId:", channelId);

        if (!channelId) {
            console.error("❌ WebSocket 연결 실패: 채널 ID가 없음");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            console.error("❌ WebSocket 연결 실패: 로그인되지 않음 (토큰 없음)");
            return;
        }

        console.log("✅ WebSocket 연결 시도 중, 토큰:", token);

        const socket = new SockJS(`http://localhost:8080/ws?token=${encodeURIComponent(token)}`);
        const stompClient = Stomp.over(() => socket);

        stompClient.connect({}, frame =>
        {
            console.log(`✅ WebSocket 연결 성공! 채널 ID: ${channelId}`, frame);

            stompClient.subscribe(`/topic/channel/${channelId}`, message =>
            {
                console.log("📩 받은 메시지:", message.body);

                try {
                    const parsedMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, parsedMessage]);
                } catch (error) {
                    console.error("❌ 메시지 파싱 오류:", error);
                }
            });

            setClient(stompClient);
            console.log("✅ STOMP 클라이언트 저장 완료!", stompClient);
        }, error =>
        {
            console.error("❌ WebSocket 연결 실패", error);
        });

        return () =>
        {
            if (stompClient) stompClient.disconnect();
        };
    }, [channelId]);

    const sendMessage = () => {
        if (!channelId) {
            console.error("❌ 메시지 전송 실패: 채널 ID가 없음");
            return;
        }
    
        if (!client || !client.connected) {
            console.error("❌ WebSocket 연결이 활성화되지 않음");
            return;
        }
    
        const token = localStorage.getItem("token"); // ✅ JWT 가져오기
        const userEmail = localStorage.getItem("userEmail"); // ✅ 사용자 이메일 가져오기 (프론트에서 저장 필요)
    
        if (!userEmail) {
            console.error("❌ 사용자 이메일을 찾을 수 없음");
            return;
        }
    
        const messageData = { 
            channelNumber: channelId, 
            sender: userEmail, // ✅ 프론트에서 sender 직접 추가
            content: input 
        };
    
        console.log("📤 메시지 전송 시도:", JSON.stringify(messageData));
    
        try {
            client.publish({
                destination: `/app/chat/sendMessage/${channelId}`,
                body: JSON.stringify(messageData),
            });
    
            console.log("✅ 메시지 WebSocket으로 전송됨!");
            setInput("");
        } catch (error) {
            console.error("❌ 메시지 전송 중 오류 발생:", error);
        }
    };
    
    

    return (
        <div>
            <h2>채팅</h2>
            <div style={{ border: "1px solid #ccc", padding: "10px", minHeight: "200px" }}>
                {messages.map((msg, index) => (
                    <p key={index}>{msg.sender}: {msg.content}</p>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
            />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
};

export default ChatComponent;
