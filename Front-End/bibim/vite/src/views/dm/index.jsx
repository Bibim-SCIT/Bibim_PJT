/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import
{
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
    Box,
    Input,
    IconButton,
} from "@mui/material";
import { FaPaperPlane, FaFileUpload } from "react-icons/fa";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from "ui-component/cards/MainCard";
import { ConfigContext } from "contexts/ConfigContext";
import { fetchWorkspaceUsers } from "../../api/workspaceApi";
import { useSelector } from 'react-redux';
import UserLoading from "./components/UserLoading";
import './DmChat.css';

const API_BASE_URL = "http://localhost:8080/api";

const generateRoomId = (wsId, senderEmail, receiverEmail) =>
{
    const cleanEmail = (email) => email.toLowerCase().split("@")[0];
    const emails = [cleanEmail(senderEmail), cleanEmail(receiverEmail)].sort();
    return `dm-${wsId}-${emails[0]}-${emails[1]}`;
};

const isImage = (fileName) => /\.(jpg|jpeg|png|gif)$/i.test(fileName);

// 첫 글자를 가져오는 함수
const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
};

// 시간 포맷팅 함수
const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ChatComponent = ({ wsId, roomId, senderId, receiverId, stompClient, receiverInfo }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem("token");
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

    const uploadFile = async () =>
    {
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
        setIsLoading(true);
        axios.get(`${API_BASE_URL}/dm/messages`, {
            params: { wsId, roomId },
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        })
            .then((res) => {
                setMessages(res.data);
                setTimeout(() => {
                    scrollToBottom();
                    setIsLoading(false);
                }, 100);
            })
            .catch((error) => {
                console.error("메시지 로딩 실패:", error);
                setIsLoading(false);
            });
    }, [wsId, roomId, token]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 300);
        
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!stompClient || !roomId) return;

        const subscription = stompClient.subscribe(`/exchange/dm-exchange/msg.${roomId}`, (message) =>
        {
            try {
                const parsedMessage = JSON.parse(message.body);
                if (parsedMessage.sender !== senderId) {
                    setMessages((prev) => [...prev, parsedMessage]);
                }
            } catch (error) {
                console.error("❌ 메시지 파싱 오류:", error);
            }
        });

        return () => subscription.unsubscribe();
    }, [stompClient, roomId]);

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
    };

    const handleFileSelect = (e) => {
        setFile(e.target.files[0]);
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="dm-chat-container">
            <div className="dm-chat-header">
                <div className="dm-chat-header-info">
                    <div className="dm-chat-header-avatar">
                        {receiverInfo?.profileImage ? (
                            <img src={receiverInfo.profileImage} alt={receiverInfo.nickname} />
                        ) : (
                            getInitials(receiverInfo?.nickname || receiverId)
                        )}
                    </div>
                    <div className="dm-chat-header-text">
                        <div className="dm-chat-header-name">{receiverInfo?.nickname || receiverId}</div>
                        <div className="dm-chat-header-email">{receiverId}</div>
                    </div>
                </div>
            </div>

            <div className="dm-chat-messages">
                {isLoading ? (
                    <UserLoading text="메시지 불러오는중..." />
                ) : messages.length === 0 ? (
                    <div className="dm-no-messages">메시지가 없습니다. 첫 메시지를 보내보세요!</div>
                ) : (
                    messages.map((msg, i) => (
                        <div 
                            key={i} 
                            className={`dm-message ${msg.sender === senderId ? 'dm-my-message' : 'dm-other-message'}`}
                        >
                            {msg.sender !== senderId && (
                                <div className="dm-sender">
                                    <div className="dm-sender-avatar">
                                        {getInitials(msg.sender)}
                                    </div>
                                    <div className="dm-sender-name">
                                        {msg.sender.split('@')[0]}
                                    </div>
                                </div>
                            )}
                            <div className="dm-message-content-container">
                                {msg.isFile ? (
                                    isImage(msg.fileName) ? (
                                        <div className="dm-message-content has-image">
                                            <img
                                                src={msg.dmContent}
                                                alt={msg.fileName}
                                                className="dm-chat-image"
                                            />
                                        </div>
                                    ) : (
                                        <a href={msg.dmContent} target="_blank" rel="noopener noreferrer" className="dm-file-message">
                                            📎 {msg.fileName}
                                        </a>
                                    )
                                ) : (
                                    <div className="dm-message-content">
                                        {msg.dmContent}
                                    </div>
                                )}
                                <div className="dm-message-time">
                                    {formatTime(msg.sendTime)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {file && (
                <div className="dm-file-upload-container">
                    <div className="dm-selected-file">
                        <FaFileUpload size={14} />
                        {file.name}
                        <IconButton 
                            size="small" 
                            className="dm-remove-file" 
                            onClick={handleRemoveFile}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>
                    <Button 
                        variant="contained" 
                        size="small" 
                        onClick={uploadFile}
                        disabled={!file}
                    >
                        업로드
                    </Button>
                </div>
            )}

            <div className="dm-chat-input-box">
                <input
                    type="file"
                    id="file-upload"
                    className="dm-file-upload-input"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                />
                <label htmlFor="file-upload" className="dm-icon-btn">
                    <AddIcon sx={{ fontSize: 24 }} />
                </label>
                
                <TextField
                    className="dm-chat-input"
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    multiline
                    maxRows={4}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                    }}
                />
                
                <button 
                    className="dm-send-btn"
                    onClick={sendMessage}
                    disabled={!message.trim() && !file}
                >
                    <FaPaperPlane size={18} />
                </button>
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


    useEffect(() =>
    {
        const socket = new SockJS("http://localhost:8080/ws/chat");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            onConnect: () => setStompClient(client),
        });

        client.activate();
        return () => client.deactivate();
    }, []);

    useEffect(() =>
    {
        setLoading(true);
        fetchWorkspaceUsers(thisws)
            .then((usersData) =>
            {
                setUsers(usersData);
                setLoading(false);
            })
            .catch((error) =>
            {
                console.error(error);
                setLoading(false);
            });
    }, [thisws]);

    // 자신을 제외한 유저들 목록
    const filteredUsers = users.filter((u) => u.email !== user.email);

    return (
        <MainCard title="DM">
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Card
                        variant="outlined"
                        sx={{
                            border: '1px solid #ddd',
                            borderRadius: 2,
                            boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        <CardContent>
                            <Typography variant="h3">대화 목록</Typography>
                            <Divider />
                            {loading ? (
                                <UserLoading />
                            ) : (
                                filteredUsers.length === 0 ? (
                                    <Typography
                                        variant="h4"
                                        align="center"
                                        sx={{ mt: 3 }}
                                    >
                                        dm 가능한 사용자가 없습니다.
                                    </Typography>
                                ) : (
                                    <List>
                                        {filteredUsers.map((u, i) => (
                                            <ListItem
                                                key={i}
                                                button
                                                onClick={() => setSelectedUser(u)}
                                                sx={{
                                                    backgroundColor: selectedUser?.email === u.email ? "#f0f0f0" : "inherit",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar src={u.profileImage} alt={u.nickname} />
                                                </ListItemAvatar>
                                                <ListItemText primary={u.nickname} secondary={u.email} />
                                            </ListItem>
                                        ))}
                                    </List>
                                )
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={8}>
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
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                            <Typography variant="body1">대화할 상대를 선택하세요.</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </MainCard>
    );
};
