import { Box, Drawer } from "@mui/material";

const Sidebar = () => {
    const drawerWidth = 64;

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    backgroundColor: '#1a1d21',
                    color: 'white'
                },
            }}
        >
            <Box 
                sx={{
                    overflow: 'auto',
                    p: 1
                }}
            >

            </Box>
        </Drawer>
    )
}

export default Sidebar;