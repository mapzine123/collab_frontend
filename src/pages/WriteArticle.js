import React, { useEffect, useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import {useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ky from 'ky';
import { useStore } from "../redux/store/store";

const WriteArticle = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const {userId, setUserId} = useStore();
    const navigator = useNavigate();

    useEffect(() => {
        if(userId === null) {
            navigator("/login");
        }
    })

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const article = {
            articleTitle: title,
            articleContent : content,
            articleWriter : userId
        }

        try {
            await ky.post('http://localhost:8080/api/articles', {
                json: article,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            alert("성공적으로 작성되었습니다.");
            navigator("/");
            
        } catch(error) {
            

        }

        
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                새 글 작성
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="제목"
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="본문"
                        variant="outlined"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        multiline
                        rows={10}
                        required
                    />
                </Box>
                <Box display="flex" justifyContent="flex-end">
                    <Button type="submit" variant="contained" color="primary">
                        작성
                    </Button>
                    <Button type="submit" variant="contained" color="primary" style={{marginLeft:'10px'}}>
                        취소
                    </Button>
                </Box>
            </form>
        </Container>
    );
};

export default WriteArticle;
