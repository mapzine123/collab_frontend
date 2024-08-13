import { AppBar, Button, Toolbar } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setAuthenticated, setUserId } from "../redux/actions/user";

export default function Menubar() {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId);

    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(setUserId(null));
        dispatch(setAuthenticated(false));
        alert("로그아웃 되었습니다.");
        navigate("/");
    }

    return (
    <AppBar position="static">
        <Toolbar>
            <Button color="inherit" component={Link} to="/">
                Main
            </Button>
            {userId ? (
                <Button color='inherit' onClick={handleLogout}>
                    Logout
                </Button>
            ) : (
                <>
                    <Button color="inherit" component={Link} to="/login">
                        Login
                    </Button>
                    <Button color="inherit" component={Link} to="/signup">
                        Sign Up
                    </Button>
                </>
            )}
        </Toolbar>
    </AppBar>
    );
}
