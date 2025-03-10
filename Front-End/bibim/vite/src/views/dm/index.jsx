/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef, useContext } from "react";
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
    Grid,
    Divider,
    Box,
} from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import { ConfigContext } from "contexts/ConfigContext";
import { fetchWorkspaceUsers } from "../../api/workspaceApi";
import { useSelector } from 'react-redux';

const generateRoomId = (wsId, senderEmail, receiverEmail) => {
    const cleanEmail = (email) => email.toLowerCase().split("@")[0];
    const emails = [cleanEmail(senderEmail), cleanEmail(receiverEmail)].sort();
    return `dm-${wsId}-${emails[0]}-${emails[1]}`;
};

const ChatComponent = ({ wsId, roomId, senderId, receiverId, stompClient }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        axios.get(`http://localhost:8080/api/chat/messages`, {
            params: { wsId, roomId },
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        })
            .then((res) => {
                console.log("📩 기존 메시지:", res.data);
                setMessages(res.data);
            })
            .catch(console.error);
    }, [wsId, roomId, token]);

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

        return () => {
            subscription.unsubscribe();
        };
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
                <Typography variant="h6">채팅 상대: {receiverId}</Typography>
                <List>
                    {messages.map((msg, i) => (
                        <ListItem key={i}>
                            <ListItemText
                                primary={msg.sender === senderId ? `나: ${msg.dmContent}` : `${msg.sender}: ${msg.dmContent}`}
                                secondary={msg.sendTime}
                            />
                        </ListItem>
                    ))}
                </List>
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
        fetchWorkspaceUsers(wsId)
            .then(setUsers)
            .catch(console.error);
    }, [activeWorkspace]);

    return (
        <MainCard title="디엠 페이지">
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6">대화 목록</Typography>
                            <Divider />
                            <List>
                                {users
                                    .filter((u) => u.email !== user.email)
                                    .map((u, i) => (
                                        <ListItem
                                            key={i}
                                            button
                                            onClick={() => setSelectedUser(u)}
                                            sx={{ backgroundColor: selectedUser?.email === u.email ? "#f0f0f0" : "inherit" }}
                                        >
                                            <ListItemText primary={u.nickname} secondary={u.email} />
                                        </ListItem>
                                    ))}
                            </List>
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
}
