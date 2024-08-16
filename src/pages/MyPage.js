import React, {useState} from 'react';
import { List, ListItemButton, ListItemText, Divider, Box, Typography } from '@mui/material';
import UserInfo from '../components/UserInfo';
import History from '../components/UserHistory';
import UserHistory from '../components/UserHistory';

const MyPage = () => {
    const INFO = 'info';
    const HISTORY = 'history';

    const [mode, setMode] = useState(INFO);



    return (
        <Box display="flex">
            {/* Sidebar */}
            <Box 
                width={250} 
                p={2} 
                boxShadow={3}
            >
                <Typography variant="h6" gutterBottom>
                    마이페이지
                </Typography>
                <List component="nav">
                    <ListItemButton onClick={(e) => setMode(INFO)}>
                        <ListItemText primary="내 정보" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton>
                        <ListItemText primary="내가 쓴 글" onClick={(e) => setMode(HISTORY)} />
                    </ListItemButton>
                </List>
            </Box>

            {/* Main Content Area */}
            <Box flexGrow={1} p={3}>
                {mode === INFO && (
                    <UserInfo />
                )}
                {mode === HISTORY && (
                    <UserHistory />
                )}
            </Box>
        </Box>
    );
}

export default MyPage;
