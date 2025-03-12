import { Box, Paper, Typography, Divider, Avatar, AvatarGroup, Tooltip, IconButton } from "@mui/material";
import PeopleIcon from '@mui/icons-material/People';
import MessageInput from "./MessageInput";
import { useEffect, useState } from "react";
import ChatWebSocket from "./ChatWebSocket";
import { getMessages, getChannelMembers } from "./chatApi";
import { useStore } from "../../redux/store/store";

// Add getChannelMembers to your chatApi.js if not already there
// export const getChannelMembers = async (channelId) => {
//   const response = await fetch(`/api/channels/${channelId}/members`, {
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('jwt')}`
//     }
//   });
//   if (!response.ok) throw new Error('Failed to fetch channel members');
//   return response.json();
// };

const ChatArea = ({currentChannel}) => {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [showMembersList, setShowMembersList] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const token = localStorage.getItem('jwt'); 
    const { userId } = useStore();
    const [webSocket, setWebSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new ChatWebSocket(token);

        if(!token || !currentChannel?.id) {
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
                // 현재 채팅방의 메시지만 표시
                if(message.roomId === currentChannel?.id) {
                    // ENTER 메시지 필터링 - 클라이언트 단에서도 처리
                    if (message.type === 'ENTER' && message.senderId === userId) {
                        // 이미 멤버인 경우 ENTER 메시지 무시
                        if (isMember) {
                            return;
                        }
                    }
                    
                    const newMessage = {
                        id: Date.now(),
                        type: message.type,
                        content: message.content,
                        senderId: message.senderId,
                        senderName: message.senderName,
                        timestamp: message.timestamp
                    };

                    // 사용자 입장/퇴장 메시지인 경우 멤버 목록 갱신
                    if (message.type === 'ENTER' || message.type === 'LEAVE') {
                        fetchChannelMembers();
                    }

                    setMessages(prev => {
                        const updated = [...prev, newMessage];
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

    }, [token, currentChannel?.id, isMember, userId]);

    // 채팅방이 변경되면 멤버십 확인 및 채팅방 입장
    useEffect(() => {
        if(!currentChannel?.id) {
            return;
        }

        // 채널 멤버십 확인
        checkMembership();

        // 이전 메시지 초기화
        setMessages([]);

        // 서버에서 채팅방의 이전 메시지들을 가져옵니다
        getMessages(currentChannel.id)
        .then(previousMessage => {
            setMessages(previousMessage);
        })
        .catch(error => {
            console.error("이전 메시지 로딩 실패 : ", error);
        });

        // 채팅방 멤버 목록을 가져옵니다
        fetchChannelMembers();
    }, [currentChannel?.id]);

    // 웹소켓 연결 후 채팅방 입장
    useEffect(() => {
        if(!webSocket || !currentChannel?.id || !isConnected) {
            return;
        }

        // enterRoom 함수를 수정하여 isMember 정보를 전달
        enterRoom(currentChannel.id, userId);
    }, [webSocket, currentChannel?.id, isConnected, isMember]);

    // 채널 멤버십 확인 함수
    const checkMembership = async () => {
        if (!currentChannel?.id || !userId) return;
        
        try {
            // 실제 API 호출
            // const result = await checkChannelMembership(currentChannel.id, userId);
            // setIsMember(result.isMember);

            // 임시로 로직 구현 (API 구현 전)
            // 멤버 목록에서 현재 사용자 ID가 있는지 확인
            const membersList = await getChannelMembers(currentChannel.id);
            const isCurrentUserMember = membersList.some(member => member.id === userId);
            setIsMember(isCurrentUserMember);
            setMembers(membersList);
        } catch (error) {
            console.error("멤버십 확인 실패 : ", error);
            setIsMember(false);
        }
    };

    // 수정된 enterRoom 함수
    const enterRoom = (roomId, userId) => {
        if(webSocket?.socket?.readyState === WebSocket.OPEN) {
            // 이미 멤버인 경우 silent 모드로 입장 (서버에도 알림)
            webSocket.socket.send(JSON.stringify({
                type: 'ENTER',
                roomId: roomId,
                senderId: userId,
                message: '',
                timestamp: new Date().toISOString(),
                silent: isMember // 이미 멤버인 경우 silent 플래그 설정
            }));
        }
    };

    // 채널 멤버 목록을 가져오는 함수
    const fetchChannelMembers = () => {
        if (!currentChannel?.id) return;
        
        getChannelMembers(currentChannel.id)
        .then(membersList => {
            setMembers(membersList);
        })
        .catch(error => {
            console.error("채널 멤버 로딩 실패 : ", error);
        });
    };

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

    const toggleMembersList = () => {
        setShowMembersList(!showMembersList);
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
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                {/* 채널 이름 (왼쪽) */}
                <Typography variant="h6">{currentChannel?.name}</Typography>
                
                {/* 채널 멤버 (오른쪽) */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                        {members.slice(0, 4).map((member) => (
                            <Tooltip key={member.id} title={member.name || member.username}>
                                <Avatar alt={member.name || member.username}>
                                    {(member.name || member.username).charAt(0)}
                                </Avatar>
                            </Tooltip>
                        ))}
                    </AvatarGroup>
                    <Tooltip title="채널 멤버 목록">
                        <IconButton onClick={toggleMembersList} size="small">
                            <PeopleIcon />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                                {members.length}
                            </Typography>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            {/* 멤버 목록 패널 - 토글되어 표시됨 */}
            {showMembersList && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        backgroundColor: '#f9f9f9',
                        borderBottom: 1,
                        borderColor: 'divider',
                        maxHeight: '200px',
                        overflow: 'auto'
                    }}
                >
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>채널 멤버 ({members.length}명)</Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {members.map((member) => (
                            <Box 
                                key={member.id} 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    '&:hover': { backgroundColor: '#f0f0f0' }
                                }}
                            >
                                <Avatar 
                                    alt={member.name || member.username}
                                    sx={{ width: 28, height: 28 }}
                                >
                                    {(member.name || member.username).charAt(0)}
                                </Avatar>
                                <Typography variant="body2">
                                    {member.name || member.username}
                                    {member.id === userId && " (나)"}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}

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