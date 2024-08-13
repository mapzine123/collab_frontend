// 액션 객체를 반환
import {SET_AUTHENTICATED, USER_ID} from './types.js'

export const setUserId = (userId) => ({
    type: USER_ID,
    payload: {userId}
});

export const setAuthenticated = (authenticated) => ({
    type: SET_AUTHENTICATED,
    payload: {authenticated}
})