/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
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
    Box,
    Input,
} from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import { ConfigContext } from "contexts/ConfigContext";
import { fetchWorkspaceUsers } from "../../api/workspaceApi";
import { useSelector } from 'react-redux';
import UserLoading from "./components/UserLoading";

const API_BASE_URL = "http://localhost:8080/api";

const generateRoomId = (wsId, senderEmail, receiverEmail) => {
    const cleanEmail = (email) => email.toLowerCase().split("@")[0];
    const emails = [cleanEmail(senderEmail), cleanEmail(receiverEmail)].sort();
    return `dm-${wsId}-${emails[0]}-${emails[1]}`;
};

const isImage = (fileName) => /\.(jpg|jpeg|png|gif)$/i.test(fileName);

export const ChatComponent = ({ wsId, roomId, senderId, receiverId, stompClient }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const token = localStorage.getItem("token");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

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
                }, 100);
            })
            .catch(console.error);
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

        const subscription = stompClient.subscribe(`/exchange/dm-exchange/msg.${roomId}`, (message) => {
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

        setMessages((prev) => [...prev, messageDTO]);
        setMessage("");
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5">채팅 상대: {receiverId}</Typography>
                <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                    {messages.map((msg, i) => (
                        <ListItem key={i}>
                            <ListItemText
                                primary={msg.isFile ? (
                                    isImage(msg.fileName) ? (
                                        <img
                                            src={msg.dmContent}
                                            alt={msg.fileName}
                                            style={{ maxWidth: "300px", maxHeight: "300px" }}
                                        />
                                    ) : (
                                        <a href={msg.dmContent} target="_blank" rel="noopener noreferrer">
                                            📎 {msg.fileName}
                                        </a>
                                    )
                                ) : `${msg.sender === senderId ? "나" : msg.sender}: ${msg.dmContent}`}
                                secondary={msg.sendTime}
                            />
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>
                <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <Button onClick={uploadFile} variant="contained" color="secondary" disabled={!file}>
                    파일 업로드
                </Button>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} variant="contained" color="primary">
                    전송
                </Button>
            </CardContent>
        </Card>
    );
};

export default function DmPage() {
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
        <MainCard title="디엠 페이지">
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
