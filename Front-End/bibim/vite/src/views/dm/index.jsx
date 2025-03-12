/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from 'react-redux';
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Grid,
    Divider,
} from "@mui/material";
import MessageIcon from '@mui/icons-material/Message';
import { FaPlus, FaPaperPlane } from "react-icons/fa";
import { ConfigContext } from "contexts/ConfigContext";
import MainCard from "ui-component/cards/MainCard";
import { fetchWorkspaceUsers } from "../../api/workspaceApi";
import "./DmDesign.css";
import UserLoading from "./components/UserLoading";
import ChatLoading from "./components/ChatLoading";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const API_BASE_URL = "http://localhost:8080/api";

const generateRoomId = (wsId, senderEmail, receiverEmail) => {
    const cleanEmail = (email) => email.toLowerCase().split("@")[0];
    const emails = [cleanEmail(senderEmail), cleanEmail(receiverEmail)].sort();
    return `dm-${wsId}-${emails[0]}-${emails[1]}`;
};

// const isImage = (fileName) => /\.(jpg|jpeg|png|gif)$/i.test(fileName);

const isImage = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const extension = fileName.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
};

// YouTube 링크 확인 함수
const isYouTubeLink = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
};

// YouTube Embed URL 생성 함수
const getYouTubeEmbedUrl = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

/**
 * LocalDateTime을 Asia/Seoul 시간대로 변환하고 포맷팅하는 함수
 * @param {string} timestamp - 서버에서 전달된 LocalDateTime
 * @returns {string} - 변환된 시간 
 */
const formatToKoreanTime = (timestamp) =>
{
        dayjs.extend(utc);
        dayjs.extend(timezone);
    
        if (!timestamp) return '';
        // 서버에서 localdatetime으로 전달되므로 UTC로 변환 후 서울로 변환
        // 위 방법 대로 했음에도 불구하고 09시간 오차가 계속 발생 하여 강제로 9시간 추가
        return dayjs(timestamp).add(9, 'hour').format('MM-DD HH:mm');
};


// 메시지 내용 렌더링 함수
const renderMessageContent = (msg) =>
{
    // 유튜브 링크 확인 (파일이 아닌 경우에만)
    if (!msg.isFile && !msg.file && isYouTubeLink(msg.dmContent)) {
        const embedUrl = getYouTubeEmbedUrl(msg.dmContent);
        return embedUrl ? (
            <div className="dm-youtube-wrapper">
                <iframe
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        ) : (
            <div>{msg.dmContent}</div>
        );
    } 
    // 이미지 파일인 경우
    else if (msg.file && isImage(msg.fileName)) {
        return (
            <img
                src={msg.dmContent}
                alt="파일 미리보기"
                className="dm-chat-image"
                onError={(e) => console.error("🚨 이미지 로드 실패:", e.target.src)}
            />
        );
    } 
    // 일반 파일인 경우
    else if (msg.isFile) {
        return (
            <a href={msg.dmContent} target="_blank" rel="noopener noreferrer" className="dm-file-message">
                📎 {msg.fileName}
            </a>
        );
    } 
    // 일반 텍스트 메시지
    else {
        return <div>{msg.dmContent}</div>;
    }
};

export const ChatComponent = ({ wsId, roomId, senderId, receiverId, stompClient, receiverInfo }) =>
{
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const token = localStorage.getItem("token");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () =>
    {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const [loading, setLoading] = useState(false);  // ✅ 추가


    const uploadFile = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("sender", senderId);
        formData.append("receiver", receiverId);
        formData.append("wsId", wsId);

        try {
            const response = await axios.post(`${API_BASE_URL}/dm/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            setMessages((prev) => [...prev, response.data]);
            setFile(null);
        } catch (error) {
            console.error("🚨 파일 업로드 실패:", error);
        }
    };

    useEffect(() => {
        setLoading(true);  // ✅ 새로운 roomId가 들어오면 로딩 시작
        axios.get(`${API_BASE_URL}/dm/messages`, {
            params: { wsId, roomId },
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        })
            .then((res) => {
                setMessages(res.data);
                setLoading(false); // ✅ 데이터 로드 완료 후 로딩 종료
                setTimeout(scrollToBottom, 100);
            })
            .catch((error) => {
                console.error("❌ 메시지 로드 실패:", error);
                setLoading(false);
            });
    }, [wsId, roomId, token]);

    useEffect(() => {
        if (!stompClient || !roomId) return;

        const subscription = stompClient.subscribe(`/exchange/dm-exchange/msg.${roomId}`, (message) => {
            try {
                const parsedMessage = JSON.parse(message.body);
                if (parsedMessage.sender !== senderId) {
                    setMessages((prev) => [...prev, parsedMessage]);
                    setTimeout(scrollToBottom, 100);
                }
            } catch (error) {
                console.error("❌ 메시지 파싱 오류:", error);
            }
        });

        return () => subscription.unsubscribe();
    }, [stompClient, roomId]);

    useEffect(() =>
    {
        scrollToBottom();
    }, [messages]);

    const sendMessage = () =>
    {
        if (!message.trim() || !stompClient) return;

        const messageDTO = {
            wsId,
            sender: senderId,
            receiver: receiverId,
            dmContent: message,
            isFile: false,
            isRead: false,
            sendTime: new Date().toISOString(),
        };

        stompClient.publish({
            destination: "/app/dm.sendMessage",
            body: JSON.stringify(messageDTO),
            headers: { Authorization: `Bearer ${token}` },
        });

        setMessages((prev) => [...prev, messageDTO]);
        setMessage("");
        setTimeout(scrollToBottom, 100);
    };

    const handleKeyPress = (e) =>
    {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="dm-chat-area" style={{ width: "100%" }}>
            {/* 채팅 헤더 */}
            <div className="dm-chat-header">
                <div className="dm-chat-header-avatar">
                    {receiverInfo?.profileImage ? (
                        <img src={receiverInfo.profileImage} alt={receiverInfo.nickname} />
                    ) : (
                        <div className="dm-default-avatar">
                            {receiverId.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="dm-chat-header-info">
                    <div className="dm-chat-header-name">
                        {receiverInfo?.nickname || receiverId.split('@')[0]}
                    </div>
                    <div className="dm-chat-header-email">{receiverId}</div>
                </div>
            </div>
            {/* 메시지 목록 */}
            <div className="dm-chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`dm-message ${msg.sender === senderId ? "dm-my-message" : "dm-other-message"}`}>
                        {/* 발신자 정보 */}
                        <div className="dm-sender">
                            {msg.sender !== senderId && (
                                <>
                                    <div className="dm-sender-avatar">
                                        {msg.profileImage ? (
                                            <img src={msg.profileImage} alt={msg.sender} />
                                        ) : (
                                            <div className="dm-default-avatar">
                                                {msg.sender.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="dm-sender-name">
                                        {msg.sender.split('@')[0]}
                                    </span>
                                </>
                            )}
                            <span className="dm-message-time">
                                {new Date(msg.sendTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="dm-message-content-container">
                            <div className={`dm-message-content ${(msg.file && isImage(msg.fileName)) || isYouTubeLink(msg.dmContent) ? "has-media" : ""}`}>
                                {renderMessageContent(msg)}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="dm-chat-input-box">
                <div className="dm-file-upload">
                    <input 
                        type="file" 
                        id="dm-file-upload" 
                        className="dm-file-upload-input" 
                        onChange={(e) => setFile(e.target.files[0])} 
                    />
                    <label htmlFor="dm-file-upload" className="dm-file-upload-label">
                        <FaPlus />
                    </label>
                    {file && <span className="dm-selected-file">{file.name}</span>}
                </div>
                
                {file ? (
                    <button 
                        onClick={uploadFile} 
                        className="dm-send-btn" 
                        disabled={!file}
                    >
                        <FaPaperPlane />
                    </button>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="메시지를 입력하세요..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="dm-chat-input"
                        />
                        <button 
                            onClick={sendMessage} 
                            className="dm-send-btn" 
                            disabled={!message.trim()}
                        >
                            <FaPaperPlane />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function DmPage()
{
    const { user } = useContext(ConfigContext);
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
    const thisws = activeWorkspace?.wsId;
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [wsId, setWsId] = useState(thisws);
    const [stompClient, setStompClient] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws/chat");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            onConnect: () => setStompClient(client),
        });

        client.activate();
        return () => client.deactivate();
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchWorkspaceUsers(thisws)
            .then((usersData) => {
                setUsers(usersData);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [thisws]);

    // 자신을 제외한 유저들 목록
    const filteredUsers = users.filter((u) => u.email !== user.email);

    return (
        <MainCard>
            <div className="dm-grid-container">
                {/* 사용자 목록 */}
                <div className="dm-users-card">
                    <div className="dm-users-header">
                        <h3>대화 목록</h3>
                    </div>
                    <Divider />
                    <div className="dm-users-list">
                        {loading ? (
                            <div className="dm-loading">
                                <div className="dm-loading-spinner"></div>
                                <span>사용자 로딩 중...</span>
                            </div>
                        ) : (
                            filteredUsers.length === 0 ? (
                                <div className="dm-no-users">
                                    DM 가능한 사용자가 없습니다.
                                </div>
                            ) : (
                                filteredUsers.map((u, i) => (
                                    <div
                                        key={i}
                                        className={`dm-user-item ${selectedUser?.email === u.email ? "selected" : ""}`}
                                        onClick={() => setSelectedUser(u)}
                                    >
                                        <div className="dm-user-avatar">
                                            {u.profileImage ? (
                                                <img src={u.profileImage} alt={u.nickname} />
                                            ) : (
                                                <div className="dm-default-avatar">
                                                    {u.email.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="dm-user-info">
                                            <div className="dm-user-name">{u.nickname || u.email.split('@')[0]}</div>
                                            <div className="dm-user-email">{u.email}</div>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>

                {/* 채팅 영역 */}
                <div style={{ width: "70%", height: "100%", display: "flex" }}>
                    {selectedUser ? (
                        <ChatComponent
                            wsId={wsId}
                            roomId={generateRoomId(wsId, user.email, selectedUser.email)}
                            senderId={user.email}
                            receiverId={selectedUser.email}
                            stompClient={stompClient}
                            receiverInfo={selectedUser}
                        />
                    ) : (
                        <div className="dm-chat-area">
                            <div className="dm-no-chat-selected">
                                <MessageIcon className="dm-no-chat-icon" style={{ fontSize: 48 }} />
                                <div className="dm-no-chat-text">대화할 상대를 선택하세요.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainCard>
    );
};
