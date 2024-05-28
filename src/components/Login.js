import React, {Component} from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            u_id: '',
            password: ''
        };
    }

    handleChange = (event) => {
        const {name, value} = event.target;
        this.setState({[name]: value})
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const {u_id, password} = this.state;
        // 로그인 기능은 추후에 추가
        console.log('로그인 시도', u_id, password)
    }

    render() {
        const {u_id, password} = this.state;

        return (
            <Box
                sx={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Container maxWidth="sm">
                    <Typography 
                        variant="h4"
                        gutterBottom
                        sx={{
                            color: '#90caf9',
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        로그인
                    </Typography>
                    <form onSubmit={this.handleSubmit}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="u_id"
                            label="사용자 이름"
                            name="u_id"
                            autoFocus
                            value={u_id}
                            onChange={this.handleChange}
                        />
                        <TextField
                            variant='outlined'
                            margin="normal"
                            required
                            fullWidth
                            id="password"
                            label="비밀번호"
                            name="password"
                            type="password"
                            value={password}
                            onChange={this.handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{mt: 2}}
                        >
                            로그인
                        </Button>
                    </form>
                </Container>
            </Box>
        );
    }
}

export default Login;