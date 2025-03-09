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
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { Add, CheckCircle, Delete, Edit, FilterList } from '@mui/icons-material';
import { API, getApiUrl } from "../../util/constant";
import { api } from '../../api/client';
import { useStore } from '../../redux/store/store';

const ToDoList = () => {
  const [originalTodos, setOriginalTodos] = useState([]);
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all'); // 부서 필터 상태 추가
  
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]); // 부서 목록
  const [users, setUsers] = useState([]); // 사용자 목록
  
  const { userId, setUserId } = useStore();

  const MAX_CHANGES = 15;
  
  // 컴포넌트가 언마운트될 때 변경사항 저장
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

  // todos 변경 시 변경사항 확인
  useEffect(() => {
    if(!isLoading && todos.length > 0) {
      checkAndSaveChanges();
    }
  }, [todos]);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Todo 데이터 로드
        const todosResponse = await api.get(`${getApiUrl(API.TODOS)}`).json();
        setOriginalTodos(todosResponse);
        setTodos(todosResponse);
        
        // 부서 정보 로드
        const departmentsResponse = await api.get(`${getApiUrl(API.USERS)}/departments`).json();
        setDepartments(departmentsResponse);
        
        // 모든 사용자 정보 로드
        const usersResponse = await api.get(`${getApiUrl(API.USERS)}`).json();
        setUsers(usersResponse);
      } catch(error){
        console.error('데이터 로드 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

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
      if(changes.updated.length > 0 || changes.deleted.length > 0) {
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
      completed: false,
      userId: userId // 현재 사용자 ID 추가
    };

    try {
      const savedTodo = await api.post(`${getApiUrl(API.TODOS)}`, {
        json: newTodo
      }).json();

      console.log(savedTodo);

      setTodos(currentTodos => [...currentTodos, savedTodo]);
      setOriginalTodos(currentOriginalTodos => [...currentOriginalTodos, savedTodo]);
      setInput('');

    } catch(error) {
      console.error(error);
    }
  }

  // 부서별로 사용자 필터링
  const getDepartmentUsers = (department) => {
    if (department === 'all') {
      return users;
    }
    return users.filter(user => user.department === department);
  };

  // 필터링된 할 일 목록
  const filteredTodos = (() => {
    // 먼저 완료/미완료 필터 적용
    let filtered = todos;
    if(filter === 'completed') {
      filtered = todos.filter((todo) => todo.completed);
    } else if(filter === 'pending') {
      filtered = todos.filter((todo) => !todo.completed);
    }
    
    // 그 다음 부서 필터 적용
    if (departmentFilter !== 'all') {
      const departmentUserIds = getDepartmentUsers(departmentFilter).map(user => user.id);
      filtered = filtered.filter(todo => departmentUserIds.includes(todo.userId));
    }
    
    return filtered;
  })();

  // 부서 필터 변경 핸들러
  const handleDepartmentFilterChange = (event) => {
    setDepartmentFilter(event.target.value);
  };

  // todo 삭제
  const handleDelete = (index) => {
    const todoToDelete = filteredTodos[index];
    const updatedTodos = todos.filter(todo => todo.id !== todoToDelete.id);
    setTodos(updatedTodos);
    checkAndSaveChanges();
  }

  // 완료 / 미완료 토글
  const handleToggleComplete = (index) => {
    const todoToToggle = filteredTodos[index];
    const updatedTodos = todos.map(todo => {
      if(todo.id === todoToToggle.id) {
        return {...todo, completed: !todo.completed};
      }
      return todo;
    });
    setTodos(updatedTodos);
  }

  // 수정 시작
  const handleStartEdit = (todo, index) => {
    const todoToEdit = filteredTodos[index];
    setEditingId(todoToEdit.id);
    setEditText(todoToEdit.content);
  }

  // 수정 완료
  const handleFinishEdit = (index) => {
    const todoToUpdate = filteredTodos[index];
    const updatedTodos = todos.map(todo => {
      if(todo.id === todoToUpdate.id) {
        return {...todo, content: editText};
      }
      return todo;
    });

    setTodos(updatedTodos);
    setEditingId(null);
    setEditText('');
  }

  // 사용자 이름 가져오기
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  // 사용자 부서 가져오기
  const getUserDepartment = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.department : 'Unknown';
  };

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
            minWidth: '100px',
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: '#1565C0'
            }
          }}
        >
          추가
        </Button>
      </Box>
      
      {/* 필터 섹션 */}
      <Box sx={{ mb: 4 }}>
        {/* 완료 상태 필터 */}
        <Box
          sx={{
            mb: 2,
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
        
        {/* 부서 필터 추가 */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FilterList color="primary" />
          <Typography variant="body1" fontWeight={500} color="#666">
            부서별 필터:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={departmentFilter}
              onChange={handleDepartmentFilterChange}
              displayEmpty
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E0E0E0'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#BDBDBD'
                }
              }}
            >
              <MenuItem value="all">전체 부서</MenuItem>
              {departments.map((dept, index) => (
                <MenuItem key={index} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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
              {departmentFilter !== 'all' 
                ? `${departmentFilter} 부서에 해당하는 할 일이 없습니다.` 
                : '할 일이 없습니다.'}
            </Typography>
          ) : (
            filteredTodos.map((todo, index) => (
              <ListItem
                key={todo.id}
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
                    {editingId === todo.id ? (
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
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {editingId === todo.id ? (
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
                    <>
                      <ListItemText
                        primary={todo.content}
                        sx={{
                          '& .MuiTypography-root': {
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            color: todo.completed ? '#9E9E9E' : '#333'
                          }
                        }}
                      />
                      {/* 담당자 정보 표시 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#666', mr: 1 }}>
                          담당: {todo.name}
                        </Typography>
                        <Chip 
                          label={todo.department} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.65rem',
                            bgcolor: '#E3F2FD',
                            color: '#1976D2' 
                          }} 
                        />
                      </Box>
                    </>
                  )}
                </Box>
              </ListItem>
            ))))}
      </List>
    </Box>
  );
}

export default ToDoList;