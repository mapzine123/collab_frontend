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
import { Add, CheckCircle, Delete, Edit } from '@mui/icons-material';
import { useStore } from "../redux/store/store";
import ky from "ky";
import { API, getApiUrl } from "../util/constant";
import { api } from '../api/client';

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
    const fetchTodos = async () => {
      try {
        const response = await ky.get(`${getApiUrl(API.TODOS)}`, {
          headers : {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        }).json();

        setOriginalTodos(response);
        setTodos(response);
        console.log(response);
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

      if(changes.length > 0) {
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
    console.log("changeed")
    const changes = {
      added: current.filter(todo => !original.find(o => o.id === todo.id)),
      modifyed: current.filter(todo => {
        const originalTodo = original.find(o => o.id === todo.id);
        return originalTodo && (
          originalTodo.text !== todo.text ||
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
    const totalChanges = changes.added.length + changes.modifyed.length + changes.deleted.length;

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
    const totalChanges = changes.added.length + changes.modifyed.length + changes.deleted.length;

    if(totalChanges > 0) {
      try {
        await api.post(`${getApiUrl(API.TODOS)}`, {
          json: changes
        });
        setOriginalTodos(todos);
        alert("변경사항이 저장되었습니다.");
      } catch(error) {
        console.error('Failed to save Changes : ', error);
      } 
    } else {
      alert("저장할 변경사항이 없습니다.");
    }
  }

  const handleAddTodo = () => {
    if(input.trim() === '') {
      alert("할 일을 입력해주세요!");
      return;
    }

    setTodos([...todos, {content: input, completed: false}]);
    setInput('');
    checkAndSaveChanges();
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
    const updatedTodos = [...todos];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    setTodos(updatedTodos);
    checkAndSaveChanges();
  }

  // 수정 시작
  const handleStartEdit = (todo, index) => {
    setEditingId(index);
    setEditText(todo.text);
  }

  // 수정 완료
  const handleFinishEdit = (index) => {
    const updatedTodos = [...todos];
    updatedTodos[index].text = editText;
    setTodos(updatedTodos);
    setEditingId(null);
    setEditText('');
    checkAndSaveChanges();
  }

  return (
    <Box sx={{
      maxWidth: 480,
      margin: '50px auto',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, .8)',
      backgroundColor: '#1E1E1E',
      color: '#E0E0E0'
    }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2
        }}
      >
        <Typography>
          📝 To-Do list
        </Typography>
        <Button
          onClick={handleSaveChanges}
          variant='contained'
          sx={{
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#45a049'
            }
          }}
        >
          저장
        </Button>
      </Box>

      
      {/* 입력 필드 */}
      <Box sx={{
        display: 'flex', gap: 1
      }}>
        <TextField 
          fullWidth
          variant='outlined'
          placeholder='할 일을 입력하세요'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          sx={{
            input: {color: '#E0E0E0'},
            '& .MuiOutlinedInput-root' : {borderColor: '#444'}
          }}
        />
        <Button
          onClick={handleAddTodo}
          variant='contained'
          startIcon={<Add />}
          sx={{
            flexShrink: 0,
            backgroundColor: '#3A3A3A',
            color: '#fff'
          }}
        >
          추가
        </Button>
      </Box>
      
      {/* 필터 버튼 */}
      <Box
        sx={{
          marginTop: 2,
          display: 'flex',
          justifyContent: 'center',
          gap: 1
        }}
      >
        <Chip 
          label="전체"
          onClick={() => setFilter('all')}
          sx={{
            backgroundColor: filter === 'all' ? '#3A3A3A' : '#2C2C2C',
            color: '#fff'
          }}
        />
        <Chip
          label="완료됨"
          onClick={() => setFilter('completed')}
          sx={{
            backgroundColor: filter === 'completed' ? '#3a3a3a' : '#2c2c2c',
            color: '#fff'
          }}  
          
        />
        <Chip
          label="미완료"
          onClick={() => setFilter('pending')}
          sx={{
            backgroundColor: filter === 'pending' ? '#3c3c3c' : '#2c2c2c',
            color: '#fff'
          }}
        />
      </Box>

      {/* To-Do 목록 */}
      <List>
          {isLoading ? (
            <Box 
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: 2
                }}
              >
                <CircularProgress />
              </Box>
          ) : (
          filteredTodos.length === 0 ? (
            <Typography>
              할 일이 없습니다.
            </Typography>
          ) : (
            filteredTodos.map((todo, index) => (
              <ListItem
                key={index}
                sx={{
                  backgroundColor: '#2a2a2a',
                  marginBottom: 1,
                  borderRadius: '8px',
                  boxShadow: '0 2px, 5px rgba(0, 0, 0, 0, .5)'
                }}
                secondaryAction= {
                  <Box>
                    {editingId === index ? (
                      <IconButton onClick={() => handleFinishEdit(index)}>
                        <CheckCircle sx={{color: '#4caf50'}} />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleStartEdit(todo, index)}>
                        <Edit sx={{color: '#90caf9'}} />
                      </IconButton>
                    )}
                    <IconButton edge="end" aria-label='delete' onClick={() => handleDelete(index)}>
                      <Delete sx={{color: '#e57373'}} />
                    </IconButton>
                  </Box>
                }
              >
                <Checkbox 
                  checked={todos.completed}
                  onChange={() => handleToggleComplete(index)}
                  sx={{color: '#81c784', '&.Mui-checked': {color: '#4caf50'}}}
                />
                {editingId === index ? (
                  <TextField
                  fullWidth
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFinishEdit(index)}
                  autoFocus
                  sx={{
                    input: {color: '#E0E0E0'},
                    '& .MuiOutlinedInput-root': {borderColor: '#444'}
                  }}
                  />
                ) : (
                  <ListItemText
                    primary={todo.content}
                    sx={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? '#888' : '#e0e0e0',
                    }}
                  />
                )}
              </ListItem>
            ))))}
      </List>
    </Box>
  );
};

export default ToDoList;
