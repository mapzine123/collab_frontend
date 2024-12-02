import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import TagIcon from '@mui/icons-material/Tag';
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react";


const ChannelList = ({channels, setChannels, currentChannel, setCurrentChannel}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [inviteMembers, setInviteMembers] = useState('');
    const drawerWidth = 240;

    const handleCreateChannel = () => {
        if(newChannelName.trim()) { 
        const memberList = inviteMembers
            .split(',')
            .map(member => member.trim())
            .filter(member => member.length > 0);

            console.log(memberList);

            setChannels([...channels, newChannelName.trim()]);
            setNewChannelName('');
            setInviteMembers('');
            setOpenDialog(false);
        }
    }

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiPaper-root': {  // Paper 컴포넌트 스타일 직접 지정
                            position: 'relative',
                            left: 'unset',
                            width: drawerWidth,
                            backgroundColor: '#2c2d30',
                            color: 'white',
                            height: 'calc(100vh - 65px)',
                            borderRight: '1px solid #e0e0e0'
                        }
                    }}
            >
                <Box
                    sx={{
                        overflow: 'auto',
                        p: 2
                    }}
                >
                    <Box 
                        sx={{
                            display: 'flex',
                            alineItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Typography variant="h6">Channels</Typography>
                        <IconButton
                            onClick={() => setOpenDialog(true)}
                            size="small"
                            sx={{
                                color: 'white'
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>  
                    <List>
                        {channels.map((channel) => (
                            <ListItem 
                                button 
                                key={channel}
                                selected={currentChannel === channel}
                                onClick={() => setCurrentChannel(channel)}
                            >
                                <TagIcon sx={{mr: 1}} />
                                <ListItemText primary={channel} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* 채널 생성 다이얼로그 */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Create a channel</DialogTitle>
                <DialogContent>
                    <TextField 
                        autoFocus
                        margin="dense"
                        label="Channel name"
                        fullWidth
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        sx={{mt: 2}}
                    />
                </DialogContent>
                <DialogContent>
                    <TextField 
                        autoFocus
                        margin="dense"
                        label="Invite members"
                        fullWidth
                        multiline
                        rows={2}
                        value={inviteMembers}
                        onChange={(e) => setInviteMembers(e.target.value)}
                        helperText="Enter user IDs separated by commas (e.g., user1, user2)"
                        sx={{mt: 2}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateChannel} variant="contained">Create Channel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ChannelList;