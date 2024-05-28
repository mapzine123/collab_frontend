import { Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { Component } from 'react';

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            u_id: '',
            password: '',
            password_check: '',
        };
    }

    handleChange = (event) => {
        const {name, value} = event.target;
        this.setState({[name]: value})
    }

    handleSubmit = (event) => {
        event.preventDefault();
        // 나중에 회원가입시 할 코드 작성
        console.log("회원가입 시도")
    }

    render() {
        const {u_id, password, password_check} = this.state;

        return (
            <Box
                sx={{
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="sm">
                    <Typography
                        variant='h4'
                        gutterBottom
                        sx={{
                            color: '#90caf9',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            marginBottom: 2
                        }}
                    >
                        회원가입
                    </Typography>
                    <form onSubmit={this.handleSubmit}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="u_id"
                            label="아이디"
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
                        <TextField
                            variant='outlined'
                            margin="normal"
                            required
                            fullWidth
                            id="password_check"
                            label="비밀번호 확인"
                            name="password_check"
                            type="password"
                            value={password_check}
                            onChange={this.handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{mt: 2}}
                        >
                            회원가입
                        </Button>
                    </form>
                </Container>
            </Box>
        );
    }
}

export default Signup;