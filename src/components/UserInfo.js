import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, Avatar } from '@mui/material';
import ky from 'ky';
import { useStore } from '../redux/store/store';
import { useNavigate } from 'react-router-dom';
import { validatePassword } from '../util/validator';
import { userPath } from '../util/constant';
const UserInfo = () => {
    // 상태 관리: 비밀번호, 프로필 이미지
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState('');

    const {userId, setUserId} = useStore();
    const {userImagePath, setUserImagePath} = useStore();

    const navigator = useNavigate();

    // 프로필 이미지 변경 핸들러
    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserImagePath(URL.createObjectURL(file));
        }

        const fileExtension = file.name.split('.').pop();

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('file', file);
        formData.append('fileExtension', fileExtension);

        try {
            const response = await ky.post(`${userPath}/image`,
                {body: formData},
            );

            const imagePath = await response.text();
            setProfileImage(imagePath);
        } catch(error) {
            console.error(error);
        }
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!validatePassword(password)) {
            alert("비밀번호는 4글자 이상 16글자 이하로 설정해주세요.")
            return;
        }

        const data = {
            userId : userId, 
            password: password
        }

        try {
            const response = await ky.post(`${userPath}/password`, {
                json: data,  // 요청 본문
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(response.ok) {
                alert("비밀번호가 변경되었습니다.");
                navigator('/');
            } else {
                alert("오류가 발생했습니다.")
            }
        } catch(error) {
            console.error(error);
        }
    };

    return (
        <Box 
            display="flex" 
            flexDirection="row" 
            alignItems="center" 
            justifyContent="space-between" 
            maxWidth="900px" 
            mx="auto" 
            mt={4} 
            p={3} 
            boxShadow={3}
        >
            {/* 사용자 정보 및 비밀번호 변경 부분 */}
            <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                sx={{ 
                    flexGrow: 1, 
                }}
            >
                <Typography variant="h4" gutterBottom>
                    {userId} 님
                </Typography>
                <TextField
                    label="비밀번호 변경"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSubmit}
                >
                    저장
                </Button>
            </Box>

            {/* 프로필 이미지 변경 부분 */}
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ flexGrow: 1 }}
            >
                <Avatar 
                    alt="Profile Image" 
                    src={userImagePath} 
                    sx={{ width: 200, height: 200, mb: 2 }} 
                />
                <Button 
                    variant="contained" 
                    component="label" 
                    color="primary"
                    sx={{ mb: 2 }}
                >
                    이미지 선택
                    <input 
                        type="file" 
                        hidden 
                        onChange={handleProfileImageChange} 
                        accept="image/*" 
                    />
                </Button>
            </Box>
        </Box>
    );
};

export default UserInfo;
