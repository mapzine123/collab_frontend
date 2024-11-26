import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography, Paper } from "@mui/material";
import { PersonAddOutlined } from '@mui/icons-material';
import { Link } from "react-router-dom";
import ky from "ky";
import { validatePassword } from "../util/validator";
import { API, getApiUrl } from "../util/constant";
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
      const response = await ky.post(getApiUrl(API.USERS), {
        json: {id, password}, 
        headers: {
          "Content-Type": "application/json",
        },
    });
      setUser(await response.json());
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
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#FAFAFA',
        py: 8
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 6 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white'
          }}
        >
          {/* 헤더 영역 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1976D2',
                mb: 1
              }}
            >
              Create Account
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#666' }}
            >
              서비스 이용을 위한 계정을 만들어주세요
            </Typography>
          </Box>
 
          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="id"
              label="아이디"
              name="id"
              autoFocus
              value={id}
              onChange={handleChange}
              autoComplete="off"
              sx={{
                mb: idErrorMessage ? 1 : 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E0E0E0'
                  },
                  '&:hover fieldset': {
                    borderColor: '#BDBDBD'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#333'
                },
                '& .MuiInputLabel-root': {
                  color: '#666'
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976D2'
                }
              }}
            />
            {idErrorMessage && (
              <Typography 
                variant="body2" 
                color="error" 
                sx={{ mb: 2 }}
              >
                {idErrorMessage}
              </Typography>
            )}

            <TextField
              variant="outlined"
              required
              fullWidth
              id="password"
              label="비밀번호"
              name="password"
              type="password"
              value={password}
              onChange={handleChange}
              autoComplete="off"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E0E0E0'
                  },
                  '&:hover fieldset': {
                    borderColor: '#BDBDBD'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#333'
                },
                '& .MuiInputLabel-root': {
                  color: '#666'
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976D2'
                }
              }}
            />

            <TextField
              variant="outlined"
              required
              fullWidth
              id="password_check"
              label="비밀번호 확인"
              name="password_check"
              type="password"
              value={passwordCheck}
              onChange={handleChange}
              autoComplete="off"
              sx={{
                mb: passwordErrorMessage ? 1 : 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E0E0E0'
                  },
                  '&:hover fieldset': {
                    borderColor: '#BDBDBD'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#333'
                },
                '& .MuiInputLabel-root': {
                  color: '#666'
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976D2'
                }
              }}
            />
            {passwordErrorMessage && (
              <Typography 
                variant="body2" 
                color="error" 
                sx={{ mb: 3 }}
              >
                {passwordErrorMessage}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PersonAddOutlined />}
              sx={{
                py: 1.5,
                bgcolor: '#1976D2',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#1565C0'
                }
              }}
            >
              회원가입
            </Button>
            </form>
 
          {/* 로그인 링크 */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              이미 계정이 있으신가요?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#1976D2', 
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                로그인
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
 };
 
 export default Signup;