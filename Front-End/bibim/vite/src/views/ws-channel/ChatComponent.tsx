import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

interface ChatComponentProps {
    channelId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ channelId }) => {
    const [client, setClient] = useState<Client | null>(null);
    const [messages, setMessages] = useState<{ content: string }[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        const stompClient = new Client({
            brokerURL: "ws://localhost:8080/ws",
            onConnect: () => {
                console.log(`WebSocket 연결 성공! 채널 ID: ${channelId}`);

                stompClient.subscribe(`/topic/channel/${channelId}`, (message) => {
                    setMessages((prev) => [...prev, JSON.parse(message.body)]);
                });
            },
            onStompError: (frame) => {
                console.error("WebSocket 오류:", frame);
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, [channelId]);

    const sendMessage = () => {
        if (client && client.connected) {
            client.publish({
                destination: `/app/sendMessage/${channelId}`,
                body: JSON.stringify({ content: input }),
            });
            setInput("");
        }
    };

    return (
        <div>
            <h2>채팅</h2>
            <div style={{ border: "1px solid #ccc", padding: "10px", minHeight: "200px" }}>
                {messages.map((msg, index) => (
                    <p key={index}>{msg.content}</p>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
            />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
};

export default ChatComponent;
