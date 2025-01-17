import { Box, Paper, Typography } from "@mui/material"
import MessageInput from "./MessageInput";
import { useState } from "react";
import { useStore } from "../../redux/store/store";

const ChatArea = ({currentChannel}) => {
    const [messages, setMessages] = useState([]);
    const {userId} = useStore();


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

            <MessageInput />
        </Box>
    )
}

// 메세지 컴포넌트
const MessageBubble = ({message, isMyMessage}) => (
    <Box
        sx={{
            alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
            backgroundColor: isMyMessage ? '#007AFF' : '#E9ECEF',
            color: isMyMessage ? 'white' : 'black',
            borderRadius: 2,
            p: 1.5,
            px: 2
        }}
    >
        {!isMyMessage && (
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 'bold'
                }}
            >
                {message.senderName}
            </Typography>
        )}
        <Typography>{message.content}</Typography>
        <Typography variant="caption" sx={{opacity: 0.7}}>
            {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
    </Box>
)

export default ChatArea;