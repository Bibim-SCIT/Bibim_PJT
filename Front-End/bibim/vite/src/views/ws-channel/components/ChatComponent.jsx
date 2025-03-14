/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ConfigContext } from "../../../contexts/ConfigContext";
import { FaPaperPlane, FaPlus } from "react-icons/fa";
import TagIcon from '@mui/icons-material/Tag';
import PersonIcon from '@mui/icons-material/Person';
import { fetchWorkspaceUsers } from "../../../api/workspaceApi";
import "./ChatComponent.css";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

/**
 * LocalDateTime을 Asia/Seoul 시간대로 변환하고 포맷팅하는 함수
 * @param {string} timestamp - 서버에서 전달된 LocalDateTime
 * @returns {string} - 변환된 시간 
 */
const formatToKoreanTime = (timestamp) => {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    if (!timestamp) return '';
    // 서버에서 localdatetime으로 전달되므로 UTC로 변환 후 서울로 변환
    // 위 방법 대로 했음에도 불구하고 09시간 오차가 계속 발생 하여 강제로 9시간 추가
    return dayjs(timestamp).add(9, 'hour').format('MM-DD HH:mm');
};


/**
 * 채팅 컴포넌트
 * WebSocket을 사용하여 실시간 채팅 기능을 구현한 컴포넌트
 * 
 * @param {string} channelId - 채팅 채널 ID
 * @param {string} workspaceId - 워크스페이스 ID
 */
function ChatComponent({ channelId, workspaceId }) {
    // Context에서 현재 사용자 정보 가져오기
    const { user } = useContext(ConfigContext);

    // 상태 관리
    const [messages, setMessages] = useState([]); // 채팅 메시지 목록
    const [input, setInput] = useState("");      // 입력창 텍스트
    const [file, setFile] = useState(null);      // 선택된 파일
    const [isUploading, setIsUploading] = useState(false); // 파일 업로드 상태
    const [activeUsers, setActiveUsers] = useState([]); // 접속 중인 사용자 목록
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // WebSocket 클라이언트 참조
    const stompClientRef = useRef(null);
    // 메시지 컨테이너 참조 추가
    const messagesEndRef = useRef(null);

    /**
     * 스크롤을 맨 아래로 이동시키는 함수
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

    /**
     * YouTube 링크 여부 확인 함수
     * @param {string} url - 메시지 내용
     * @returns {boolean} YouTube 링크인지 여부
     */
    const isYouTubeLink = (url) => {
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
    };

    /**
     * YouTube Embed URL 생성 함수
     * @param {string} url - YouTube URL
     * @returns {string} 임베드 URL
     */
    const getYouTubeEmbedUrl = (url) => {
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
    };

    /**
     * 메시지 내용 렌더링 함수
     */
    const renderMessageContent = (msg) => {
        if (msg.messageOrFile && msg.content) {
            return isImageFile(msg.content) ? (
                <img src={msg.content} alt="파일 미리보기" className="chat-image" />
            ) : (
                <a href={msg.content} target="_blank" rel="noopener noreferrer" className="file-message" download={msg.fileName}>
                    📎 파일 다운로드 : {msg.fileName}
                </a>
            );
        } else if (isYouTubeLink(msg.content)) {
            const embedUrl = getYouTubeEmbedUrl(msg.content);
            return embedUrl ? (
                <div className="youtube-wrapper">
                    <iframe
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                <div>{msg.content}</div>
            );
        } else {
            return <div>{msg.content}</div>;
        }
    };



    /**
     * 과거 메시지 가져오기 함수
     */
    const fetchMessages = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/chat/messages/${channelId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("메시지 조회 실패");

            const data = await response.json();
            setMessages(data); // 기존 메시지 상태에 추가


            // 메시지 로드 후 약간의 지연을 두고 스크롤 이동
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        } catch (error) {
            console.error("❌ 메시지 조회 오류:", error);
        }
    };

    /**
     * WebSocket 연결 설정 및 과거 메시지 로딩 추가
     */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !channelId || !user) return;

        // ✅ 과거 메시지 먼저 가져오기
        fetchMessages();

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
                        setMessages((prev) => [...prev, parsedMessage]); // 실시간 메시지 추가
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
        const currentTime = new Date().toISOString();
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
                    fileName: file.name,
                    sendTime: currentTime,
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
                sendTime: currentTime,
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

    /**
     * 메시지 상태가 변경될 때마다 스크롤을 맨 아래로 이동
     */

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    /**
     * 컴포넌트 마운트 시 한 번 스크롤 이동
     */
    useEffect(() => {
        // 컴포넌트가 마운트된 후 약간의 지연을 두고 스크롤 이동
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 300);

        return () => clearTimeout(timer);
    }, []);

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
                    {isLoading ? (
                        <span>멤버 정보 로딩 중...</span>
                    ) : error ? (
                        <span className="error-text">{error}</span>
                    ) : (
                        <>
                            <span>{activeUsers.length}명의 멤버</span>
                            <div className="active-users-list">
                                {activeUsers.map((member, index) => (
                                    <div key={index} className="active-user">
                                        <div className="user-avatar">
                                            {member.profileImage ? (
                                                <img src={member.profileImage} alt={member.email} />
                                            ) : (
                                                <div className="default-avatar">
                                                    {member.email.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="user-info">
                                            <span className="user-email">{member.email}</span>
                                            {member.nickname && <span className="user-nickname">({member.nickname})</span>}
                                        </div>
                                        <div className="user-status">
                                            <span className={`status-dot ${member.loginStatus ? 'online' : 'offline'}`} />
                                            <span className="member-role">{member.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
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
                            <span className="message-time">
                                {formatToKoreanTime(msg.sendTime)}
                            </span>
                        </div>

                        {/* 메시지 내용 */}
                        <div className="message-content-container">
                            {renderMessageContent(msg)}
                        </div>
                    </div>
                ))}
                {/* 스크롤 위치 참조를 위한 빈 div 추가 */}
                <div ref={messagesEndRef} />
            </div>


            {/* 메시지 입력 영역 */}
            <div className="chat-input-box">
                {/* 파일 업로드 영역 */}
                <div className="file-upload">
                    <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="icon-btn">
                        <FaPlus />
                    </label>
                    {file && <span className="selected-file">{file.name}</span>}
                </div>

                {file ? (
                    <button
                        onClick={sendMessage}
                        className="send-btn"
                        disabled={isUploading}
                    >
                        <FaPaperPlane />
                    </button>
                ) : (
                    <>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="chat-input"
                        />
                        <button
                            onClick={sendMessage}
                            className="send-btn"
                            disabled={!input.trim()}
                        >
                            <FaPaperPlane />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ChatComponent;