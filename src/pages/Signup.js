import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import axios from "axios";
import { validatePassword } from "../util/validator";
import { userPath } from "../util/constant";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [user, setUser] = useState(null);
  const [idErrorMessage, setIdErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "id") setId(value);
    if (name === "password") setPassword(value);
    if (name === "password_check") setPasswordCheck(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const idRegex = /^[a-zA-Z0-9]{3,12}$/;
    if (!idRegex.test(id)) {
      setIdErrorMessage(
        "아이디는 3글자 이상 12글자 이하의 영문자 또는 숫자로 구성되어야 합니다."
      );
      return;
    } else {
      setIdErrorMessage("");
    }

    if (!validatePassword(password)) {
      setPasswordErrorMessage(
        "비밀번호는 4글자 이상 16글자 이하로 설정해주세요."
      );
      return;
    } else {
      setPasswordErrorMessage("");
    }

    if (password !== passwordCheck) {
      setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    } else {
      setPasswordErrorMessage("");
    }

    try {
      const data = { id, password };
      const response = await axios.post(userPath, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setUser(response.data);
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      setUser(null);
      setPasswordErrorMessage("중복된 아이디입니다.");
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
            marginBottom: 2,
          }}
        >
          회원가입
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="id"
            label="아이디"
            name="id"
            autoFocus
            value={id}
            onChange={handleChange}
            autoComplete="off"
          />
          {idErrorMessage && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {idErrorMessage}
            </Typography>
          )}
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
            autoComplete="off"
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="password_check"
            label="비밀번호 확인"
            name="password_check"
            type="password"
            value={passwordCheck}
            onChange={handleChange}
            autoComplete="off"
          />
          {passwordErrorMessage && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {passwordErrorMessage}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            회원가입
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default Signup;
