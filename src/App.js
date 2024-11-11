import "./App.css";
import Main from "./pages/Main";
import Login from "./pages/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Menubar from "./components/Menubar";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import WriteArticle from "./pages/WriteArticle";
import MyPage from "./pages/MyPage";
import { usePersistedStore } from "./redux/store/store";
import ContentView from "./pages/ContentView";
import TodoList from "./pages/TodoList";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
  },
});

function App() {
  usePersistedStore();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Menubar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/write" element={<WriteArticle />} />
          <Route path="/myPage" element={<MyPage />} />
          <Route path="/contentView" element={<ContentView />} />
          <Route path="/todoList" element={<TodoList />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
