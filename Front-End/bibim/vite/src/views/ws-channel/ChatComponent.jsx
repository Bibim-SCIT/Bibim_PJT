import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ConfigContext } from "../../contexts/ConfigContext";
import { FaPaperPlane, FaFileUpload } from "react-icons/fa";
import TagIcon from '@mui/icons-material/Tag';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import "./ChatComponent.css";

/**
 * 채팅 컴포넌트
 * WebSocket을 사용하여 실시간 채팅 기능을 구현한 컴포넌트
 * 
 * @param {string} channelId - 채팅 채널 ID
 */
function ChatComponent({ channelId }) {
    // Context에서 현재 사용자 정보 가져오기
    const { user } = useContext(ConfigContext);
    
    // 상태 관리
    const [messages, setMessages] = useState([]); // 채팅 메시지 목록
    const [input, setInput] = useState("");      // 입력창 텍스트
    const [file, setFile] = useState(null);      // 선택된 파일
    const [isUploading, setIsUploading] = useState(false); // 파일 업로드 상태
    
    // WebSocket 클라이언트 참조
    const stompClientRef = useRef(null);

    /**
     * WebSocket 연결 설정
     * 컴포넌트 마운트 시 WebSocket 연결을 설정하고, 
     * 언마운트 시 연결을 해제
     */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !channelId || !user) return;

        // WebSocket 연결 설정
        const socket = new SockJS("http://localhost:8080/ws/chat");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            
            // 연결 성공 시 채널 구독
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
        return () => client.deactivate(); // 컴포넌트 언마운트 시 연결 해제
    }, [channelId, user]);

    /**
     * 메시지 전송 함수
     * 텍스트 메시지 또는 파일을 서버로 전송
     */
    const sendMessage = useCallback(async () => {
        if ((!input.trim() && !file) || !stompClientRef.current) return;

        // 파일 전송 처리
        if (file) {
            setIsUploading(true);
            const fileUrl = await uploadFile(file);
            setIsUploading(false);

            if (fileUrl) {
                const messageData = {
                    channelNumber: channelId,
                    content: fileUrl,
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
        } 
        // 텍스트 메시지 전송 처리
        else {
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
     * 파일 업로드 함수
     * 선택된 파일을 서버에 업로드하고 URL을 반환
     * 
     * @param {File} file - 업로드할 파일
     * @returns {Promise<string|null>} 업로드된 파일의 URL 또는 null
     */
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sender", user?.email);

        const token = localStorage.getItem("token");
        console.log("🔍 업로드 요청 - JWT 토큰:", token);

        const uploadUrl = `http://localhost:8080/api/chat/upload/${channelId}`;
        console.log("🔍 파일 업로드 요청 URL:", uploadUrl);

        try {
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("파일 업로드 실패");

            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error("❌ 파일 업로드 오류:", error);
            return null;
        }
    };

    /**
     * 이미지 파일 여부 확인
     * URL의 확장자를 확인하여 이미지 파일인지 판단
     * 
     * @param {string} url - 확인할 파일 URL
     * @returns {boolean} 이미지 파일 여부
     */
    const isImageFile = (url) => {
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
        const extension = url.split(".").pop().toLowerCase();
        return imageExtensions.includes(extension);
    };

    /**
     * Enter 키 입력 처리
     * Enter 키 입력 시 메시지 전송
     */
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !file) {
            e.preventDefault();
            sendMessage();
        }
    };

    /**
     * 파일 선택 처리
     * 파일 선택 시 상태 업데이트
     */
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setInput(""); // 파일 선택 시 텍스트 입력 비활성화
        }
    };

    return (
        <div className="chat-container">
            {/* 채널 헤더 */}
            <div className="chat-header">
                <div className="channel-info">
                    <TagIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    <span>채널 {channelId}</span>
                </div>
                <div className="active-users">
                    <PersonIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    <span>5명 접속 중</span>
                    <div className="active-users-list">
                        {[
                            { email: "user1@example.com" },
                            { email: "user2@example.com" },
                            { email: "user3@example.com" },
                            { email: "user4@example.com" },
                            { email: "user5@example.com" }
                        ].map((user, index) => (
                            <div key={index} className="active-user">
                                <div className="user-avatar">
                                    <div className="default-avatar">
                                        {user.email.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <span>{user.email}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 메시지 목록 */}
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === user?.email ? "my-message" : "other-message"}`}>
                        {/* 발신자 정보 */}
                        <div className="sender">
                            <div className="sender-avatar">
                                {msg.profileImage ? (
                                    <img src={msg.profileImage} alt={msg.sender} />
                                ) : (
                                    <div className="default-avatar">
                                        {msg.sender.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="sender-name">{msg.sender}</span>
                            <span className="message-time">10:15</span>
                        </div>
                        
                        {/* 메시지 내용 */}
                        <div className="message-content-container">
                            {msg.messageOrFile && msg.content ? (
                                isImageFile(msg.content) ? (
                                    // 이미지 파일인 경우
                                    <div className="message-content has-image">
                                        <img src={msg.content} alt="파일 미리보기" className="chat-image" />
                                    </div>
                                ) : (
                                    // 일반 파일인 경우
                                    <a href={msg.content} target="_blank" rel="noopener noreferrer" className="file-message">
                                        📎 파일 다운로드
                                    </a>
                                )
                            ) : (
                                // 텍스트 메시지인 경우
                                <div className="message-content">{msg.content}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 메시지 입력 영역 */}
            <div className="chat-input-box">
                {/* 파일 업로드 버튼 */}
                <input type="file" id="file-upload" onChange={handleFileChange} hidden />
                <label htmlFor="file-upload" className="icon-btn">
                    <AddIcon sx={{ fontSize: 24 }} />
                </label>

                {/* 선택된 파일명 표시 */}
                {file && <span className="selected-file">{file.name}</span>}

                {/* 메시지 입력창 */}
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    className="chat-input"
                    disabled={file} // 파일 선택 시 입력창 비활성화
                />

                {/* 전송 버튼 */}
                <button onClick={sendMessage} className="send-btn" disabled={isUploading}>
                    <FaPaperPlane size={18} />
                </button>
            </div>
        </div>
    );
}

export default ChatComponent;
