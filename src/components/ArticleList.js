// ArticleList.js 수정
import React, { useState, useEffect } from "react";
import {
  Menu,
  Button,
  Box,
  List,
  Card,
  CardContent,
  Avatar,
  Typography,
  MenuItem,
  Skeleton,
} from "@mui/material";
import { useStore } from "../redux/store/store";
import ImageIcon from '@mui/icons-material/Image';
import ky from "ky";
import { articlePath, modifyMode, userPath } from "../util/constant";
import { useNavigate } from "react-router-dom";
import { extractFirstImageUrl, hasImageMarkdown, truncateContentWithoutImages } from "../util/markdownUtils";
import { formatDate } from "../util/dateUtil";

const ArticleList = ({ posts, setPosts }) => {
  const { userId } = useStore();
  const [selectedArticleNum, setSelectedArticleNum] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [profileImages, setProfileImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  const navigator = useNavigate();

  // 게시글에 표시된 모든 사용자의 프로필 이미지 로드
  useEffect(() => {
    const fetchProfileImages = async () => {
      // 게시글에서 고유한 사용자 ID 추출
      const uniqueUserIds = [...new Set(posts.map(post => post.articleWriter))];
      
      // 각 사용자 ID에 대해 프로필 이미지 로드
      const newProfileImages = { ...profileImages };
      const newLoadingImages = { ...loadingImages };
      
      await Promise.all(uniqueUserIds.map(async (writerId) => {
        // 이미 가져온 이미지는 다시 가져오지 않음
        if (profileImages[writerId]) return;
        
        try {
          newLoadingImages[writerId] = true;
          // 사용자 프로필 정보 요청
          const token = localStorage.getItem('jwt');
          const response = await ky.get(`${userPath}/profile?userId=${writerId}`, {
            headers: token ? {
              "Authorization": `Bearer ${token}`
            } : {},
            credentials: 'include'
          }).json();
          
          // 응답에서 이미지 URL 추출
          if (response && response.imageUrl) {
            newProfileImages[writerId] = response.imageUrl;
          }
        } catch (error) {
          console.error(`프로필 이미지 로드 오류 (${writerId}):`, error);
        } finally {
          newLoadingImages[writerId] = false;
        }
      }));
      
      setProfileImages(newProfileImages);
      setLoadingImages(newLoadingImages);
    };
    
    if (posts && posts.length > 0) {
      fetchProfileImages();
    }
  }, [posts]);
  
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
      const token = localStorage.getItem('jwt');
      const response = await ky.delete(`${articlePath}`, {
        json: {
          userId,
          articleNum: selectedArticleNum,
        },
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ''
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
      handleClose();
    }
  };

  const handleLike = async (e, post) => {
    const articleId = post.articleId;
    const token = localStorage.getItem('jwt');

    if (userId === null) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    try {
      const response = await ky.post(`${articlePath}/reaction/like`, {
        json: {
          userId,
          articleId,
        },
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ''
        },
      });

      if (response.ok) {
        const updatedArticle = await response.json();
        await setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.articleId === articleId
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
    const articleId = post.articleId;
    const token = localStorage.getItem('jwt');

    if (userId === null) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    try {
      const response = await ky.post(`${articlePath}/reaction/hate`, {
        json: {
          userId,
          articleId,
        },
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ''
        },
      });

      if (response.ok) {
        const updatedArticle = await response.json();
        await setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.articleId === articleId
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

  // 프로필 이미지 표시 로직
  const getProfileImage = (writerId) => {
    // 이미지 있는 경우 반환
    if (profileImages[writerId]) {
      return profileImages[writerId];
    }
    
    // 로딩 중인 경우 null 반환 (Skeleton 표시)
    if (loadingImages[writerId]) {
      return null;
    }
    
    // 이미지 없는 경우 기본 이미지
    return null; // Avatar는 기본적으로 이니셜을 표시
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px' }}>
      {posts.length !== 0 && (
        <List sx={{ width: '100%', p: 0 }}>
          {posts.map((post, index) => (
            <Card
              key={post.articleNum || index}
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
                    {loadingImages[post.articleWriter] ? (
                      <Skeleton variant="circular" width={40} height={40} />
                    ) : (
                      <Avatar
                        alt={post.articleWriter}
                        src={getProfileImage(post.articleWriter)}
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: !getProfileImage(post.articleWriter) ? 'primary.main' : undefined
                        }}
                      >
                        {!getProfileImage(post.articleWriter) && post.articleWriter ? post.articleWriter.charAt(0).toUpperCase() : ''}
                      </Avatar>
                    )}
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
                        open={open && selectedArticleNum === post.articleNum}
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
                    {hasImageMarkdown(post.articleContent) && (
                      <Box 
                        sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1,
                          ml: 1,
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          borderRadius: 1,
                          color: 'primary.main'
                        }}
                      >
                        <ImageIcon fontSize="small" sx={{ mr: 0.5 }} />
                      </Box>
                    )}
                  </Typography>
                  
                    {/* 본문과 이미지 미리보기를 가로로 배치 */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      {/* 본문 텍스트 */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          lineHeight: 1.6,
                          flex: 1
                        }}
                      >
                        {truncateContentWithoutImages(post.articleContent, 100)}
                      </Typography>
                  </Box>
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
                  {formatDate(post.createdAt)} • 조회 {post.viewCount}
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