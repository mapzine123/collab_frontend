import { Card, CardContent, CircularProgress, Container, Typography, Link, Chip } from '@mui/material';
import React, { Component } from 'react';

class Feed extends Component {
    // 컴포넌트 초기 상태 설정
    constructor(props) {
        super(props);
        this.state = {
            posts: [], // 게시물 목록 저장 배열
            hasMore: true, // 추가로 불러올 게시물이 있는지 여부
            loading: false, // 새로운 게시물 로딩중인지 여부
            page: 0, // 현재 페이지 번호
            perPage: 5, // 한 페이지당 표시할 게시물 수
        };

        this.handleScroll = this.handleScroll.bind(this);
    }
    // 컴포넌트가 마운트 될 때 스크롤 이벤트 리스너 추가
    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll)
        this.loadMorePosts();
    }
    // 컴포넌트가 unmount 될 때 스크롤 이벤트 제거
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    }
    // 스크롤 이벤트 처리
    // 스크롤을 내리면 loadMorePosts() 함수를 호출하여 추가 게시물을 불러옴
    handleScroll() {
        const {loading, hasMore} = this.state;
        if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && this.state.hasMore && !loading) {
            this.loadMorePosts();
        }
    }
    // 새로운 게시물을 불러오는 함수
    loadMorePosts() {
        this.setState({loading: true}, () => {
            setTimeout(() => {
                const {page, perPage} = this.state;
                const nextPage = page + 1
                
                // _는 현재 요소를 무시하는 목적으로 사용되는 변수
                // 코드를 읽는 사람에게 해당 변수가 사용되지 않는다는 것을 명시적으로 전달하는 역할
                const newPosts = Array.from({length: perPage}, (_, index) => ({ // 테스트를 위한 더미데이터 생성
                    id: nextPage * perPage + index,
                    username: `user${nextPage * perPage + index}`,
                    content: `This is the ${nextPage * perPage + index}th post`,
                    hashtags: ['random', 'tag'],
                }));

                this.setState(prevState => ({
                // ... : spread 연산자, 이전 상태의 게시물 목록과 새로 생성된 게시물 목록을 합침
                    posts: [...prevState.posts, ...newPosts], 
                    page: nextPage,
                    hasMore: newPosts.length === perPage,
                    loading: false,
                }));
            }, 1000);
        });
    }

    // 게시물 높이 계산
    calculationCardHeight(content) {
        const lineHeight= 20; // 글자 당 높이
        const minHeight = 100; // 최소 높이
        const margin = 40; // 상하 여백
        const contentHeight = content.split(' ').length * lineHeight; // content 높이 계산
        return Math.max(minHeight, contentHeight + margin) + 30 // 내용 높이와 최소 높이 중 더 큰값 반환
    }

    render() {
        const {posts, loading} = this.state;
        
        return (
            <Container maxWidth="md" style={{marginTop: '20px'}}>
                {posts.map(post => (
                    <Card key={post.id} style={{marginBottom: '20px', height: this.calculationCardHeight(post.content) + 'px'}}>
                        <CardContent>
                            <Typography variant='h6'>{post.username}</Typography>
                            <Typography variant='body2' color="textSecondary">{post.content}</Typography>
                            <div style={{padding: '8px'}}>
                                {post.hashtags.map((tag, index) => (
                                    <Chip href="#" key={index} label={`${tag}`} style={{marginTop: '40px'}}/>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {loading && (
                    <div style={{textAlign:'center', margin: '20px 0'}}>
                        <CircularProgress />
                    </div>
                )}
            </Container>
        );
    }
}

export default Feed;