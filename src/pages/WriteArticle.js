import React, { useEffect, useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import ky from 'ky';
import { useStore } from "../redux/store/store";
import { articlePath, modifyMode, writeMode } from "../util/constant";

const WriteArticle = () => {
    const location = useLocation();
    const {selectedArticleNum=0, prevTitle = '', prevContent='', mode={writeMode}} = location.state || {};
    const [title, setTitle] = useState(prevTitle);
    const [content, setContent] = useState(prevContent);

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
            articleNum: selectedArticleNum,
            articleTitle: title,
            articleContent : content,
            articleWriter : userId
        }
        try {
            if(mode === writeMode) {
                await ky.post(`${articlePath}`, {
                    json: article,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert("성공적으로 작성되었습니다.");
            } else if(mode === modifyMode) {
                await ky.put(`${articlePath}`, {
                    json: article,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert("성공적으로 수정되었습니다.");
            }
            navigator("/")
        } catch(error) {
            console.error(error);
        }
    

        
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {mode === writeMode ? "새 글 작성" : "수정"}
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
                        {mode === writeMode ? "작성" : "수정"}
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
