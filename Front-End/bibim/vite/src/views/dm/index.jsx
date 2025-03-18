/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
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
    Badge,
} from "@mui/material";
import MessageIcon from '@mui/icons-material/Message';
import { FaPlus, FaPaperPlane } from "react-icons/fa";
import { ConfigContext } from "contexts/ConfigContext";
import MainCard from "ui-component/cards/MainCard";
import { fetchWorkspaceUsers, fetchWorkspaceMembersStatus } from "../../api/workspaceApi";
import "./DmDesign.css";
import UserLoading from "./components/UserLoading";
import ChatLoading from "./components/ChatLoading";
import { styled } from '@mui/system';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { translateText } from "../../api/translate";
import TranslateIcon from '@mui/icons-material/Translate'; // 번역 아이콘 추가

// ✅ API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; // 백엔드 API 기본 URL
const API_BASE_URL2 = `${API_BASE_URL}/api`;

// ✅ DM 방의 고유 ID 생성 함수
const generateRoomId = (wsId, senderEmail, receiverEmail) => {
    const cleanEmail = (email) => email.toLowerCase().split("@")[0];
    const emails = [cleanEmail(senderEmail), cleanEmail(receiverEmail)].sort();
    return `dm-${wsId}-${emails[0]}-${emails[1]}`;
};

// ✅ 파일 이름으로 이미지 여부 확인 함수
const isImage = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const extension = fileName.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
};

// ✅ YouTube 링크 확인 함수
const isYouTubeLink = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
};

// ✅ YouTube 링크로부터 Embed URL 생성 함수
const getYouTubeEmbedUrl = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// ✅ LocalDateTime을 한국 시간으로 포맷팅하는 함수
const formatToKoreanTime = (timestamp) => {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    if (!timestamp) return '';
    return dayjs(timestamp).add(9, 'hour').format('MM-DD HH:mm');
};

// ✅ 메시지 내용을 렌더링하는 함수
const renderMessageContent = (msg, handleTranslate, translatedMessage) => {
    // console.log("찍어보기", msg);

    // ✅ 유튜브 링크인 경우
    if (!msg.isFile && !msg.file && isYouTubeLink(msg.dmContent)) {
        const embedUrl = getYouTubeEmbedUrl(msg.dmContent);
        return embedUrl ? (
            <div className="dm-youtube-wrapper">
                <iframe src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
        ) : (
            <div>{msg.dmContent}</div>
        );
    }

    // ✅ 이미지 파일인 경우
    if (msg.file && isImage(msg.fileName)) {
        return <img src={msg.dmContent} alt="파일 미리보기" className="dm-chat-image" onError={(e) => console.error("🚨 이미지 로드 실패:", e.target.src)} />;
    }

    // ✅ 일반 파일 (이미지가 아닌 파일)인 경우
    if (msg.file && !isImage(msg.fileName)) {
        return <a href={msg.dmContent} target="_blank" rel="noopener noreferrer" className="dm-file-message" download={msg.fileName}>📎 {msg.fileName}</a>;
    }

    // ✅ 일반 채팅인 경우 (위 조건을 모두 통과한 경우)
    return (
        <div className="dm-message-wrapper">
            {/* ✅ 원문 메시지 */}
            <div className="dm-message-content">
                {msg.dmContent}
                {/* ✅ 번역된 메시지 표시 (해당 메시지에만 표시됨) */}
                {translatedMessage && (
                    <div className="dm-translated-message">
                        {/* <small>{translatedMessage}</small> */}
                        <Typography variant="body1" color="textSecondary">
                            {translatedMessage}
                        </Typography>
                    </div>
                )}
            </div>

            {/* ✅ 번역 버튼 */}
            <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<TranslateIcon />}
                onClick={() => handleTranslate(msg.dmNumber, msg.dmContent)}
                sx={{
                    textTransform: "none",  // 대문자 변환 방지
                    fontSize: "0.8rem",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#007BFF",
                    "&:hover": {
                        backgroundColor: "#0056b3"
                    }
                }}
            >
                번역
            </Button>

        </div>
    );
};

const StyledBadge = styled(Badge)(({ theme, status }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: status === 'online' ? '#44b700' : '#777',
        color: status === 'online' ? '#44b700' : '#777',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: status === 'online' ? 'ripple 1.2s infinite ease-in-out' : 'none',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

// ✅ ChatComponent 정의
export const ChatComponent = ({ wsId, roomId, senderId, receiverId, stompClient, receiverInfo }) => {
    const [messages, setMessages] = useState([]); // 메시지 목록 상태 관리
    const [message, setMessage] = useState(""); // 현재 입력된 메시지 상태 관리
    const [file, setFile] = useState(null); // 선택된 파일 상태 관리
    const token = localStorage.getItem("token");
    const messagesEndRef = useRef(null); // 메시지 목록 끝 위치를 참조
    const [loading, setLoading] = useState(false); // 메시지 로딩 상태 관리

    // ✅ ConfigContext에서 현재 로그인한 사용자 정보 가져오기
    const { user } = useContext(ConfigContext);

    // ✅ 번역된 메시지를 저장하는 상태 (각 메시지 ID별로 관리)
    const [translatedMessages, setTranslatedMessages] = useState({});

    console.log("번역메시지", translatedMessages);


    // ✅ 메시지 목록 스크롤을 맨 아래로 이동
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // ✅ 파일 업로드 함수
    const uploadFile = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("sender", senderId);
        formData.append("receiver", receiverId);
        formData.append("wsId", wsId);

        try {
            const response = await axios.post(`${API_BASE_URL2}/dm/upload`, formData, {
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
        setLoading(true);

        if (!roomId || !wsId) {
            setLoading(false);
            return;
        }

        console.log("하이로", roomId, wsId);
        console.log("메시지불", `${API_BASE_URL2}`);

        axios.get(`${API_BASE_URL2}/dm/messages`, {
            params: { wsId, roomId },
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        })
            .then((res) => {
                // 메시지에 프로필 이미지 정보 추가
                const messagesWithProfile = res.data.map(msg => {
                    // 상대방 메시지인 경우 receiverInfo의 프로필 이미지 사용
                    if (msg.sender === receiverId && receiverInfo) {
                        return {
                            ...msg,
                            profileImage: receiverInfo.profileImage
                        };
                    }
                    return msg;
                });

                setMessages(messagesWithProfile);

                setLoading(false);
                setTimeout(scrollToBottom, 100);
            })
            .catch((error) => {
                console.error("❌ 메시지 로드 실패:", error);
                setLoading(false);
            });
    }, [wsId, roomId, token, receiverId, receiverInfo]);

    // ✅ WebSocket을 통해 실시간 메시지 수신 처리
    useEffect(() => {
        if (!stompClient || !roomId) return;

        const subscription = stompClient.subscribe(`/exchange/dm-exchange/msg.${roomId}`, (message) => {
            try {
                const parsedMessage = JSON.parse(message.body);
                // 자기 자신의 메시지인지 확인하여 필터링
                if (parsedMessage.sender !== user?.email) {
                    setMessages((prev) => [...prev, parsedMessage]); // 실시간 메시지 추가
                }

                // 상대방 메시지인 경우 프로필 이미지 추가
                if (parsedMessage.sender !== senderId && receiverInfo) {
                    parsedMessage.profileImage = receiverInfo.profileImage;
                }

                setMessages((prev) => [...prev, parsedMessage]);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error("❌ 메시지 파싱 오류:", error);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [stompClient, roomId, senderId, receiverInfo]);

    // ✅ 메시지가 업데이트되면 자동으로 스크롤 이동
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    // ✅ 메시지 전송 함수
    const sendMessage = () => {

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

        // ✅ setMessages 제거하여 중복 메시지 방지
        setMessage("");

        // 이게 있으면 바로 올라오는데, 문제는 메세지가 두번 올라오는 문제가 발생함
        // 느리더라도 메세지가 한번만 올라오게 하는 방법임
        // setMessages((prev) => [...prev, messageDTO]);
        setMessage("");
        setTimeout(scrollToBottom, 100);
    };

    // ✅ Enter 키로 메시지 전송
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ✅ 번역 기능 함수 (번역된 메시지 상태를 개별적으로 저장)
    const handleTranslate = async (msgId, text) => {
        console.log("번역 실행?", msgId, text);

        if (!msgId) {
            console.error("🚨 msgId가 undefined입니다. 번역을 실행할 수 없습니다.");
            return;
        }

        console.log("번역 실행 시작!");

        setTranslatedMessages({}); // 기존 번역 메시지 초기화

        // ✅ 언어 코드 맵핑 설정
        const langMap = {
            ko: "ko",
            en: "en",
            jp: "ja",  // ✅ 'jp'를 'ja'로 변환
        };

        // ✅ 현재 로그인한 사용자의 언어 설정 가져오기
        const targetLang = langMap[user.language] || "en";  // 기본값은 영어(en)
        const translated = await translateText(text, targetLang);

        console.log("번역시키기", translated);
        console.log("번역할 언어:", targetLang);

        setTranslatedMessages((prev) => ({
            ...prev,
            [msgId]: translated, // ✅ msgId가 undefined가 아닌 값이 되도록 보장
        }));
    };


    const getMessageKey = (msg, index) => {
        return msg.dmNumber || `message-${index}`;  // ✅ dmNumber 사용, 없을 경우 index 사용
    };



    return (
        <div className="dm-chat-area" style={{ width: "100%" }}>
            {/* 채팅 헤더 */}
            <div className="dm-chat-header">
                <div className={`dm-chat-header-avatar ${receiverInfo?.status === 'online' ? 'online' : 'offline'}`}>
                    {receiverInfo?.profileImage ? (
                        <Avatar
                            src={receiverInfo.profileImage}
                            alt={receiverInfo.nickname}
                            sx={{ width: 36, height: 36 }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: '#007AFF',
                                fontSize: '16px'
                            }}
                        >
                            {receiverId.charAt(0).toUpperCase()}
                        </Avatar>
                    )}
                </div>

                <div className="dm-chat-header-info">
                    <div className="dm-chat-header-name">
                        {receiverInfo?.nickame || receiverId.split('@')[0]}
                    </div>
                    <div className="dm-chat-header-email">{receiverId}</div>
                </div>
            </div>
            {/* 메시지 목록 */}
            {loading ? (  // ✅ 로딩 중에는 로딩 화면 표시
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <ChatLoading />
                </div>
            ) : (
                <div className="dm-chat-messages">
                    {messages.map((msg, index) => {
                        const messageKey = getMessageKey(msg, index); // ✅ 고유 key 생성
                        // console.log("메시지키 확인", messageKey);
                        return (
                            <div
                                // key={index}
                                // key={msg.id || `message-${index}`}  // ✅ msg.id가 없으면 index 사용
                                key={messageKey} // ✅ key 값을 msg.id 또는 index 기반으로 설정
                                className={`dm-message ${msg.sender === senderId ? "dm-my-message" : "dm-other-message"}`}
                            >
                                {/* 발신자 정보 */}
                                <div className="dm-sender">
                                    {msg.sender !== senderId && (
                                        <>
                                            <div className="dm-sender-avatar">
                                                {msg.profileImage ? (
                                                    <Avatar
                                                        src={msg.profileImage}
                                                        alt={msg.sender}
                                                        sx={{ width: 28, height: 28 }}
                                                    />
                                                ) : (
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            bgcolor: '#007AFF',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {msg.sender.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                )}
                                            </div>
                                            <span className="dm-sender-name">
                                                {msg.nickname}
                                            </span>
                                        </>
                                    )}
                                    <span className="dm-message-time">
                                        {formatToKoreanTime(msg.sendTime)}
                                    </span>
                                </div>
                                <div className="dm-message-content-container">
                                    <div key={messageKey} className={`dm-message-content ${(msg.file && isImage(msg.fileName)) || isYouTubeLink(msg.dmContent) ? "has-media" : ""}`}>
                                        {/* {renderMessageContent(msg, handleTranslate, translatedMessages)} */}
                                        {/* 메시지 렌더링 */}
                                        {renderMessageContent(msg, handleTranslate, translatedMessages[messageKey])}
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

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

export default function DmPage() {
    // ✅ ConfigContext에서 현재 로그인한 사용자 정보 가져오기
    const { user } = useContext(ConfigContext);

    // ✅ Redux에서 현재 활성화된 워크스페이스 가져오기
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
    const thisws = activeWorkspace?.wsId; // 워크스페이스 ID 가져오기

    const [users, setUsers] = useState([]); // 워크스페이스에 속한 사용자 목록 상태
    const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 상태
    const [wsId, setWsId] = useState(thisws); // 현재 워크스페이스 ID 상태
    const [stompClient, setStompClient] = useState(null); // WebSocket 클라이언트 상태
    const [loading, setLoading] = useState(true); // 사용자 로딩 상태

    console.log("dm 접속자", user);

    // 워크스페이스 ID 변경 시 상태 업데이트
    useEffect(() => {
        if (thisws) {
            setWsId(thisws);
        }
    }, [thisws]);

    // ✅ WebSocket 클라이언트 초기화 및 연결 설정
    useEffect(() => {
        const socket = new SockJS(`${API_BASE_URL}/ws/chat`);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            onConnect: () => setStompClient(client), // 연결 완료 시 클라이언트 상태 설정
        });

        client.activate(); // WebSocket 연결 활성화

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => client.deactivate();
    }, []);

    // ✅ 워크스페이스 사용자를 가져오는 비동기 처리
    useEffect(() => {
        setLoading(true);

        // wsId가 없으면 API 호출하지 않음
        if (!wsId) {
            setLoading(false);
            return;
        }

        const fetchUsersAndStatus = async () => {
            try {
                // 1. 워크스페이스 멤버 목록 가져오기
                const usersData = await fetchWorkspaceUsers(wsId);

                // 2. 워크스페이스 멤버의 접속 상태 가져오기
                const statusData = await fetchWorkspaceMembersStatus(wsId);

                if (!statusData || statusData.length === 0) {
                    // 접속 상태 데이터가 없는 경우 모든 사용자를 오프라인으로 표시
                    const offlineUsers = usersData.map(user => ({
                        ...user,
                        status: 'offline'
                    }));
                    setUsers(offlineUsers);
                    return;
                }

                // 3. usersData에 statusData를 매핑하여 온라인/오프라인 상태 추가
                const updatedUsers = usersData.map(user => {
                    // 이메일로 상태 데이터 찾기
                    const userStatus = statusData.find(status => status.email === user.email);

                    // 상태 데이터가 있으면 해당 상태 사용, 없으면 오프라인으로 설정
                    return {
                        ...user,
                        status: userStatus?.status || 'offline'
                    };
                });

                setUsers(updatedUsers);
            } catch (error) {
                console.error("🚨 사용자 목록 및 접속 상태 불러오기 실패:", error);
                // 오류 발생 시 기존 사용자 목록을 모두 오프라인으로 표시
                if (users.length > 0) {
                    const offlineUsers = users.map(user => ({
                        ...user,
                        status: 'offline'
                    }));
                    setUsers(offlineUsers);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsersAndStatus();
    }, [wsId]);

    // ✅ 현재 로그인된 사용자를 제외한 사용자 목록 필터링
    const filteredUsers = users.filter((u) => u.email !== user.email);

    return (
        <MainCard>
            <div className="dm-grid-container">

                {/* 사용자 목록 영역 */}
                <div className="dm-users-card">
                    <div className="dm-users-header">
                        <h3>대화 목록</h3>
                    </div>
                    <Divider />

                    <div className="dm-users-list">
                        {loading ? (
                            // ✅ 사용자 목록 로딩 중일 때 표시
                            <div className="dm-loading">
                                <div className="dm-loading-spinner"></div>
                                <span>사용자 로딩 중...</span>
                            </div>
                        ) : (
                            filteredUsers.length === 0 ? (
                                // ✅ DM 가능한 사용자가 없는 경우 표시
                                <div className="dm-no-users">
                                    DM 가능한 사용자가 없습니다.
                                </div>
                            ) : (
                                // ✅ 사용자 목록 렌더링
                                filteredUsers.map((u, i) => (
                                    <div
                                        key={i}
                                        className={`dm-user-item ${selectedUser?.email === u.email ? "selected" : ""}`}
                                        onClick={() => setSelectedUser(u)} // 클릭 시 사용자 선택
                                    >
                                        <div className={`dm-user-avatar ${u.status === 'online' ? 'online' : 'offline'}`}>
                                            {u.profileImage ? (
                                                <Avatar
                                                    src={u.profileImage}
                                                    alt={u.nickname}
                                                    sx={{ width: 40, height: 40 }}
                                                />
                                            ) : (
                                                <Avatar
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        bgcolor: '#007AFF',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    {u.email.charAt(0).toUpperCase()}
                                                </Avatar>
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

                    {selectedUser && wsId ? (
                        // ✅ 사용자가 선택된 경우 채팅 컴포넌트 렌더링

                        <ChatComponent
                            wsId={wsId}
                            roomId={generateRoomId(wsId, user.email, selectedUser.email)}
                            senderId={user.email}
                            receiverId={selectedUser.email}
                            stompClient={stompClient}
                            receiverInfo={selectedUser}
                        />
                    ) : (
                        // ✅ 사용자가 선택되지 않았을 때 표시
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
