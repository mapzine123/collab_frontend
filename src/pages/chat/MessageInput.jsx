import { AttachFile } from "@mui/icons-material";
import { Box, IconButton, TextField } from "@mui/material";
import { useState } from "react"
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SendIcon from '@mui/icons-material/Send';

const MessageInput = () => {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {

    }

    return (
        <Box
            component="from"
            onSubmit={handleSubmit}
            sx={{
                p: 2,
                backgroundColor: '#fff',
                borderRadius: 1,
                boxShadow: 1,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <IconButton size="small">
                    <AttachFile />
                </IconButton>
                <IconButton size="small">
                    <EmojiEmotionsIcon />
                </IconButton>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff'
                        }
                    }}
                />
                <IconButton
                    color="primary"
                    type="submit"
                    disabled={!message.trim()}
                >
                    <SendIcon />
                </IconButton>
                </Box>
        </Box>
    )
}

export default MessageInput;