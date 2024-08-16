import create from 'zustand'
import {useEffect} from 'react';

const loadFromSessionStorage = (key, defaultValue) => {
    try {
        const serializedValue = sessionStorage.getItem(key);
        if(serializedValue === null) {
            return defaultValue;
        }
        return JSON.parse(serializedValue);
    } catch(error) {
        console.error(error);
        return defaultValue;
    }
}

export const useStore = create((set) => ({
    userId: loadFromSessionStorage('userId', null),
    setUserId: (id) => set({userId: id}),

    authenticated: loadFromSessionStorage('authenticated', false),
    setAuthenticated: (isAuthenticated) => set({authenticated: isAuthenticated}),

    userImagePath: loadFromSessionStorage('userImagePath', null),
    setUserImagePath: (path) => set({userImagePath: path}),
}))

export const usePersistedStore = () => {
    const { userId, authenticated, userImagePath, setUserId, setAuthenticated, setUserImagePath } = useStore();

    useEffect(() => {
        sessionStorage.setItem('userId', JSON.stringify(userId));
    }, [userId]);

    useEffect(() => {
        sessionStorage.setItem('authenticated', JSON.stringify(authenticated));
    }, [authenticated]);

    useEffect(() => {
        sessionStorage.setItem('userImagePath', JSON.stringify(userImagePath));
    }, [userImagePath]);
}