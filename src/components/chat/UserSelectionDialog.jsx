import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, List, ListItem, ListItemIcon, ListItemText, TextField, Typography } from "@mui/material";
import { getApiUrl, API } from "../../utils/constant";
import { CheckBox, ExpandMore } from "@mui/icons-material";

import { useState, useEffect, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ky from 'ky';
import { useStore } from "../../redux/store/store";

const UserSelectionDialog = ({open, selectedUsers, onSelectUsers, onClose}) => {
    // 모든 사용자 목록 상태
    const [allUsers, setAllUsers] = useState([]);

    // 검색어 상태 관리
    const [searchTerm, setSearchTerm] = useState('');

    // 부서별 사용자 데이터 상태
    const [departmentUsers, setDepartmentUsers] = useState({});

    // 로컬 상태 관리
    const [localSelectedUsers, setLocalSelectedUsers] = useState(selectedUsers);

    // zustand 상태
    const { userId, setUserId } = useStore();
    

    // 컴포넌트 마운트 시 사용자 데이터 가져오기
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('jwt'); // 또는 다른 저장소에서 토큰 가져오기

                const response = await ky.get(getApiUrl(API.USERS), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }).json();    
                
                // 자기 자신을 제외한 사용자 목록 필터링
                const filteredResponse = response.filter(user => user.id !== userId);

                // 전체 사용자 목록 저장
                setAllUsers(filteredResponse);

                // 부서별로 사용자 그룹화
                const groupedUsers = filteredResponse.reduce((acc, user) => {
                    if(!acc[user.department]) {
                        acc[user.department] = [];
                    }

                    acc[user.department].push(user);
                    return acc;
                }, {});
                setDepartmentUsers(groupedUsers);
            } catch(error) {
                console.error('사용자 목록 조회 실패 : ', error);
            }
        };

        if(open) {
            fetchUsers();
            setLocalSelectedUsers(selectedUsers);
        }
    }, [open, selectedUsers]);

    // 필터링 함수를 별도로 정의
    const filterUsers = (users) => {
        if(!searchTerm) {
            return users;
        }
        return users.filter(user => 
            user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // 검색 결과를 위한 필터링된 옵션
    const filteredAllUsers = useMemo(() => {
        return filterUsers(allUsers);
    }, [allUsers, searchTerm])

    // 사용자 선택 토글 핸들러
    const handleUserToggle = (user) => {
        setLocalSelectedUsers(prev => {
            const isSelected = prev.some(u => u.id === user.id);
            if(isSelected) {
                return prev.filter(u => u.id !== user.id);
            }
            return [...prev, user];
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6" component="div">
                    채널에 초대할 멤버 선택
                </Typography>
                {localSelectedUsers.length > 0 && (
                    <Typography variant="subtitle2" color="text.secondary">
                        {localSelectedUsers.length}명 선택됨
                    </Typography>
                )}
            </DialogTitle>
            
            <DialogContent>
                {/* 자동 완성 검색 필드 */}
                <Autocomplete 
                    multiple
                    options={filteredAllUsers}
                    value={localSelectedUsers}
                    onChange={(event, newValue) => setLocalSelectedUsers(newValue)}
                    getOptionLabel={(option) => `${option.name} (${option.id})`}
                    renderInput={(params) => (
                        <TextField 
                            {...params}
                            variant="outlined"
                            placeholder="이름 또는 아이디로 검색"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                        {params.InputProps.startAdornment}
                                    </>
                                )
                            }}
                        />
                    )}
                    renderOption={(props, option, {selected}) => (
                        <ListItem {...props}>
                            <ListItemIcon>
                                <Checkbox checked={selected} />
                            </ListItemIcon>
                            <ListItemText 
                                primary={`${option.name} (${option.id})`}
                                secondary={option.department}
                            />
                        </ListItem>
                    )}
                />

                {/* 부서별 사용자 목록 */}
                {Object.entries(departmentUsers).map(([department, users]) => {
                    const filteredUsers = filterUsers(users);
                    if(filteredUsers.length === 0) {
                        return null;
                    }

                    return (
                        <Accordion key={department}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>
                                    {department} ({filteredUsers.length})
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List dense>
                                    {filteredUsers.map(user => (
                                        <ListItem
                                            key={user.id}
                                            button
                                            onClick={() => handleUserToggle(user)}
                                        > 
                                            <ListItemIcon>
                                                <Checkbox 
                                                    edge="start"
                                                    checked={localSelectedUsers.some(u => u.id === user.id)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={`${user.name} (${user.id})`}
                                                secondary={user.department}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button
                    variant="contained"
                    onClick={() => onSelectUsers(localSelectedUsers)}
                    disabled={localSelectedUsers.length === 0}
                >
                    선택 완료
                </Button>
            </DialogActions>

        </Dialog>
    );
};

export default UserSelectionDialog;