import React, { useEffect, useState, useContext } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ConfigContext } from "../../contexts/ConfigContext";

function ChatComponent({ channelId }) {
    const { user } = useContext(ConfigContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            console.error("❌ JWT 토큰 없음, 로그인 필요");
            return;
        }

        if (!channelId) {
            console.error("❌ 채널 ID 없음");
            return;
        }

        if (!user) {
            console.error("❌ user 정보 없음 (ConfigContext 확인 필요)");
            return;
        }

        console.log("🧑‍💻 user 정보:", user); // 디버깅용 로그 추가

        const socket = new SockJS("http://localhost:8080/ws/chat");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: (frame) => {
                console.log(`✅ STOMP 연결 성공! 채널 ID: ${channelId}`, frame);
                setIsConnected(true);

                client.subscribe(`/exchange/chat-exchange/msg.${channelId}`, (message) => {
                    console.log("📩 받은 메시지:", message.body);
                    setMessages((prev) => [...prev, message.body]);
                });

                setStompClient(client);
            },
            onStompError: (frame) => {
                console.error("❌ STOMP 오류 발생:", frame);
                setIsConnected(false);
            },
            onWebSocketClose: () => {
                console.error("❌ WebSocket 연결이 닫혔습니다.");
                setIsConnected(false);
            }
        });

        client.activate();
        
        return () => {
            if (client) {
                client.deactivate();
                setIsConnected(false);
            }
        };
    }, [channelId, user]);

    const sendMessage = () => {
        if (!input.trim() || !stompClient || !isConnected || !channelId) return;
    
        try {
            const senderEmail = user?.email || "unknown"; // user.email이 없으면 "unknown"으로 설정
            console.log(`📤 메시지 전송: sender=${senderEmail}, content=${input}`);
            
            stompClient.publish({
                destination: `/app/chat.sendMessage.${channelId}`,
                body: JSON.stringify({
                    channelNumber: channelId,
                    content: input,
                    sender: senderEmail, // user.email이 없을 경우 기본값 사용
                    messageOrFile: false // 올바른 필드명 적용 (messagesOrFiles → messageOrFile)
                }),
            });
            setInput("");
        } catch (error) {
            console.error("❌ 메시지 전송 중 오류 발생:", error);
        }
    };

    return (
        <div>
            <h2>채팅 - 채널 {channelId}</h2>
            {isConnected ? <p>🟢 연결됨</p> : <p>🔴 연결 안 됨</p>}
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                disabled={!isConnected}
            />
            <button onClick={sendMessage} disabled={!isConnected}>
                전송
            </button>
        </div>
    );
}

export default ChatComponent;
