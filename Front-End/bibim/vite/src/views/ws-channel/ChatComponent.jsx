import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import SockJS from "sockjs-client"; // WebSocket 연결을 위한 SockJS 클라이언트
import { Client } from "@stomp/stompjs"; // STOMP 프로토콜을 사용하기 위한 라이브러리
import { ConfigContext } from "../../contexts/ConfigContext"; // 사용자 정보 가져오기 위한 Context
import { FaPaperPlane, FaPlus } from "react-icons/fa"; // 아이콘 사용
import "./ChatComponent.css"; // CSS 스타일링 적용

function ChatComponent({ channelId }) {
    // ConfigContext에서 사용자 정보 가져오기
    const { user } = useContext(ConfigContext);

    // 채팅 메시지 상태 (채팅 목록)
    const [messages, setMessages] = useState([]);

    // 입력창 상태 (사용자가 입력한 메시지)
    const [input, setInput] = useState("");

    // WebSocket 연결을 위한 STOMP 클라이언트 (useRef를 사용하여 유지)
    const stompClientRef = useRef(null);

    useEffect(() => {
        // 로컬 스토리지에서 JWT 토큰 가져오기
        const token = localStorage.getItem("token");

        // 토큰이 없거나, 채널 ID 또는 사용자 정보가 없으면 연결 중단
        if (!token || !channelId || !user) return;

        // SockJS를 사용하여 WebSocket 연결 생성
        const socket = new SockJS("http://localhost:8080/ws/chat");

        // STOMP 클라이언트 생성 및 설정
        const client = new Client({
            webSocketFactory: () => socket, // WebSocket 설정
            connectHeaders: { Authorization: `Bearer ${token}` }, // JWT 토큰을 인증 헤더에 추가
            onConnect: () => {
                // WebSocket 연결이 성공하면 해당 채널을 구독
                client.subscribe(`/exchange/chat-exchange/msg.${channelId}`, (message) => {
                    try {
                        // 메시지를 JSON으로 변환
                        const parsedMessage = JSON.parse(message.body);
                        // 기존 메시지 목록에 추가
                        setMessages((prev) => [...prev, parsedMessage]);
                    } catch (error) {
                        console.error("❌ 메시지 파싱 오류:", error);
                    }
                });

                // STOMP 클라이언트를 Ref에 저장
                stompClientRef.current = client;
            },
            onStompError: (error) => console.error("STOMP 에러:", error), // STOMP 오류 발생 시 콘솔 출력
            onWebSocketClose: () => console.log("WebSocket 연결 종료"), // WebSocket 연결이 종료될 때 로그 출력
        });

        // STOMP 클라이언트 활성화 (연결 시작)
        client.activate();

        // 컴포넌트 언마운트 시 연결 해제 (클린업 함수)
        return () => client.deactivate();
    }, [channelId, user]); // channelId 또는 user가 변경될 때마다 실행

    /**
     * 메시지 전송 함수
     * 사용자가 입력한 메시지를 STOMP 서버로 전송
     */
    const sendMessage = useCallback(() => {
        // 입력이 비어있거나, STOMP 클라이언트가 없으면 실행하지 않음
        if (!input.trim() || !stompClientRef.current) return;

        // 전송할 메시지 데이터 객체
        const messageData = {
            channelNumber: channelId, // 현재 채팅방 ID
            content: input, // 사용자가 입력한 메시지
            sender: user?.email || "Unknown Sender", // 발신자 이메일
            messageOrFile: false, // 메시지인지 파일인지 여부 (false: 메시지)
        };

        // STOMP 서버로 메시지 전송
        stompClientRef.current.publish({
            destination: `/app/chat.sendMessage.${channelId}`, // 메시지를 전송할 STOMP 목적지
            body: JSON.stringify(messageData), // JSON 문자열로 변환하여 전송
        });

        // 입력 필드 초기화
        setInput("");
    }, [input, channelId, user]); // input, channelId, user 변경 시 함수 갱신

    /**
     * Enter 키 입력 시 메시지 전송
     */
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // 기본 Enter 키 동작 방지
            sendMessage(); // 메시지 전송
        }
    };

    return (
        <div className="chat-container">
            {/* 채팅방 헤더 */}
            <div className="chat-header">채팅 - 채널 {channelId}</div>

            {/* 채팅 메시지 목록 */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <p className="no-messages">No messages yet.</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender === user?.email ? "my-message" : "other-message"}`}>
                            {/* 발신자 정보 */}
                            <p className="sender">{msg.sender || "Unknown Sender"}</p>
                            {/* 메시지 내용 */}
                            <div className="message-content">{msg.content}</div>
                        </div>
                    ))
                )}
            </div>

            {/* 입력창 */}
            <div className="chat-input-box">
                {/* 파일 추가 버튼 (현재 기능 없음) */}
                <button className="icon-btn"><FaPlus /></button>

                {/* 메시지 입력 필드 */}
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)} // 입력값 업데이트
                    onKeyDown={handleKeyPress} // Enter 키 입력 감지
                    placeholder="메시지를 입력하세요..."
                    className="chat-input"
                />

                {/* 메시지 전송 버튼 */}
                <button onClick={sendMessage} className="send-btn">
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
}

export default ChatComponent;
