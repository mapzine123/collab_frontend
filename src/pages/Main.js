import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination, Box, Container, Button, List, Card, CardContent, ListItem, ListItemText, Typography, Avatar } from '@mui/material';
import {useSelector} from 'react-redux';
import ky from 'ky';

const Main = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const userId = useSelector(state => state.user.userId);

    const fetchPosts = async (page) => {
        try {
            const response = await ky.get(`http://localhost:8080/api/articles?page=${page - 1}`).json();
            setPosts(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("게시글을 불러오는데 오류가 발생함");
        }
    }

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        fetchPosts(value);
    }

    const handleWrite = (event) => {
        event.preventDefault();
        if(userId === null) {
            alert("로그인을 해야 사용할 수 있는 기능입니다.");
            navigate('/login');
            return;
        }
        navigate('/write');
    }

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    return (
        <Container maxWidth="md" style={{ marginTop: '20px', display: 'flex' }}>
            {/* Main Content */}
            <Box style={{ flex: 1, marginRight: '300px' }}>
                <List>
                    {posts.map(post => (
                        <Card key={post.articleNum} variant='outlined' style={{ marginBottom: '10px', width: '130%' }}>
                            <CardContent>
                                <ListItem>
                                    <Box display="flex" alignItems="center" style={{ marginBottom: '8px' }}>
                                        <Avatar alt={post.userId} src={post.profileImage} style={{ marginRight: '10px' }} />
                                        <Typography variant="body1" component="div">
                                            {post.articleWriter}
                                        </Typography>
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" component="div">
                                                {post.articleTitle}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="textSecondary">
                                                {post.articleContent.length > 100 ? post.articleContent.substring(0, 100) + '...' : post.articleContent}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Typography variant="body2" color="textSecondary" style={{ marginTop: '8px' }}>
                                    Created: {new Date(post.createdAt).toLocaleDateString()} | Views: {post.viewCount}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Likes: {post.likeCount} | Comments: {post.commentCount} | Hates: {post.hateCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </List>
            </Box>

            {/* Right Sidebar */}
            <Box 
                style={{ 
                    position: 'fixed', 
                    right: '20%', 
                    top: '50%', 
                    width: '250px', 
                    zIndex: 1000, 
                    padding: '10px', 
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Button variant='contained' color='primary' onClick={handleWrite} style={{ marginBottom: '20px' }}>
                    새 글 작성
                </Button>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    color="primary"
                />
            </Box>
        </Container>
    );
};

export default Main;
