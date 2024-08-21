import React, {useState } from 'react';

import { Menu, Button, Box, List, Card, CardContent, ListItem, Avatar, Typography, MenuItem, ListItemText} from '@mui/material';
import { useStore } from '../redux/store/store';

import ky from 'ky'
import { articlePath, modifyMode } from '../util/constant';
import { useNavigate } from 'react-router-dom';


const ArticleList = ({posts, setPosts}) => {
    const {userId} = useStore();
    const [selectedArticleNum, setSelectedArticleNum] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    
    const navigator = useNavigate();

    const handleClick = (e, articleNum) => {
        setAnchorEl(e.currentTarget);
        setSelectedArticleNum(articleNum);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedArticleNum(null);
    };
    
    const handleModify = (e, selectedArticleNum, prevTitle, prevContent, mode) => {
        navigator('/write', {
            state: {
                selectedArticleNum: selectedArticleNum,
                prevTitle: prevTitle,
                prevContent: prevContent,
                mode
            }
        });
    }

    const handleDelete = async (e) => {

        if(selectedArticleNum === null) {
            return;
        }

        try {
            const response = await ky.delete(`${articlePath}`, {
                json: {
                    userId,
                    articleNum: selectedArticleNum
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(response.ok) {
                setPosts(prevPosts => prevPosts.filter(post => post.articleNum !== selectedArticleNum))
                alert("게시글이 삭제되었습니다.");       
            }
        } catch(error) {
            console.error(error);
        } finally {
            handleClick(e);
        }
    }

    const handleLike = async (e, post) => {
        const articleNum = post.articleNum;

        if(userId === null) {
            alert("로그인이 필요한 기능입니다.");
            return;
        }

        try {
            const response = await ky.post(`${articlePath}/reaction/like`, {
                json: {
                    userId,
                    articleNum
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if(response.ok) {
                const updatedArticle = await response.json();
                await setPosts(prevPosts => 
                    prevPosts.map(
                        post => post.articleNum === articleNum 
                        ? {...post, likeCount: updatedArticle.likeCount, isLike: !post.isLike, isHate: false, hateCount: updatedArticle.hateCount} 
                        : post
                    )
                );
            }

        } catch(error) {
            console.error(error); 
        }
    }

    const handleHate = async (e, post) => {
        const articleNum = post.articleNum;

        if(userId === null) {
            alert("로그인이 필요한 기능입니다.");
            return;
        }

        try {
            const response = await ky.post(`${articlePath}/reaction/hate`, {
                json: {
                    userId,
                    articleNum
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if(response.ok) {
                const updatedArticle = await response.json();
                await setPosts(prevPosts => 
                    prevPosts.map(
                        post => post.articleNum === articleNum 
                        ? {...post, likeCount: updatedArticle.likeCount, isLike: false, isHate: !post.isHate, hateCount: updatedArticle.hateCount} 
                        : post
                    )
                );
            }

        } catch(error) {
            console.error(error); 
        }
    }

    const handleComment = (e, post) => {
        // 댓글 작성 기능 구현
    }

    const handleContentView = (e, post) => {
        // 게시글 하나 따로 자세히 보기
        navigator("/contentView", {
            state: {
                post: post
            }
        });
    }

    return (
        <Box style={{ flex: 1, marginRight: '300px' }}>
                {posts.length !== 0 && (
                    <List>
                    {posts.map(post => (
                        <Card key={post.articleNum} variant='outlined' style={{ marginBottom: '10px', width: '130%' }}>
                            <CardContent>
                                <ListItem>
                                    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" style={{width: '100%'}}>
                                        <Box display="flex" alignItems="center" style={{ marginBottom: '8px' }}>
                                            <Avatar alt={post.userId} src={post.profileImage} style={{ marginRight: '10px' }} />
                                            <Typography variant="body1" component="div">
                                                {post.articleWriter}
                                            </Typography>
                                        </Box>
                                        {post.articleWriter === userId && (
                                            <Box> 
                                                <Button
                                                    id="basic-button"
                                                    aria-controls={open ? 'basic-menu' : undefined}
                                                    aria-haspopup="true"
                                                    aria-expanded={open ? 'true' : undefined}
                                                    onClick={(e) => handleClick(e, post.articleNum)} // Handle click
                                                > 
                                                    <Typography variant='h4' color='textSecondary'>
                                                        ⁞
                                                    </Typography>
                                                    
                                                </Button>
                                                <Menu
                                                    id="basic-menu"
                                                    anchorEl={anchorEl}
                                                    open={open}
                                                    onClose={handleClose}
                                                    MenuListProps={{
                                                    'aria-labelledby': 'basic-button',
                                                    }}
                                                >   
                                                    <MenuItem onClick={(e) => handleModify(e, post.articleNum, post.articleTitle, post.articleContent, modifyMode)}>Modify</MenuItem>
                                                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                                                </Menu>
                                            </Box>
                                        )}
                                    </Box>
                                </ListItem>
                                <ListItem>
                                    <ListItemText

                                        onClick={(e) => handleContentView(e, post)}
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

                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '12px',
                                            padding: '6px'
                                        }}

                                    />
                                </ListItem>
                                <Typography variant="body2" color="textSecondary" style={{ marginTop: '8px' }}>
                                    Created: {new Date(post.createdAt).toLocaleDateString()} | Views: {post.viewCount}
                                </Typography>


                                {/* Like and Dislike buttons */}
                                <Box display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" style={{ marginTop: '8px' }}>
                                    <Button 
                                        onClick={(e) => handleLike(e, post)}
                                        style={{
                                            backgroundColor: post.isLike ? '#6a1b9a' : '#424242',
                                            color: post.isLike ? '#ffffff' : '#bdbdbd',
                                        }}
                                    >
                                        👍 {post.likeCount}
                                    </Button>
                                    <Button 
                                        onClick={(e) => handleHate(e, post)}
                                        style={{
                                            backgroundColor: post.isHate ? '#c62828' : '#424242',
                                            color: !post.isHate ? '#bdbdbd' : '',
                                            marginRight: '8px', // 버튼 사이에 여백 추가
                                            marginLeft: '8px'
                                        }}
                                    >
                                        👎 {post.hateCount}
                                    </Button>
                                    <Button 
                                            onClick={(e) => handleComment(e, post)}
                                            style={{
                                                color: '#bdbdbd',
                                                backgroundColor: '#424242'
                                            }}
                                    >
                                        💬 {post.commentCount}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </List>
                )}
            </Box>
    )
}

export default ArticleList;