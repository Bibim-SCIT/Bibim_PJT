    // import React, { useEffect, useState, useRef, useContext } from "react";
    // import SockJS from "sockjs-client";
    // import { Client } from "@stomp/stompjs";
    // import { TextField, Button, Card, CardContent, Typography, List, ListItem, ListItemText } from "@mui/material";
    // import { ConfigContext } from "contexts/ConfigContext";

    // export default function ChatComponent({ wsId, receiverId }) {
    //     const { user } = useContext(ConfigContext);
    //     const [messages, setMessages] = useState([]);
    //     const [input, setInput] = useState("");
    //     const stompClientRef = useRef(null);
    //     const roomId = `dm_${wsId}_${[user.email, receiverId].sort().join("_")}`;

    //     // ✅ WebSocket 연결
    //     useEffect(() => {
    //         const socket = new SockJS("http://localhost:8080/ws/chat");
    //         const client = new Client({
    //             webSocketFactory: () => socket,
    //             connectHeaders: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    //             onConnect: () => {
    //                 client.subscribe(`/exchange/dm-exchange/msg.${roomId}`, (message) => {
    //                     const newMessage = JSON.parse(message.body);
    //                     setMessages((prev) => [...prev, newMessage]);
    //                 });
    //                 stompClientRef.current = client;
    //             },
    //         });
        
    //         client.activate();
    //         return () => client.deactivate();
    //     }, [roomId]);
        

    //     // ✅ 기존 메시지 가져오기
    //     useEffect(() => {
    //         fetch(`/api/chat/messages?wsId=${wsId}&sender=${user.email}&receiver=${receiverId}`)
    //             .then((res) => res.json())
    //             .then(setMessages)
    //             .catch(console.error);
    //     }, [wsId, receiverId]);

    //     // ✅ 메시지 읽음 처리
    //     useEffect(() => {
    //         fetch(`/api/chat/read?wsId=${wsId}&sender=${receiverId}&receiver=${user.email}`, {
    //             method: "POST",
    //         });
    //     }, [messages]);

    //     // ✅ 메시지 전송
    //     const sendMessage = () => {
    //         if (!input.trim() || !stompClientRef.current) return;
        
    //         stompClientRef.current.publish({
    //             destination: `/app/dm.sendMessage`,
    //             body: JSON.stringify({
    //                 wsId,
    //                 sender: user.email,
    //                 receiver: receiverId,
    //                 dmContent: input,
    //                 isFile: false,
    //                 isRead: false,
    //             }),
    //         });
        
    //         setInput(""); // ✅ 입력값만 초기화, 메시지는 STOMP 수신으로만 추가
    //     };
        

    //     return (
    //         <Card variant="outlined">
    //             <CardContent>
    //                 <Typography variant="h6">채팅 상대: {receiverId}</Typography>
    //                 <List>
    //                     {messages.map((msg, i) => (
    //                         <ListItem key={i}>
    //                             <ListItemText
    //                                 primary={msg.sender === user.email ? `나: ${msg.dmContent}` : `${msg.sender}: ${msg.dmContent}`}
    //                             />
    //                         </ListItem>
    //                     ))}
    //                 </List>
    //                 <TextField
    //                     fullWidth
    //                     variant="outlined"
    //                     placeholder="메시지를 입력하세요..."
    //                     value={input}
    //                     onChange={(e) => setInput(e.target.value)}
    //                     onKeyDown={(e) => e.key === "Enter" && sendMessage()}
    //                 />
    //                 <Button onClick={sendMessage} variant="contained" color="primary">
    //                     전송
    //                 </Button>
    //             </CardContent>
    //         </Card>
    //     );
    // }
