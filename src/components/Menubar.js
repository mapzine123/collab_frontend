import { Box, AppBar, Button, Toolbar } from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../redux/store/store";

export default function Menubar() {
  const navigate = useNavigate();

  const { userId, setUserId } = useStore();
  const { authenticated, setAuthenticated } = useStore();
  const { userImagePath, setUserImagePath } = useStore();

  const handleLogout = () => {
    setUserId(null);
    setAuthenticated(false);
    setUserImagePath(null);

    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/">
          Main
        </Button>
        {userId ? (
          <Box>
            <Button color="inherit" component={Link} to="/mypage">
              myPage
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/signup">
              Sign Up
            </Button>
            <Button color="inherit" component={Link} to="/todoList">
              Todo List
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
