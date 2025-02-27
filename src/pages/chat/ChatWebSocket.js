import SockJS from "sockjs-client";

class ChatWebSocket {
    constructor(userId) {
        this.userId = userId;
        this.socket = null;
        this.messageHandlers = new Set();
        this.openHandlers = new Set();
        this.closeHandlers = new Set();
    }

    connect() {
        const token = localStorage.getItem('jwt');
        this.socket = new WebSocket(`ws://localhost:8080/ws/chat?token=${token}`);
    
        this.socket.onopen = () => {
            this.openHandlers.forEach(handler => handler());
        };

        this.socket.onclose = () => {
            this.closeHandlers.forEach(handler => handler());
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket 오류: ', error);
        }

        this.socket.onmessage = (event) => {
            console.log('메시지 수신:', event.data);
            try {
                const message = JSON.parse(event.data);
                console.log('파싱된 메시지:', message);
                this.messageHandlers.forEach(handler => handler(message));
            } catch(error) {
                console.error('메시지 파싱 에러: ', error);
            }
        };
    }

    onOpen(handler) {
        this.openHandlers.add(handler);  // 올바른 철자

        if(this.socket?.readyState === WebSocket.OPEN) {
            handler();
        }
        return () => this.openHandlers.delete(handler);
    }

    onClose(handler) {
        this.closeHandlers.add(handler);
        return () => this.closeHandlers.delete(handler);
    }

    enterRoom(roomId, userId) {
        if(this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'ENTER',
                roomId: roomId,
                sender: userId,
                message: '',
                timestamp: new Date().toISOString()
            }));
        }
    }

    sendMessage(roomId, content) {
        try {
            if(this.socket?.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'TALK',
                    roomId,
                    sender: JSON.parse(atob(this.userId.split('.')[1])).sub,
                    content,
                    timestamp: new Date().toISOString()
                };
    
                console.log('전송할 메시지: ', message);
                this.socket.send(JSON.stringify(message));
                console.log('메시지 전송 완료');
    
                return true;
            }
        } catch(error) {
            console.error('메시지 전송 실패 :', error);
            throw error;
        }

    }

    sendTyping(roomId, isTyping) {
        if(this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'TYPING',
                roomId,
                sender: this.userId,
                isTyping
            }));
        }
    }

    sendUserStatus(status) {
        if(this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'STATUS',
                sender: this.userId,
                status
            }));
        }
    }

    onMessage(handler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    disconnect() {
        if(this.socket?.readyState === WebSocket.OPEN) {
            this.sendUserStatus('OFFLINE');
            this.socket.close();
        }
    }
}

export default ChatWebSocket; // default로 내보내기
