import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Pagination, Box, Container, Button } from "@mui/material";
import ky from "ky";
import { useStore } from "../redux/store/store";
import ArticleList from "../components/ArticleList";
import { articlePath, writeMode } from "../util/constant";

const Main = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { userId } = useStore();

  const fetchPosts = async (page, query = "") => {
    try {
      const response = await ky
        .get(
          `${articlePath}?page=${page - 1}&search=${encodeURIComponent(
            query
          )}&userId=${userId}`
        )
        .json();
      setPosts(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("오류 발생!");
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchPosts(value);
  };

  const handleWrite = (e, mode) => {
    if (userId === null) {
      alert("로그인을 해야 사용할 수 있는 기능입니다.");
      navigate("/login");
      return;
    }
    navigate("/write", {
      state: {
        selectedArticleNum: "",
        prevTitle: "",
        prevContent: "",
        mode,
      },
    });
  };

  const handleSearch = () => {
    fetchPosts(1, searchQuery);
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          style={{ marginBottom: "20px", width: "100%" }}
        >
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            style={{ marginBottom: "10px" }}
            autoComplete="off"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            style={{ marginBottom: "20px", marginLeft: "20px" }}
          >
            검색
          </Button>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={(e) => handleWrite(e, writeMode)}
          style={{ marginBottom: "20px" }}
        >
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
