/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

/**
 * 웹소켓을 쉽게 관리 할수 있도록 만든 커스텀 훅
 * @returns 
 */

const useWebSocket = () =>
{
    const [client, setClient] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() =>
    {
        const stompClient = new Client({
            brokerURL: "ws://localhost:8080/ws", // WebSocket 서버 URL
            onConnect: () =>
            {
                console.log("WebSocket 연결 성공!");

                // 메시지 구독 (예: "/topic/messages" 채널 구독)
                stompClient.subscribe("/topic/messages", (message) =>
                {
                    setMessages((prevMessages) => [...prevMessages, JSON.parse(message.body)]);
                });
            },
            onStompError: (frame) =>
            {
                console.error("WebSocket 오류:", frame);
            },
        });

        stompClient.activate(); // WebSocket 활성화
        setClient(stompClient);

        return () =>
        {
            stompClient.deactivate(); // 컴포넌트 언마운트 시 연결 해제
        };
    }, []);

    // 메시지 전송 함수
    const sendMessage = (message) =>
    {
        if (client && client.connected) {
            client.publish({
                destination: "/app/sendMessage",
                body: JSON.stringify({ content: message }),
            });
        }
    };

    return { messages, sendMessage };
};

export default useWebSocket;
