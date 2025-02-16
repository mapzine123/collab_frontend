import { Box, Paper, Typography } from "@mui/material"
import MessageInput from "./MessageInput";
import { useEffect, useState } from "react";
import { useStore } from "../../redux/store/store";
import ChatWebSocket from "./ChatWebSocket";
import { current } from "@reduxjs/toolkit";
import { getMessages } from "./chatApi";

const ChatArea = ({currentChannel}) => {
    const [messages, setMessages] = useState([]);
    const userId = localStorage.getItem('jwt'); // 또는 JWT decode해서 가져오기
    const [webSocket, setWebSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        const  ws = new ChatWebSocket(userId);

        if(!userId || !currentChannel?.id) {
            return;
        }
        try {
            ws.connect();

            const unsubscribeOpen = ws.onOpen(() => {
                setIsConnected(true);
            })

            const unsubscribeClose = ws.onClose(() => {
                setIsConnected(false);
            })

            // 메시지 수신 처리
            const unsubscribeMessage = ws.onMessage((message) => {
                console.log('Received message: ', message);
                // 현재 채팅방의 메시지만 표시
                if(message.roomId === currentChannel?.id) {
                    console.log('메시지 상태 업데이트 시도');
                    const newMessage = {
                        id: Date.now(),
                        type: message.type,
                        content: message.content,
                        senderId: message.sender,
                        senderName: message.senderName,
                        timestamp: message.timestamp
                    };
                    console.log('새 메시지 객체:', newMessage);

                    setMessages(prev => {
                        console.log('이전 메시지들: ', prev);
                        const updated = [...prev, newMessage];
                        console.log('업데이트된 메시지들 : ', updated);
                        return updated;
                    });
                }
            });
    
            setWebSocket(ws);

            return () => {
                unsubscribeMessage();
                unsubscribeOpen();
                unsubscribeClose();
                ws.disconnect();
                setIsConnected(false);
            };
        } catch(error) {
            console.error('WebSocket initialization error: ', error);
            setIsConnected(false);
        }

    }, [userId, currentChannel?.id]);

    useEffect(() => {
        if(!webSocket || !currentChannel?.id || !isConnected) {
            return;
        }
        console.log('채팅방 입장 시도:', currentChannel.id);

        // 채팅방 입장
        webSocket.enterRoom(currentChannel.id, userId);
    }, [webSocket, currentChannel?.id, isConnected]);

    // 채팅방이 변견되면 해당 채팅방의 이전 메시지들을 불러옴
    useEffect(() => {
        if(!currentChannel?.id) {
            return;
        }

        // 이전 메시지 초기화
        setMessages([]);

        // 서버에서 채팅방의 이전 메시지들을 가져옵니다
        getMessages(currentChannel.id)
        .then(previousMessage => {
            setMessages(previousMessage);
        })
        .catch(error => {
            console.error("이전 메시지 로딩 실패 : ", error);
        })
    }, [currentChannel?.id]);


    

    // MessageInput으로 전달할 메시지 전송 함수
    const handleSendMessage = (content) => {
        if(!currentChannel?.id || !content.trim()) {
            console.error("채널 ID 또는 메시지 내용이 없습니다.");
            return;
        }

        if(!webSocket) {
            console.error("Websocket이 연결되지 않았습니다.");
            return;
        }

        try {
            webSocket.sendMessage(currentChannel.id, content.trim());
        } catch(error) {
            console.error("메시지 전송 중 오류 발생 : ", error);
        }
    };

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                p: 3,
                ml: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid #e0e0e0'
            }}
        >
            <Paper
            elevation={0}
            sx={{
                p: 2,
                backgroundColor: '#ffffff',
                borderBottom: 1,
                borderColor: 'divider'
            }}
            >
                <Typography variant="h6">{currentChannel?.name}</Typography>
            </Paper>

            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    my: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                {/* 메시지 영역*/}
                {messages.map((message) => (
                    <MessageBubble 
                        key={message.id}
                        message={message}
                        isMyMessage={message.senderId === userId}
                    />
                ))}
            </Box>

            <MessageInput 
                roomId={currentChannel?.id}
                onSendMessage={handleSendMessage}
            />
        </Box>
    )
}

// 메세지 컴포넌트
const MessageBubble = ({message, isMyMessage}) => {
    console.log('isMyMesasge: ', isMyMessage);
    console.log(message);
    const isSystemMessage = message.type === 'ENTER' || message.type === 'LEAVE';
    return (
        <Box
            sx={{
                alignSelf: isSystemMessage
                ? 'center'
                : (isMyMessage ? 'flex-end' : 'flex-start'),
                maxWidth: isSystemMessage ? '100%' : '70%',
                backgroundColor: isSystemMessage
                ? 'transparent'
                : (isMyMessage ? '#007AFF' : '#e9ECEF'),
                color: isSystemMessage
                ? 'gray'
                : (isMyMessage ? 'white' : 'black'),
                borderRadius: 2,
                p: isSystemMessage ? 1 : 1.5,
                px: isSystemMessage ? 1 : 2,
                textAlign: isSystemMessage ? 'center' : 'left'
            }}
        >
            {!isMyMessage && !isSystemMessage && (
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 'bold'
                    }}
                >
                    {message.senderName}
                </Typography>
            )}
            <Typography>
                {message.content}
            </Typography>
            {!isSystemMessage && (
                <Typography variant="caption" sx={{opacity: 0.7}}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
            )}
        </Box>
    )

}

export default ChatArea;