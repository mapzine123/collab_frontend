import React, { useState } from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ky from "ky";
import { useStore } from "../redux/store/store";
import { authPath } from "../util/constant";

const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [wrongInfo, setWrongInfo] = useState(false);

  const { userId, setUserId } = useStore();
  const { authenticated, setAuthenticated } = useStore();
  const { userImagePath, setUserImagePath } = useStore();

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "id") setId(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await ky.post(`${authPath}/login`, {
        json: { id, password },
      });

      const userData = await response.json();
      // Redux 상태에 사용자 정보 저장
      setUserId(userData.id);
      setAuthenticated(true);
      setUserImagePath(userData.profileImagePath);

      // 로그인 성공 시 index.js로 이동
      navigate("/");
    } catch (error) {
      setWrongInfo(true);
    }
  };

  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "#90caf9",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          로그인
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="id"
            label="사용자 이름"
            name="id"
            autoFocus
            value={id}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="password"
            label="비밀번호"
            name="password"
            type="password"
            value={password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            로그인
          </Button>
        </form>
        {wrongInfo && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            아이디 혹은 비밀번호가 일치하지 않습니다.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default Login;
