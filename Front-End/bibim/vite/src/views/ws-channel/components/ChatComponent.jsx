/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ConfigContext } from "../../../contexts/ConfigContext";
import { FaPaperPlane, FaPlus } from "react-icons/fa";
import TagIcon from '@mui/icons-material/Tag';
import { Drawer, List, ListItem, ListItemText, Button, IconButton, Typography } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import { getWorkspaceChannels } from "../../../api/channel";
import { useSelector } from 'react-redux';
import ChannelEditModal from "./ChannelEditModal";
import ChannelCreateModal from "./ChannelCreateModal";
import ChannelLoading2 from "./ChannelLoading2";
import { translateText } from "../../../api/translate";
import TranslateIcon from '@mui/icons-material/Translate';
import MemberStatusModal from './MemberStatusModal';
import ActiveUsersComponent from './ActiveUsersComponent';
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

// .env에서 API URL 불러오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * 채팅 컴포넌트
 * WebSocket을 사용하여 실시간 채팅 기능을 구현한 컴포넌트
 * 
 * @param {string} channelId - 채팅 채널 ID
 * @param {string} workspaceId - 워크스페이스 ID
 */
function ChatComponent({ channelId, workspaceId, channelName, setChannel }) {
    // Context에서 현재 사용자 정보 가져오기
    const { user } = useContext(ConfigContext);

    // 상태 관리
    const [messages, setMessages] = useState([]); // 채팅 메시지 목록
    const [input, setInput] = useState("");      // 입력창 텍스트
    const [file, setFile] = useState(null);      // 선택된 파일
    const [isUploading, setIsUploading] = useState(false); // 파일 업로드 상태
    const [isChatLoading, setIsChatLoading] = useState(false); // ✅ 채팅 로딩 상태 추가

    // 멤버 상태 모달 관련 상태 추가
    const [memberStatusModalOpen, setMemberStatusModalOpen] = useState(false);

    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
    const WSID = activeWorkspace.wsId;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [channels, setChannels] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);

    // ✅ 번역된 메시지를 저장하는 상태 (각 메시지 ID별로 관리)
    const [translatedMessages, setTranslatedMessages] = useState({});

    console.log("번역메시지", translatedMessages);

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
    const renderMessageContent = (msg, handleTranslate, messageIndex, translatedMessage) => {
        // console.log("찍어보기", msg);
        // console.log("인덱스", messageIndex);
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
            // return <div>{msg.content}</div>;
            return (
                <div className="channel-message-wrapper">
                    {/* ✅ 원문 메시지 */}
                    <div className="channel-message-content">
                        {msg.content}
                        {/* ✅ 번역된 메시지 표시 (해당 메시지에만 표시됨) */}
                        {translatedMessage && (
                            <div className="channel-translated-message">
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
                        onClick={() => handleTranslate(messageIndex, msg.content)}
                        sx={{
                            textTransform: "none",  // 대문자 변환 방지
                            fontSize: "0.8rem",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            marginLeft: "5px",
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
        }
    };



    /**
     * 과거 메시지 가져오기 함수
     */
    const fetchMessages = async () => {
        setIsChatLoading(true); // ✅ 로딩 시작
        setMessages([]); // ✅ 기존 메시지 비우기
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/messages/${channelId}`, {
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
        } finally {
            setIsChatLoading(false); // ✅ 로딩 종료
        }
    };

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

        const uploadUrl = `${API_BASE_URL}/api/chat/upload/${channelId}`;
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

    // const handleChannelUpdate = (id, newName) => {
    //     setChannels(channels.map(channel => channel.channelId === id ? { ...channel, channelName: newName } : channel));
    // };

    // 채널 수정시 채팅 헤더에도 즉시 반영
    const handleChannelUpdate = (id, newName) => {
        setChannels(channels.map(channel =>
            channel.channelId === id ? { ...channel, channelName: newName } : channel
        ));
        if (channelId === id) {
            setChannelId(id);
            setChannelName(newName); // ✅ 채팅 헤더에도 즉시 반영
            setChannel(id, newName); // ✅ 채팅 헤더에도 즉시 반영
        }
        setEditModalOpen(false); // ✅ 수정 완료 시 모달 닫기
    };

    const handleChannelCreated = async (id, name) => {
        console.log(`🔄 새 채널로 이동: ${id} - ${name}`);

        try {
            // ✅ 채널 목록을 다시 불러오기 (채널 생성 후 변경사항 반영)
            const updatedChannels = await getWorkspaceChannels(WSID);
            setChannels(updatedChannels);

            // ✅ 새 채널로 이동
            setChannel(id, name);
            setMessages([{ sender: "System", content: "채널이 생성되었습니다! 채팅을 입력해보세요!" }]);

            // ✅ 모달 닫기 (setTimeout으로 상태 변경 반영을 보장)
            setTimeout(() => {
                setCreateModalOpen(false);
                setDrawerOpen(false); // ✅ Drawer 닫기 추가
            }, 200);
        } catch (error) {
            console.error("❌ 채널 목록 갱신 실패:", error);
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



    // ✅ 채널 삭제 핸들러 추가
    const handleChannelDelete = (deletedChannelId) => {
        console.log(`🗑 채널 삭제됨: ${deletedChannelId}`);

        // ✅ 삭제된 채널 목록에서 제거
        setChannels(channels.filter(channel => channel.channelId !== deletedChannelId));

        // ✅ 현재 보고 있는 채널이 삭제된 경우 첫 번째 채널로 이동
        if (channelId === deletedChannelId) {
            if (channels.length > 1) {
                const newChannel = channels.find(channel => channel.channelId !== deletedChannelId);
                if (newChannel) {
                    setChannel(newChannel.channelId, newChannel.channelName);
                }
            } else {
                setChannel(null, ""); // ✅ 모든 채널이 삭제되었을 경우 초기화
            }
        }
    };

    // 채널 선택
    const handleChannelSelect = (id, name) => {
        setIsChatLoading(true); // ✅ 채널 변경 시 로딩 화면 표시
        setMessages([]); // ✅ 기존 채팅 내역 제거
        setChannel(id, name); // ✅ index.jsx의 상태 변경
        setDrawerOpen(false); // ✅ 채널 선택 후 Drawer 닫기
    };
    /**
 * ✅ 1. WebSocket 연결 및 메시지 구독
 */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !channelId || !user) return;

        const socket = new SockJS(`${API_BASE_URL}/ws/chat`);
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

        return () => client.deactivate(); // 연결 해제
    }, [channelId, user]);



    /**
     * ✅ 2. 과거 메시지 가져오기 (채널 변경 시)
     */
    useEffect(() => {
        if (!channelId || !user) return;

        const fetchMessages = async () => {
            setIsChatLoading(true);
            setMessages([]);
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(`${API_BASE_URL}/api/chat/messages/${channelId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("메시지 조회 실패");

                const data = await response.json();
                setMessages(data);

                setTimeout(() => scrollToBottom(), 100);
            } catch (error) {
                console.error("❌ 메시지 조회 오류:", error);
            } finally {
                setIsChatLoading(false);
            }
        };

        fetchMessages();
    }, [channelId, user]);



    /**
     * ✅ 3. 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
     */
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);



    /**
     * ✅ 4. 컴포넌트 최초 마운트 시 스크롤 이동
     */
    useEffect(() => {
        const timer = setTimeout(() => scrollToBottom(), 300);
        return () => clearTimeout(timer);
    }, []);

    /**
     * ✅ 5. 워크스페이스 ID 변경 시 채널 목록 가져오기
     */
    useEffect(() => {
        if (WSID) {
            getWorkspaceChannels(WSID).then(setChannels).catch(console.error);
        }
    }, [WSID]);

    const handleChannelEdit = (channel) => {
        setSelectedChannel(channel);
        setEditModalOpen(true);
    };

    // 채널 변경 감지 (2025.03.14 추가)
    useEffect(() => {
        if (!channelId || !user) return;

        console.log(`🟢 채널 변경 감지: ${channelId}`);

        fetchMessages();
    }, [channelId, user]);

    const getMessageKey = (msg, index) => {
        return msg.Number || `message-${index}`;  // ✅ dmNumber 사용, 없을 경우 index 사용
    };

    console.log(channels);
    console.log("채널 id와 채널명", channelId, channelName);

    return (
        <div className="chat-container">
            {/* 채널 헤더 */}
            <div className="chat-header">
                <div className="channel-info">
                    <TagIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    <span>{channelName} (채널 {channelId})</span>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ marginLeft: "10px" }}
                        onClick={() => setDrawerOpen(true)}
                    >
                        채널 변경
                    </Button>
                </div>
                {/* 멤버 접속 상태 컴포넌트 */}
                <ActiveUsersComponent
                    workspaceId={WSID}
                    toggleMemberStatusModal={() => setMemberStatusModalOpen(!memberStatusModalOpen)}
                />
            </div>

            {/* 메시지 목록 */}
            <div className="chat-messages">
                {isChatLoading ? (
                    <ChannelLoading2 /> // ✅ 로딩 화면 추가
                ) : messages.length === 0 ? (
                    <div className="empty-chat-message">채널이 생성되었습니다! 채팅을 입력해보세요!</div> // ✅ 안내 메시지 표시
                ) : (messages.map((msg, index) => {
                    const messageKey = getMessageKey(msg, index); // ✅ 고유 key 생성
                    console.log("메시지키 확인", messageKey);
                    return (
                        <div
                            // key={index}
                            key={messageKey} // ✅ key 값을 msg.id 또는 index 기반으로 설정
                            className={`message ${msg.sender === user?.email ? "my-message" : "other-message"}`}>
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
                                <span className="sender-name">{msg.nickname}</span>
                                <span className="message-time">
                                    {formatToKoreanTime(msg.sendTime)}
                                </span>
                            </div>

                            {/* 메시지 내용 */}
                            <div key={messageKey} className="message-content-container">
                                {renderMessageContent(msg, handleTranslate, messageKey, translatedMessages[messageKey])}
                            </div>
                        </div>
                    )
                })
                )}
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

            {/* Drawer - 채널 목록 */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div style={{ width: 300, padding: "16px" }}>
                    <h3>채널 선택</h3>
                    <List>
                        {channels.map((channel) => (
                            <ListItem
                                button
                                key={channel.channelId}
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                    handleChannelSelect(channel.channelId, channel.channelName);
                                    setSelectedChannel(channel);
                                    setDrawerOpen(false);
                                }}
                            >
                                <ListItemText primary={`# ${channel.channelName}`} />
                                <IconButton onClick={(e) => {
                                    e.stopPropagation();
                                    handleChannelEdit(channel);
                                }}>
                                    <SettingsIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{
                            marginTop: "16px",
                            backgroundColor: "#3F72AF",
                        }}
                        onClick={() => setCreateModalOpen(true)}
                    >
                        + 채널 생성
                    </Button>
                </div>
            </Drawer>

            <ChannelEditModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                workspaceId={workspaceId}
                channelId={selectedChannel?.channelId}
                currentName={selectedChannel?.channelName}
                onUpdate={handleChannelUpdate}
                onDelete={handleChannelDelete}
            />

            <ChannelCreateModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                workspaceId={workspaceId}
                onChannelCreated={handleChannelCreated}
            />

            {/* 멤버 상태 모달 추가 */}
            <MemberStatusModal
                open={memberStatusModalOpen}
                onClose={() => setMemberStatusModalOpen(false)}
                workspaceId={WSID}
            />
        </div>
    );
}

export default ChatComponent;