import { PersonAddOutlined } from '@mui/icons-material';
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import ky from "ky";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, getApiUrl } from "../../util/constant";
import { validatePassword } from "../../util/validator";

const Signup = () => {
  const [idErrorMessage, setIdErrorMessage] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    password: "",
    passwordCheck: "",
    name: "",
    department: ""
  })

  const [errors, setErrors] = useState({
    id: "",
    password: "",
    name: "",
    department: ""
  })

  const DEPARTMENTS = [
    { id: 'dev', name: '개발팀' },
    { id: 'design', name: '디자인팀' },
    { id: 'marketing', name: '마케팅팀' },
    { id: 'sales', name: '영업팀' },
    { id: 'hr', name: '인사팀' },
    { id: 'finance', name: '재무팀' }
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };


  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // ID 검증
    const idRegex = /^[a-zA-Z0-9]{3,12}$/;
    if(!idRegex.test(formData.id)) {
      newErrors.id = "아이디는 3 ~ 12 글자의 영문자 또는 숫자로 구성되어야 합니다.";
      isValid = false;
    }

    if(!validatePassword(formData.password)) {
      newErrors.password = "비밀번호는 4~16자로 설정해주세요.";
      isValid = false;
    }

    // 실명 검증
    if(!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
      isValid = false;
    }

    // 부서 검증
    if(!formData.department.trim()) {
      newErrors.department = "부서를 입력해주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;

  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if(!validateForm()) {
      return;
    }

    try {
      const response = await ky.post(getApiUrl(API.USERS), {
        json: {
          id: formData.id,
          password: formData.password,
          name: formData.name,
          department: formData.department
        }
    });

      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        id: "중복된 아이디입니다."
      }));
    }
  };


  // 모든 TextField에 공통으로 적용될 스타일
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#E0E0E0' },
      '&:hover fieldset': { borderColor: '#BDBDBD' }
    },
    '& .MuiInputBase-input': { color: '#333' },
    '& .MuiInputLabel-root': { color: '#666' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1976D2' }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center', bgcolor: '#FAFAFA', py: 8 }}>
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
            <Stack spacing={2}>
              <TextField
                variant="outlined"
                id="id"
                label="아이디"
                name="id"
                value={formData.id}
                onChange={handleChange}
                error={!!errors.id}
                helperText={errors.id}
                autoComplete="off"
                required
                fullWidth
                autoFocus
                sx={textFieldSx}
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
                  name="name"
                  label="이름"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="off"
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  fullWidth
                  sx={textFieldSx}
                  
                />

                <FormControl
                  required
                  error={!!errors.department}
                  sx={textFieldSx}
                >
                  <InputLabel id="department-label">부서</InputLabel>
                  <Select
                    lebelId="department-label"
                    name="department"
                    value={formData.department}
                    label="부서"
                    onChange={handleChange}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              <TextField
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="off"
                required
                fullWidth
                sx={textFieldSx}
              />
              <TextField
                name="passwordCheck"
                label="비밀번호 확인"
                type="password"
                value={formData.passwordCheck}
                onChange={handleChange}
                error={!!errors.passwordCheck}
                helperText={errors.passwordCheck}
                required
                fullWidth
                sx={textFieldSx}
              />
              
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
            </Stack>
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