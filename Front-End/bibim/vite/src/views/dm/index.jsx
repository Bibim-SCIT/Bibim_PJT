/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext } from "react";
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
} from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import { ConfigContext } from "contexts/ConfigContext";
import { fetchWorkspaceUsers } from "../../api/workspaceApi";
import { useSelector } from 'react-redux';
import UserLoading from "./components/UserLoading";

const API_BASE_URL = "http://localhost:8080/api";

const generateRoomId = (wsId, senderEmail, receiverEmail) =>
{
    const cleanEmail = (email) => email.toLowerCase().split("@")[0];
    const emails = [cleanEmail(senderEmail), cleanEmail(receiverEmail)].sort();
    return `dm-${wsId}-${emails[0]}-${emails[1]}`;
};

// const isImage = (fileName) => /\.(jpg|jpeg|png|gif)$/i.test(fileName);

const isImage = (fileName) =>
{
    if (!fileName) return false;
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const extension = fileName.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
};

// YouTube 링크 확인 함수
const isYouTubeLink = (url) =>
{
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
};

// YouTube Embed URL 생성 함수
const getYouTubeEmbedUrl = (url) =>
{
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// 메시지 내용 렌더링 함수
const renderMessageContent = (msg) =>
{
    if (msg.file && isImage(msg.fileName)) {
        return (
            <img
                src={msg.dmContent}
                alt="파일 미리보기"
                style={{ maxWidth: "300px", maxHeight: "300px" }}
                onError={(e) => console.error("🚨 이미지 로드 실패:", e.target.src)}
            />
        );
    } else if (msg.isFile) {
        return (
            <a href={msg.dmContent} target="_blank" rel="noopener noreferrer">
                📎 {msg.fileName}
            </a>
        );
    } else if (isYouTubeLink(msg.dmContent)) {
        const embedUrl = getYouTubeEmbedUrl(msg.dmContent);
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
            <div>{msg.dmContent}</div>
        );
    } else {
        return <div>{msg.dmContent}</div>;
    }
};


export const ChatComponent = ({ wsId, roomId, senderId, receiverId, stompClient }) =>
{
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const token = localStorage.getItem("token");

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

    useEffect(() =>
    {
        axios.get(`${API_BASE_URL}/dm/messages`, {
            params: { wsId, roomId },
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        })
            .then((res) => setMessages(res.data))
            .catch(console.error);
    }, [wsId, roomId, token]);

    useEffect(() =>
    {
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

    return (
        <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
            <h2>채팅 상대: {receiverId}</h2>
            <div>
                <div>
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '10px',
                                backgroundColor: '#f9f9f9'
                            }}
                        >
                            <div style={{ fontSize: '14px', color: '#555' }}>
                                {msg.sender === senderId ? "나" : msg.sender}
                            </div>

                            {/* ✅ 메시지 내용 렌더링 */}
                            {renderMessageContent(msg)}

                            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                {msg.sendTime}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={uploadFile} disabled={!file} style={{ marginLeft: '8px' }}>
                파일 업로드
            </button>
            <input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ width: '100%', padding: '8px', marginTop: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button onClick={sendMessage} style={{ backgroundColor: '#007BFF', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>
                전송
            </button>
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
