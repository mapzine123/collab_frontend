import React, { useState, useEffect } from 'react';
import ky from 'ky'
import { useStore } from '../redux/store/store';
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Avatar,
    TextField,
    Button,
    Pagination
} from '@mui/material';

const UserHistory = () => {
    // 상태 선언
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const {userId, setUserId} = useStore();

    // 컴포넌트 마운트 시 API 호출
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await ky.get(`http://localhost:8080/api/articles/user?page=${currentPage-1}&userId=${userId}`).json();
                setPosts(response.content || []);  // API 응답 데이터로 상태 업데이트
                setTotalPages(response.totalPages || 1);
            } catch (error) {
                setError(error.message);  // 에러 상태 업데이트
            } finally {
                setLoading(false);  // 로딩 상태 해제
            }
        };

        fetchPosts();
    }, [currentPage, userId]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // 로딩 중 메시지
    if (loading) {
        return <div>Loading...</div>;
    }

    // 에러 메시지
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Container maxWidth="md" style={{ marginTop: '20px', display: 'flex' }}>
            {/* Main Content */}
            <Box style={{ flex: 1, marginRight: '300px' }}>
                {posts.length === 0 ? (
                    <p>No posts found.</p>
                ) : (
                    <List>
                        {posts.map(post => (
                            <Card key={post.articleNum} variant='outlined' style={{ marginBottom: '10px', width: '100%' }}>
                                <CardContent>
                                    <ListItem>
                                        <Box display="flex" alignItems="center" style={{ marginBottom: '8px' }}>
                                            <Avatar alt={post.articleWriter} src={post.profileImage} style={{ marginRight: '10px' }} />
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
                )}
            </Box>

            {/* Right Sidebar */}
            <Box 
                style={{ 
                    position: 'fixed', 
                    right: '10%', 
                    top: '50%', 
                    width: '20%', 
                    zIndex: 1000, 
                    padding: '10px', 
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >

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

export default UserHistory;
