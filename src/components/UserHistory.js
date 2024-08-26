import React, { useState, useEffect } from "react";
import ky from "ky";
import { useStore } from "../redux/store/store";
import {
  Container,
  Box,
  Pagination,
} from "@mui/material";
import ArticleList from "./ArticleList";
import { articlePath } from "../util/constant";

const UserHistory = () => {
  // 상태 선언
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { userId, setUserId } = useStore();

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await ky
          .get(`${articlePath}/user?page=${currentPage - 1}&userId=${userId}`)
          .json();
        setPosts(response.content || []); // API 응답 데이터로 상태 업데이트
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        setError(error.message); // 에러 상태 업데이트
      } finally {
        setLoading(false); // 로딩 상태 해제
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
    <Container maxWidth="md" style={{ marginTop: "20px", display: "flex" }}>
      {/* Main Content */}
      <ArticleList posts={posts} setPosts={setPosts} />

      {/* Right Sidebar */}
      <Box
        style={{
          position: "fixed",
          right: "10%",
          top: "50%",
          width: "20%",
          zIndex: 1000,
          padding: "10px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
