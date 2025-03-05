import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ConfigContext } from "../../contexts/ConfigContext";
import { FaPaperPlane, FaPlus, FaFileUpload } from "react-icons/fa";
import "./ChatComponent.css";

function ChatComponent({ channelId }) {
    const { user } = useContext(ConfigContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState(null); // ✅ 파일 상태 추가
    const [isUploading, setIsUploading] = useState(false); // ✅ 업로드 중 상태 추가
    const stompClientRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !channelId || !user) return;

        const socket = new SockJS("http://localhost:8080/ws/chat");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                client.subscribe(`/exchange/chat-exchange/msg.${channelId}`, (message) => {
                    try {
                        const parsedMessage = JSON.parse(message.body);
                        setMessages((prev) => [...prev, parsedMessage]);
                    } catch (error) {
                        console.error("❌ 메시지 파싱 오류:", error);
                    }
                });
                stompClientRef.current = client;
            },
            onStompError: (error) => console.error("STOMP 에러:", error),
            onWebSocketClose: () => console.log("WebSocket 연결 종료"),
        });

        client.activate();
        return () => client.deactivate();
    }, [channelId, user]);

    /**
     * 메시지 전송 (텍스트 또는 파일)
     */
    const sendMessage = useCallback(async () => {
        if ((!input.trim() && !file) || !stompClientRef.current) return;

        if (file) {
            setIsUploading(true);
            const fileUrl = await uploadFile(file);
            setIsUploading(false);

            if (fileUrl) {
                const messageData = {
                    channelNumber: channelId,
                    content: fileUrl, // ✅ 파일 URL을 메시지로 전송
                    sender: user?.email || "Unknown Sender",
                    messageOrFile: true,
                    fileUrl: fileUrl,
                };
                stompClientRef.current.publish({
                    destination: `/app/chat.sendMessage.${channelId}`,
                    body: JSON.stringify(messageData),
                });
            }
            setFile(null);
        } else {
            const messageData = {
                channelNumber: channelId,
                content: input,
                sender: user?.email || "Unknown Sender",
                messageOrFile: false,
            };
            stompClientRef.current.publish({
                destination: `/app/chat.sendMessage.${channelId}`,
                body: JSON.stringify(messageData),
            });
            setInput("");
        }
    }, [input, channelId, user, file]);

    /**
     * 파일 업로드 함수 (JWT 토큰 포함)
     */
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sender", user?.email);

        const token = localStorage.getItem("token"); // ✅ JWT 토큰 가져오기
        console.log("🔍 업로드 요청 - JWT 토큰:", token);

        const uploadUrl = `http://localhost:8080/api/chat/upload/${channelId}`;
        console.log("🔍 파일 업로드 요청 URL:", uploadUrl);

        try {
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ JWT 토큰 추가
                },
                body: formData,
            });

            if (!response.ok) throw new Error("파일 업로드 실패");

            const data = await response.json();
            return data.content; // 서버에서 반환한 파일 URL
        } catch (error) {
            console.error("❌ 파일 업로드 오류:", error);
            return null;
        }
    };

    /**
     * 파일인지 확인하는 함수 (확장자로 판별)
     */
    const isImageFile = (url) => {
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
        const extension = url.split(".").pop().toLowerCase();
        return imageExtensions.includes(extension);
    };

    /**
     * Enter 키 입력 시 메시지 전송
     */
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !file) {
            e.preventDefault();
            sendMessage();
        }
    };

    /**
     * 파일 선택 핸들러
     */
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setInput(""); // ✅ 파일이 선택되면 텍스트 입력 비활성화
        }
    };

    return (
        <div className="chat-container">
            {/* 헤더 */}
            <div className="chat-header">채팅 - 채널 {channelId}</div>

            {/* 채팅 메시지 박스 */}
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === user?.email ? "my-message" : "other-message"}`}>
                        <p className="sender">{msg.sender}</p>
                        {msg.messageOrFile && msg.content ? (
                            isImageFile(msg.content) ? (
                                // ✅ 이미지 파일이면 <img> 태그로 출력
                                <img src={msg.content} alt="파일 미리보기" className="chat-image" />
                            ) : (
                                // ✅ 일반 파일이면 다운로드 링크 제공
                                <a href={msg.content} target="_blank" rel="noopener noreferrer" className="file-message">
                                    📎 파일 다운로드
                                </a>
                            )
                        ) : (
                            // 일반 메시지 출력
                            <div className="message-content">{msg.content}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* 입력창 */}
            <div className="chat-input-box">
                <input type="file" id="file-upload" onChange={handleFileChange} hidden />
                <label htmlFor="file-upload" className="icon-btn">
                    <FaFileUpload />
                </label>

                {file && <span className="selected-file">{file.name}</span>}

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    className="chat-input"
                    disabled={file} // ✅ 파일 선택 시 입력창 비활성화
                />

                <button onClick={sendMessage} className="send-btn" disabled={isUploading}>
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
}

export default ChatComponent;
