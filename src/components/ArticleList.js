import React, { useState } from "react";

import {
  Menu,
  Button,
  Box,
  List,
  Card,
  CardContent,
  ListItem,
  Avatar,
  Typography,
  MenuItem,
  ListItemText,
} from "@mui/material";
import { useStore } from "../redux/store/store";

import ky from "ky";
import { articlePath, modifyMode } from "../util/constant";
import { useNavigate } from "react-router-dom";

const ArticleList = ({ posts, setPosts }) => {
  const { userId } = useStore();
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

  const handleModify = (
    e,
    selectedArticleNum,
    prevTitle,
    prevContent,
    mode
  ) => {
    navigator("/write", {
      state: {
        selectedArticleNum: selectedArticleNum,
        prevTitle: prevTitle,
        prevContent: prevContent,
        mode,
      },
    });
  };

  const handleDelete = async (e) => {
    if (selectedArticleNum === null) {
      return;
    }

    try {
      const response = await ky.delete(`${articlePath}`, {
        json: {
          userId,
          articleNum: selectedArticleNum,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.articleNum !== selectedArticleNum)
        );
        alert("게시글이 삭제되었습니다.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      handleClick(e);
    }
  };

  const handleLike = async (e, post) => {
    const articleNum = post.articleNum;

    if (userId === null) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    try {
      const response = await ky.post(`${articlePath}/reaction/like`, {
        json: {
          userId,
          articleNum,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const updatedArticle = await response.json();
        await setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.articleNum === articleNum
              ? {
                  ...post,
                  likeCount: updatedArticle.likeCount,
                  isLike: !post.isLike,
                  isHate: false,
                  hateCount: updatedArticle.hateCount,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleHate = async (e, post) => {
    const articleNum = post.articleNum;

    if (userId === null) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    try {
      const response = await ky.post(`${articlePath}/reaction/hate`, {
        json: {
          userId,
          articleNum,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const updatedArticle = await response.json();
        await setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.articleNum === articleNum
              ? {
                  ...post,
                  likeCount: updatedArticle.likeCount,
                  isLike: false,
                  isHate: !post.isHate,
                  hateCount: updatedArticle.hateCount,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = (e, post) => {
    // 댓글 작성 기능 구현
  };

  const handleContentView = (e, post) => {
    // 게시글 하나 따로 자세히 보기
    navigator("/contentView", {
      state: {
        post: post,
      },
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px' }}>
      {posts.length !== 0 && (
        <List sx={{ width: '100%', p: 0 }}>
          {posts.map((post) => (
            <Card
              key={post.articleNum}
              elevation={0}
              sx={{
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* 작성자 정보 영역 */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      alt={post.userId}
                      src={post.profileImage}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Typography sx={{ fontWeight: 500, color: '#333' }}>
                      {post.articleWriter}
                    </Typography>
                  </Box>
 
                  {post.articleWriter === userId && (
                    <Box>
                      <Button
                        onClick={(e) => handleClick(e, post.articleNum)}
                        sx={{ minWidth: 'auto', color: '#666' }}
                      >
                        ⁝
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        elevation={2}
                        sx={{
                          '& .MuiPaper-root': {
                            borderRadius: 2,
                            minWidth: 120,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }
                        }}
                      >
                        <MenuItem onClick={(e) => handleModify(e, post.articleNum, post.articleTitle, post.articleContent, modifyMode)}>
                          수정하기
                        </MenuItem>
                        <MenuItem onClick={handleDelete} sx={{ color: '#d32f2f' }}>
                          삭제하기
                        </MenuItem>
                      </Menu>
                    </Box>
                  )}
                </Box>
 
                {/* 게시글 내용 */}
                <Box 
                  onClick={(e) => handleContentView(e, post)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                    p: 2,
                    borderRadius: 1
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 1,
                      color: '#1a1a1a'
                    }}
                  >
                    {post.articleTitle}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      lineHeight: 1.6 
                    }}
                  >
                    {post.articleContent.length > 100
                      ? post.articleContent.substring(0, 100) + "..."
                      : post.articleContent}
                  </Typography>
                </Box>
 
                {/* 메타 정보 */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#999',
                    mt: 2,
                    mb: 2,
                    fontSize: '0.875rem'
                  }}
                >
                  {new Date(post.createdAt).toLocaleDateString()} • 조회 {post.viewCount}
                </Typography>
 
                {/* 액션 버튼 */}
                <Box sx={{ 
                  display: 'flex',
                  gap: 1,
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Button
                    onClick={(e) => handleLike(e, post)}
                    variant={post.isLike ? "contained" : "outlined"}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      color: post.isLike ? 'white' : '#666',
                      bgcolor: post.isLike ? '#1976D2' : 'transparent',
                      borderColor: '#E0E0E0',
                      '&:hover': {
                        bgcolor: post.isLike ? '#1565C0' : 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    👍 {post.likeCount}
                  </Button>
                  <Button
                    onClick={(e) => handleHate(e, post)}
                    variant={post.isHate ? "contained" : "outlined"}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      color: post.isHate ? 'white' : '#666',
                      bgcolor: post.isHate ? '#d32f2f' : 'transparent',
                      borderColor: '#E0E0E0',
                      '&:hover': {
                        bgcolor: post.isHate ? '#c62828' : 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    👎 {post.hateCount}
                  </Button>
                  <Button
                    onClick={(e) => handleComment(e, post)}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      color: '#666',
                      borderColor: '#E0E0E0',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.04)'
                      }
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
  );
 };

export default ArticleList;
