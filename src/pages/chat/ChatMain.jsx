import { Box, CssBaseline, Typography } from "@mui/material"
import Sidebar from "./Sidebar"
import ChannelList from "./ChannelList"
import ChatArea from "./ChatArea"
import { useState } from "react"

const ChatMain = () => {
    const [channels, setChannels] = useState([]);
    const [currentChannel, setCurrentChannel] = useState();

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: '1400px', width: '100%', px: 4 }}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                    <ChannelList 
                        currentChannel={currentChannel}
                        setCurrentChannel={setCurrentChannel}
                        channels={channels}
                        setChannels={setChannels}
                    />
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ml: 0,
                            height: 'calc(100vh - 65px)',
                            borderLeft: '1px solid #e0e0e0'
                        }}
                    >
                        {currentChannel ? (
                            <ChatArea currentChannel={currentChannel} />
                        ) : (
                            <Typography variant="h6" color="text.secondary">
                                채널을 선택해주세요
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ChatMain;