import React, { useEffect, useState, useContext } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ConfigContext } from "../../contexts/ConfigContext";
import { FaPaperPlane, FaPlus, FaGlobe, FaEllipsisH } from "react-icons/fa"; // 아이콘 추가
import "./ChatComponent.css"; // ✅ CSS 파일 추가

function ChatComponent({ channelId }) {
    const { user } = useContext(ConfigContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !channelId || !user) return;

        const socket = new SockJS("http://localhost:8080/ws/chat");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                setIsConnected(true);
                client.subscribe(`/exchange/chat-exchange/msg.${channelId}`, (message) => {
                    try {
                        const parsedMessage = JSON.parse(message.body);
                        setMessages((prev) => [...prev, parsedMessage]);
                    } catch (error) {
                        console.error("❌ 메시지 파싱 오류:", error);
                    }
                });
                setStompClient(client);
            },
            onStompError: () => setIsConnected(false),
            onWebSocketClose: () => setIsConnected(false),
        });

        client.activate();
        return () => client.deactivate();
    }, [channelId, user]);

    const sendMessage = () => {
        if (!input.trim() || !stompClient || !isConnected) return;

        const messageData = {
            channelNumber: channelId,
            content: input,
            sender: user?.email || "Unknown Sender",
            messageOrFile: false,
        };

        stompClient.publish({
            destination: `/app/chat.sendMessage.${channelId}`,
            body: JSON.stringify(messageData),
        });

        setInput(""); // 입력창 초기화
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            {/* 헤더 */}
            <div className="chat-header">채팅 - 채널 {channelId}</div>

            {/* 채팅 메시지 박스 */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <p className="no-messages">No messages yet.</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender === user?.email ? "my-message" : "other-message"}`}>
                            <p className="sender">{msg.sender || "Unknown Sender"}</p>
                            <div className="message-content">{msg.content}</div>
                        </div>
                    ))
                )}
            </div>

            {/* 입력창 (하단 고정) */}
            <div className="chat-input-box">
                <button className="icon-btn"><FaPlus /></button>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    className="chat-input"
                />
                <button onClick={sendMessage} className="send-btn">
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
}

export default ChatComponent;
