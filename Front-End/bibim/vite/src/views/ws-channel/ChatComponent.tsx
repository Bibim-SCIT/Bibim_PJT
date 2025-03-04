import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";

interface ChatProps {
    channelId: number;
}

const ChatComponent: React.FC<ChatProps> = ({ channelId }) => {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState<WebSocket | null>(null);
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

        try {
            // ✅ WebSocket 연결 시 JWT를 URL에 포함
            const ws = new SockJS(`http://localhost:8080/ws/chat?token=${token}&channelId=${channelId}`);

            ws.onopen = () => {
                console.log(`✅ WebSocket 연결 성공 (채널 ID: ${channelId})`);
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                console.log("📩 받은 메시지:", event.data);
                setMessages((prev) => [...prev, event.data]);
            };

            ws.onerror = (error) => {
                console.error("❌ WebSocket 오류 발생:", error);
                setIsConnected(false);
            };

            ws.onclose = () => {
                console.log("🔴 WebSocket 연결 종료");
                setIsConnected(false);
            };

            setSocket(ws);

            return () => {
                if (ws) {
                    ws.close();
                }
            };
        } catch (error) {
            console.error("❌ WebSocket 연결 중 오류 발생:", error);
        }
    }, [channelId]);

    const sendMessage = () => {
        if (!input.trim() || !socket || !isConnected) return;
        socket.send(input);
        setInput("");
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
};

export default ChatComponent;
