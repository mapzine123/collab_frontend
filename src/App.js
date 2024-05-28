import './App.css';
import Login from './components/Login';
import { AppBar, Button, CssBaseline, ThemeProvider, Toolbar, createTheme } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Signup from './components/Signup';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9'
    },
    secondary: {
      main: '#f48fb1'
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" component={Link} to="/">Login</Button>
            <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
