import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
  
} from '@mui/material';
import { Add, CheckCircle, Delete, Edit, South } from '@mui/icons-material';
import { useStore } from "../redux/store/store";
import ky from "ky";
import { API, getApiUrl } from "../util/constant";
import { api } from '../api/client';
import { compose } from 'redux';
import { current } from '@reduxjs/toolkit';

const ToDoList = () => {
  const [originalTodos, setOriginalTodos] = useState([]);
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');

  const [editingId, setEditingId] = useState(null); // 수정 중인 todo Id
  const [editText, setEditText] = useState(''); // 수정할 텍스트

  const [isLoading, setIsLoading] = useState(true);

  const { userId, setUserId } = useStore();


  const MAX_CHANGES = 15;
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      const changes = calculateChange(originalTodos, todos);
      if(changes.updated.length > 0 || changes.deleted.length > 0) {
        api.post(`${getApiUrl(API.TODOS)}/batch`, {
          json: changes
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [todos, originalTodos]);

  useEffect(() => {
    if(!isLoading && todos.length > 0) {
      checkAndSaveChanges();
    }
  }, [todos]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get(`${getApiUrl(API.TODOS)}`).json();

        setOriginalTodos(response);
        setTodos(response);
      } catch(error){
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();

    // 5분마다 변경사항 저장
    const autoSaveInterval = setInterval(async () => {
      const changes = calculateChange(originalTodos, todos);
      const totalChanges = changes.updated.length + changes.deleted.length;

      if(totalChanges > 0) {
        try {
          await api.post(`${getApiUrl(API.TODOS)}`, {
            json: changes
          });
          setOriginalTodos(todos);
        } catch(error) {
          console.error(error);
        }
      } 
    }, 5 * 60 * 1000);

    // clean up 함수
    return async () => {
      clearInterval(autoSaveInterval);
      const changes = calculateChange(originalTodos, todos);
      if(changes.length > 0) {
        try {
          await api.post(`${getApiUrl(API.TODOS)}`, {
            json: changes
          });
        } catch(error) {
          console.error(error);
        }
      }
    };

  }, []);

  // todo 변경사항 검사 함수
  const calculateChange = (original, current) => {
    const changes  = {
      updated: current.filter(todo => {
        const originalTodo = original.find(o => o.id === todo.id);
        return originalTodo && (
          originalTodo.content !== todo.content ||
          originalTodo.completed !== todo.completed
        );
      }),
      deleted: original.filter(todo => !current.find(c => c.id === todo.id))
    };
    return changes;
  }

  // 변경 사항이 쌓일 때 마다 체크
  const checkAndSaveChanges = async () => {
    const changes = calculateChange(originalTodos, todos);
    const totalChanges = changes.updated.length + changes.deleted.length;

    if(totalChanges >= MAX_CHANGES) {
      try {
        await api.post(`${getApiUrl(API.TODOS)}`, {
          json: changes
        });
        setOriginalTodos(todos);
      } catch(error) {
        console.error('Failed to save Changes: ', error);
      }
    }
  }

  const handleSaveChanges = async () => {
    const changes = calculateChange(originalTodos, todos);
    const totalChanges = changes.updated.length + changes.deleted.length;

    if(totalChanges > 0) {
      try {
        await api.post(`${getApiUrl(API.TODOS)}/batch`, {
          json: changes
        });
        setOriginalTodos([...todos]); // 여기서만 업데이트
        alert("변경사항이 저장되었습니다.");
      } catch(error) {
        console.error('Failed to save Changes : ', error);
      } 
    } else {
      alert("저장할 변경사항이 없습니다.");
    }
  }

  const handleAddTodo = async () => {
    if(input.trim() === '') {
      alert("할 일을 입력해주세요!");
      return;
    }

    const newTodo = {
      content: input,
      completed: false
    };

    try {
      const savedTodo = await api.post(`${getApiUrl(API.TODOS)}`, {
        json: newTodo
      }).json();

      setTodos(currentTodos => [...currentTodos, savedTodo]);
      setOriginalTodos(currentOriginalTodos => [...currentOriginalTodos, savedTodo]);
      setInput('');

    } catch(error) {
      console.error(error);
    }
  }

  // 완료 / 미완료 필터링
  const filteredTodos = (() => {
    if(filter === 'all') {
      return todos;
    } else if(filter === 'completed') {
      return todos.filter((todo) => todo.completed);
    } else {
      return todos.filter((todo) => !todo.completed);
    }
  })();

  // todo 삭제
  const handleDelete = (index) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
    checkAndSaveChanges();

  }

  // 완료 / 미완료 토글
  const handleToggleComplete = (index) => {
    const updatedTodos = todos.map((todo, i) => {
      if(i === index) {
        const updated = {...todo, completed: !todo.completed};
        return updated;
      }
      return {...todo};
    });
    setTodos(updatedTodos);
  }

  // 수정 시작
  const handleStartEdit = (todo, index) => {
    setEditingId(index);
    setEditText(todo.content);
  }

  // 수정 완료
  const handleFinishEdit = (index) => {
    const updatedTodos = todos.map((todo, i) => {
      if(i === index) {
        const updated = {...todo, content: editText};
        return updated;
      }
      return {...todo};
    });

    setTodos(updatedTodos);
    setEditingId(null);
    setEditText('');
  }

  return (
    <Box sx={{
      maxWidth: 700,
      margin: '50px auto',
      padding: '32px',
      borderRadius: '16px',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: '#f0f0f0'
    }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4
        }}
      >
        <Typography
          sx={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1976D2'
          }}
        >
          📝 To-Do list
        </Typography>
        <Button
          onClick={handleSaveChanges}
          variant='contained'
          sx={{
            bgcolor: '#1976D2',
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 2,
            px: 3,
            '&:hover': {
              bgcolor: '#1565C0'
            }
          }}
        >
          저장
        </Button>
      </Box>
 
      {/* 입력 필드 */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 4
      }}>
        <TextField 
          fullWidth
          variant='outlined'
          placeholder='할 일을 입력하세요'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#E0E0E0'
              },
              '&:hover fieldset': {
                borderColor: '#BDBDBD'
              }
            },
            '& .MuiInputBase-input': {
              color: '#333'
            }
          }}
        />
        <Button
          onClick={handleAddTodo}
          variant='contained'
          startIcon={<Add />}
          sx={{
            bgcolor: '#1976D2',
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            minWidth: '100px',  // 최소 너비 추가
            whiteSpace: 'nowrap',  // 텍스트 줄바꿈 방지
            '&:hover': {
              bgcolor: '#1565C0'
            }
          }}
        >
          추가
        </Button>
      </Box>
      
      {/* 필터 버튼 */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          gap: 1
        }}
      >
        <Chip 
          label="전체"
          onClick={() => setFilter('all')}
          sx={{
            bgcolor: filter === 'all' ? '#1976D2' : 'transparent',
            color: filter === 'all' ? 'white' : '#666',
            border: '1px solid',
            borderColor: filter === 'all' ? '#1976D2' : '#E0E0E0',
            '&:hover': {
              bgcolor: filter === 'all' ? '#1565C0' : 'rgba(0,0,0,0.04)'
            }
          }}
        />
        <Chip
          label="완료됨"
          onClick={() => setFilter('completed')}
          sx={{
            bgcolor: filter === 'completed' ? '#1976D2' : 'transparent',
            color: filter === 'completed' ? 'white' : '#666',
            border: '1px solid',
            borderColor: filter === 'completed' ? '#1976D2' : '#E0E0E0',
            '&:hover': {
              bgcolor: filter === 'completed' ? '#1565C0' : 'rgba(0,0,0,0.04)'
            }
          }}
        />
        <Chip
          label="미완료"
          onClick={() => setFilter('pending')}
          sx={{
            bgcolor: filter === 'pending' ? '#1976D2' : 'transparent',
            color: filter === 'pending' ? 'white' : '#666',
            border: '1px solid',
            borderColor: filter === 'pending' ? '#1976D2' : '#E0E0E0',
            '&:hover': {
              bgcolor: filter === 'pending' ? '#1565C0' : 'rgba(0,0,0,0.04)'
            }
          }}
        />
      </Box>
 
      {/* To-Do 목록 */}
      <List sx={{ px: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: '#1976D2' }} />
            </Box>
          ) : (
          filteredTodos.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#666' }}>
              할 일이 없습니다.
            </Typography>
          ) : (
            filteredTodos.map((todo, index) => (
              <ListItem
                key={index}
                onClick={(event) => {
                  // secondaryAction 영역 클릭은 제외
                  if (!event.target.closest('.MuiListItemSecondaryAction-root')) {
                    handleToggleComplete(index);
                  }
              }}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: '#f0f0f0',
                  cursor: 'pointer',
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.02)'
                  }
                }}
                secondaryAction={
                  <Box>
                    {editingId === index ? (
                      <IconButton onClick={() => handleFinishEdit(index)}>
                        <CheckCircle sx={{color: '#4CAF50'}} />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleStartEdit(todo, index)}>
                        <Edit sx={{color: '#1976D2'}} />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleDelete(index)}>
                      <Delete sx={{color: '#F44336'}} />
                    </IconButton>
                  </Box>
                }
              >
                <Checkbox 
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(index)}
                  sx={{
                    color: '#BDBDBD',
                    '&.Mui-checked': {
                      color: '#4CAF50'
                    }
                  }}
                />
                {editingId === index ? (
                  <TextField
                    fullWidth
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFinishEdit(index)}
                    autoFocus
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E0E0E0'
                        },
                        '&:hover fieldset': {
                          borderColor: '#BDBDBD'
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: '#333'
                      }
                    }}
                  />
                ) : (
                  <ListItemText
                    primary={todo.content}
                    sx={{
                      '& .MuiTypography-root': {
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? '#9E9E9E' : '#333'
                      }
                    }}
                  />
                )}
              </ListItem>
            ))))}
      </List>
    </Box>
  );
}

export default ToDoList;
