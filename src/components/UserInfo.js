import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, Avatar } from '@mui/material';
import ky from 'ky';
import { useStore } from '../redux/store/store';
const UserInfo = () => {
    // 상태 관리: 비밀번호, 프로필 이미지
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState('');

    const {userId, setUserId} = useStore();
    const {userImagePath, setUserImagePath} = useStore();

    console.log(userImagePath);

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
            const response = await ky.post(`http://localhost:8080/api/users/image`,
                {body: formData},
            );

            const imagePath = await response.text();
            setProfileImage(imagePath);
        } catch(error) {
            console.error(error);
        }
    };

    // 폼 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault();
        // 여기서 서버로 변경된 비밀번호와 프로필 이미지를 전송하는 로직 추가
        console.log('Password:', password);
        console.log('Profile Image:', profileImage);
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
