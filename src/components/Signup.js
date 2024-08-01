import { Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { Component } from 'react';

import axios from 'axios'

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            password: '',
            password_check: '',
            user: null,
            idErrorMessage: '',
            passwordErrorMessage: ''
        };
    }

    handleChange = (event) => {
        const {name, value} = event.target;
        this.setState({[name]: value})
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const {id, password, password_check} = this.state;

        const idRegex = /^[a-zA-Z0-9]{3,12}$/;
        if(!idRegex.test(id)) {
            this.setState({idErrorMessage:'아이디는 3글자 이상 12글자 이하의 영문자 또는 숫자로 구성되어야 합니다.'});
            return;
        } else {
            this.setState({idErrorMessage:''});

        }

        if(password.length < 4 || password.length > 16) {
            this.setState({passwordErrorMessage: "비밀번호는 4글자 이상 16글자 이하로 설정해주세요."})
            return;
        } else {
            this.setState({passwordErrorMessage: ''})
        }

        if(password != password_check) {
            this.setState({passwordErrorMessage : "비밀번호가 일치하지 않습니다."});
            return;
        } else {
            this.setState({passwordErrorMessage : ''});
        }

        try {
            const data = {id, password}
            
            const response = await axios.post(`http://localhost:8080/api/users`,
                data, {
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );
            this.setState({user: response.data})
        } catch(error) {
            this.setState({user: null, errorMessage: '중복된 아이디입니다.'});
        }
    }

    render() {
        const {id, password, password_check, idErrorMessage, passwordErrorMessage} = this.state;

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
                            id="id"
                            label="아이디"
                            name="id"
                            autoFocus
                            value={id}
                            onChange={this.handleChange}
                        />
                        {idErrorMessage && (
                            <Typography
                                variant='body2'
                                color='error'
                                sx={{mt: 1}}
                                >
                                    {idErrorMessage}
                                </Typography>
                        )}
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
                        {passwordErrorMessage && (
                            <Typography
                                variant='body2'
                                color='error'
                                sx={{mt: 1}}
                            >
                                {passwordErrorMessage}
                            </Typography>
                        )}
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