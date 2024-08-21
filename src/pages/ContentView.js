import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Collapse,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  Box,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // Import for the menu icon
import ky from "ky";
import { useStore } from "../redux/store/store";
import { articlePath } from "../util/constant";

const ContentView = () => {
  const location = useLocation();
  const { post } = location.state || {};
  const [commentText, setCommentText] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCommentId, setCurrentCommentId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [selectedCommentNum, setSelectedCommentNum] = useState("");
  const [textFieldFocus, setTextFieldFucus] = useState(false);
  const { userId } = useStore();

  useEffect(() => {
    if (post) {
      const fetchComments = async () => {
        try {
          const response = await ky
            .get(`${articlePath}/comments/${post.articleNum}`)
            .json();
          setComments(response.content);
          setCommentCount(comments.length);
        } catch (error) {
          console.error(error);
        }
      };
      fetchComments();
    }
  }, [commentCount]);

  if (!post) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          No post found.
        </Typography>
      </Container>
    );
  }

  const handleLike = (commentId) => {
    console.log(`Like clicked for comment ${commentId}`);
  };

  const handleHate = (commentId) => {
    console.log(`Dislike clicked for comment ${commentId}`);
  };

  const handleCommentSubmit = async () => {
    const articleNum = post.articleNum;

    const data = {
      articleNum: articleNum,
      userId: userId,
      commentText: commentText,
    };

    try {
      const response = await ky
        .post(`${articlePath}/comments`, {
          json: data,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .json();

      alert("댓글이 작성되었습니다.");
      setComments((prevComment) => [response, ...prevComment]);
      setCommentCount(comments.length);
      setCommentText("");
    } catch (error) {
      console.error(error);
    }
  };

  const toggleExpand = (commentId) => {
    setExpandedComments((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const handleClick = (event, commentId) => {
    setAnchorEl(event.currentTarget);
    setCurrentCommentId(commentId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentCommentId(null);
  };

  const handleModify = async (e, commentNum) => {
    handleClose();
  };

  const handleDelete = () => {
    console.log(`Delete clicked for comment ${currentCommentId}`);
    handleClose();
  };

  const handleReport = () => {
    handleClose();
  };

  const renderCommentContent = (comment) => {
    const maxLength = 200; // 최대 문자 길이
    const isExpanded = expandedComments[comment.id];

    return (
      <>
        <Typography variant="body2" color="textSecondary" component="div">
          {comment.commentText.length > maxLength && !isExpanded
            ? comment.commentText.slice(0, maxLength) + "..."
            : comment.commentText}
        </Typography>
        {comment.commentText.length > maxLength && (
          <Button size="small" onClick={() => toggleExpand(comment.id)}>
            {isExpanded ? "접기" : "자세히 보기..."}
          </Button>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "2rem", width: "100%" }}>
      <Grid container spacing={2}>
        {/* Left side: Article content */}
        <Grid item xs={12} md={8}>
          <Card style={{ minHeight: "30vh" }}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {post.articleTitle}
              </Typography>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                작성자: {post.author} | 작성일:{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" style={{ marginTop: "1rem" }}>
                {post.articleContent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right side: Comments */}
        <Grid item xs={12} md={4}>
          <Paper
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1rem",
              minHeight: "30vh",
              width: "20vw",
            }}
          >
            <Typography variant="h6" gutterBottom>
              댓글 {commentCount}
            </Typography>

            {/* 댓글 목록을 스크롤할 수 있는 섹션 */}
            <Box
              flexGrow={1}
              style={{
                overflow: "auto",
                overflowX: "hidden",
                maxHeight: "50vh",
              }}
            >
              {comments && comments.length > 0 ? (
                comments.map(
                  (comment) =>
                    comment.isModified && (
                      <Box
                        flexGrow={1}
                        style={{
                          overflow: "auto",
                          overflowX: "hidden",
                          maxHeight: "50vh",
                        }}
                      >
                        {comments && comments.length > 0 ? (
                          comments.map(
                            (comment) =>
                              comment.isModified && ( // 조건부 렌더링
                                <Box key={comment.id} mb={2} display="flex">
                                  {/* 아바타 */}
                                  <Avatar
                                    alt={comment.author}
                                    src="/static/images/avatar/1.jpg"
                                    style={{
                                      marginRight: "16px",
                                      width: "64px",
                                      height: "64px",
                                    }}
                                  />

                                  {/* 댓글 내용 */}
                                  <Box flexGrow={1}>
                                    {/* 사용자 이름 */}
                                    <Typography
                                      variant="body2"
                                      color="textPrimary"
                                      fontSize="16px"
                                      fontWeight="bold"
                                      style={{ margin: "10px 0" }}
                                    >
                                      {comment.userId}
                                    </Typography>
                                    {/* 댓글 내용 */}
                                    {renderCommentContent(comment)}
                                    {/* 좋아요/싫어요 정보 */}
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      mt={1}
                                    >
                                      <IconButton
                                        onClick={() => handleLike(comment.id)}
                                        size="small"
                                      >
                                        <ThumbUpIcon fontSize="small" />
                                      </IconButton>
                                      <Typography
                                        variant="body2"
                                        style={{ marginRight: "8px" }}
                                      >
                                        {comment.likeCount}{" "}
                                        {/* 좋아요 수 표시 */}
                                      </Typography>
                                      <IconButton
                                        onClick={() => handleHate(comment.id)}
                                        size="small"
                                      >
                                        <ThumbDownIcon fontSize="small" />
                                      </IconButton>
                                      <Typography
                                        variant="body2"
                                        style={{ marginLeft: "8px" }}
                                      >
                                        {comment.hateCount}{" "}
                                        {/* 싫어요 수 표시 */}
                                      </Typography>
                                      {/* 메뉴 버튼 */}
                                      <IconButton
                                        edge="end"
                                        onClick={(e) =>
                                          handleClick(e, comment.id)
                                        }
                                        size="small"
                                        style={{ marginLeft: "auto" }}
                                      >
                                        <MoreVertIcon />
                                      </IconButton>
                                      <Menu
                                        anchorEl={anchorEl}
                                        open={
                                          Boolean(anchorEl) &&
                                          currentCommentId === comment.id
                                        }
                                        onClose={handleClose}
                                        MenuListProps={{
                                          "aria-labelledby": "basic-button",
                                        }}
                                      >
                                        {userId === comment.userId && (
                                          <Box>
                                            <MenuItem
                                              onClick={(e) =>
                                                handleModify(
                                                  e,
                                                  comment.commentNum
                                                )
                                              }
                                            >
                                              수정
                                            </MenuItem>
                                            <MenuItem onClick={handleDelete}>
                                              삭제
                                            </MenuItem>
                                          </Box>
                                        )}
                                        {userId !== comment.userId && (
                                          <MenuItem onClick={handleReport}>
                                            신고
                                          </MenuItem>
                                        )}
                                      </Menu>
                                    </Box>
                                  </Box>
                                </Box>
                              )
                          )
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            댓글이 없습니다.
                          </Typography>
                        )}
                      </Box>
                    )
                )
              ) : (
                <Typography variant="body2" color="textSecondary">
                  댓글이 없습니다.
                </Typography>
              )}
            </Box>

            {/* 댓글 작성 섹션 */}
            <Box
              sx={{
                width: "100%",
                padding: "16px",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              <TextField
                label="입력"
                variant="standard" // 밑줄 있는 TextField
                fullWidth
                value={commentText}
                onFocus={(e) => setTextFieldFucus(true)}
                onChange={(e) => setCommentText(e.target.value)}
              />
              {textFieldFocus && (
                <Collapse in={textFieldFocus}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "16px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ marginRight: "8px" }}
                    >
                      취소
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCommentSubmit}
                    >
                      댓글 추가
                    </Button>
                  </Box>
                </Collapse>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContentView;
