import { useState, useEffect, useRef } from 'react'
import * as StompJs from '@stomp/stompjs'

function ChatComponent({ channelId }) {
    const [chatList, setChatList] = useState([])
    const [newChat, setNewChat] = useState('')
    const [token, setToken] = useState(localStorage.getItem('token'))
    const clientRef = useRef(null)

    useEffect(() => {

        setToken(localStorage.getItem('token'))
        const sender = JSON.parse(atob(token.split('.')[1])).sub
        const client = new StompJs.Client({
            brokerURL: 'ws://localhost:8080/ws',
            connectHeaders: {
                Authorization: `${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 1000,
            heartbeatOutgoing: 1000,
        })

        client.onConnect = function (frame) {
            const callback = function (message) {
                if (message.body) {
                    const body = JSON.parse(message.body)
                    setChatList(prev => [...prev, body])
                }
            }
            client.subscribe(`/queue/channel/${channelId}`, callback)
        }

        client.onStompError = function (frame) {
            console.log(`Broker reported error: ${frame.headers.message}`)
            console.log(`Additional details: ${frame.body}`)
            if (
                frame.headers.message ===
                'Failed to send message to ExecutorSubscribableChannel[clientInboundChannel]'
            ) {
                // TODO: 리프레시 토큰으로 새 엑세스 토큰을 받아 sessionStorage에 저장 후 상태 업데이트
            }
        }

        client.activate()
        clientRef.current = client

        return () => {
            client.deactivate()
        }
    }, [token, channelId])

    const handleChange = event => {
        setNewChat(event.target.value)
    }

    const handleSubmit = event => {
        event.preventDefault()
        if (newChat.trim() !== '') {
            const newChatObj = {
                channelNumber: channelId,
                sender: sender,
                content: newChat,
                messageOrFile: false,
            }
            const msg = JSON.stringify(newChatObj)
            if (clientRef.current) {
                clientRef.current.publish({
                    destination: `/topic/channel/${channelId}`,
                    headers: { Authorization: `${token}` },
                    body: msg
                })
            }
        }
        setNewChat('')
        event.target.reset()
    }

    return (
        <>
            <div>
                {chatList.map(chat => (
                    <div key={crypto.randomUUID()}>
                        <span>{chat.sender}: {chat.content}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    placeholder='메시지를 입력하세요'
                    value={newChat}
                    onChange={handleChange}
                />
                <button type='submit'>send</button>
            </form>
        </>
    )
}

export default ChatComponent