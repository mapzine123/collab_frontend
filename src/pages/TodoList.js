import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
  
} from '@mui/material';
import { Add, CheckBox, Delete } from '@mui/icons-material';

const ToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');

  const handleAddTodo = () => {
    if(input.trim() === '') {
      alert("할 일을 입력해주세요!");
      return;
    }

    setTodos([...todos, {text: input, completed: false}]);
    setInput('');
  }

  const filteredTodos = (() => {
    if(filter === 'all') {
      return todos;
    } else if(filter == 'completed') {
      return todos.filter((todo) => todo.completed);
    } else {
      return todos.filter((todo) => !todo.completed);
    }
  })();

  const handleDelete = (index) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
  }

  const handleToggleComplete = (index) => {
    const updatedTodos = [...todos];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    setTodos(updatedTodos);
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
      <Typography>
        📝 To-Do list
      </Typography>

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
          {filteredTodos.length === 0 ? (
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
                  <IconButton edge="end" aria-label='delete' onClick={() => handleDelete(index)}>
                    <Delete sx={{color: '#e57373'}} />
                  </IconButton>
                }
              >
                <Checkbox 
                  checked={todos.completed}
                  onChange={() => handleToggleComplete(index)}
                  sx={{color: '#81c784', '&.Mui-checked': {color: '#4caf50'}}}
                />
                <ListItemText
                  primary={todo.text}
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#888' : '#e0e0e0',
                  }}
                />
              </ListItem>
            ))
          )}
      </List>
    </Box>
  );
};

export default ToDoList;
