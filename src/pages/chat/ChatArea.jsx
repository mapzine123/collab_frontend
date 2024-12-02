import { Box, Paper, Typography } from "@mui/material"
import MessageInput from "./MessageInput";

const ChatArea = ({currentChannel}) => {
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
                <Typography variant="h6">{currentChannel}</Typography>
            </Paper>

            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    my: 2
                }}
            >
                {/* 메시지 영역*/}
                
            </Box>

            <MessageInput />
        </Box>
    )
}

export default ChatArea;