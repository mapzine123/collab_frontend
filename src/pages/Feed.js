import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  Chip,
} from "@mui/material";

const Feed = () => {
  const [posts, setPosts] = useState([]); // 게시물 목록 저장 배열
  const [hasMore, setHasMore] = useState(true); // 추가로 불러올 게시물이 있는지 여부
  const [loading, setLoading] = useState(false); // 새로운 게시물 로딩중인지 여부
  const [page, setPage] = useState(0); // 현재 페이지 번호
  const perPage = 5; // 한 페이지당 표시할 게시물 수
  let i = 0;

  // 스크롤 이벤트 처리
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY <= document.body.offsetHeight - 100 &&
      hasMore &&
      !loading
    ) {
      loadMorePosts();
    }
  }, [hasMore, loading]);

  // 새로운 게시물을 불러오는 함수
  const loadMorePosts = () => {
    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1 + i;
      const newPosts = Array.from({ length: perPage }, (_, index) => ({
        id: nextPage * perPage + index + i,
        username: `user${nextPage * perPage + index}`,
        content: `This is the ${nextPage * perPage + index}th post`,
        hashtags: ["random", "tag"],
      }));

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage(nextPage);
      setHasMore(newPosts.length === perPage);
      setLoading(false);
      i += 1;
    }, 1000);
  };

  // 컴포넌트가 마운트 될 때 스크롤 이벤트 리스너 추가
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    loadMorePosts(); // 초기 데이터 로드

    // 컴포넌트가 unmount 될 때 스크롤 이벤트 제거
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]); // 의존성 배열에 handleScroll 추가

  // 게시물 높이 계산
  const calculationCardHeight = (content) => {
    const lineHeight = 20; // 글자 당 높이
    const minHeight = 100; // 최소 높이
    const margin = 40; // 상하 여백
    const contentHeight = content.split(" ").length * lineHeight; // content 높이 계산
    return Math.max(minHeight, contentHeight + margin) + 30; // 내용 높이와 최소 높이 중 더 큰값 반환
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      {posts.map((post) => (
        <Card
          key={post.id}
          style={{
            marginBottom: "20px",
            height: calculationCardHeight(post.content) + "px",
          }}
        >
          <CardContent>
            <Typography variant="h6">{post.username}</Typography>
            <Typography variant="body2" color="textSecondary">
              {post.content}
            </Typography>
            <div style={{ padding: "8px" }}>
              {post.hashtags.map((tag, index) => (
                <Chip
                  href="#"
                  key={index}
                  label={`${tag}`}
                  style={{ marginTop: "40px" }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {loading && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <CircularProgress />
        </div>
      )}
    </Container>
  );
};

export default Feed;
