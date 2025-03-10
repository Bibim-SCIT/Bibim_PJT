import React, { useEffect, useState, useRef, useContext } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
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

const generateRoomId = (senderEmail, receiverEmail) => {
    if (!senderEmail || !receiverEmail) {
        console.error("❌ roomId 생성 실패: 이메일이 null 값임!", senderEmail, receiverEmail);
        return null;
    }
    const cleanEmail = (email) => email.toLowerCase().split("@")[0];
    return `dm-${[cleanEmail(senderEmail), cleanEmail(receiverEmail)].sort().join("-")}`;
};

const ChatComponent = ({ wsId, roomId, senderId, receiverId, stompClient }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!stompClient || !roomId) return;

        console.log("✅ STOMP 구독 설정, roomId:", roomId);

        const subscription = stompClient.subscribe(`/exchange/dm-exchange/msg.${roomId}`, (message) => {
            try {
                const parsedMessage = JSON.parse(message.body);
                console.log("📩 새 메시지 수신:", parsedMessage);

                if (parsedMessage.sender !== senderId) {
                    setMessages((prev) => [...prev, parsedMessage]);
                }
            } catch (error) {
                console.error("❌ 메시지 파싱 오류:", error);
            }
        });

        stompClientRef.current = stompClient;

        return () => {
            console.log("❌ 구독 해제:", roomId);
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
            fileName: null,
            isFile: false,
            isRead: false,
        };

        const token = localStorage.getItem("token");

        console.log("📤 메시지 전송:", messageDTO);

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
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [wsId, setWsId] = useState(11);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        console.log("✅ WebSocket 연결 시작...");
        const socket = new SockJS("http://localhost:8080/ws/chat");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: (str) => console.log("STOMP DEBUG:", str),
            onConnect: () => {
                console.log("✅ WebSocket 연결 성공!");
                setStompClient(client);
            },
            onStompError: (error) => console.error("❌ STOMP 에러:", error),
            onWebSocketClose: () => console.log("⚠️ WebSocket 연결 종료"),
        });

        client.activate();
        return () => client.deactivate();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                if (!wsId) {
                    console.warn("⚠️ wsId 값이 없음. API 호출을 건너뜀.");
                    return;
                }

                const response = await fetchWorkspaceUsers(wsId);
                console.log("📌 가져온 사용자 목록:", response);

                if (Array.isArray(response)) {
                    setUsers(response);
                } else {
                    console.error("🚨 오류: API 응답이 배열이 아님!", response);
                    setUsers([]);
                }
            } catch (error) {
                console.error("🚨 사용자 목록 가져오기 실패:", error);
                setUsers([]);
            }
        };

        fetchUsers();
    }, [wsId]);

    return (
        <MainCard title="디엠 페이지">
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6">대화 목록</Typography>
                            <Divider />
                            <List>
                                {users.length === 0 ? (
                                    <Typography variant="body2">대화할 수 있는 사람이 없습니다.</Typography>
                                ) : (
                                    users
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
                                        ))
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={8}>
                    {selectedUser ? (
                        <ChatComponent
                            wsId={wsId}
                            roomId={generateRoomId(user.email, selectedUser.email)}
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
