import {SET_AUTHENTICATED, USER_ID} from '../actions/types'

const initialState = {
    userId: null,
    authenticated: false,
}

const userReducer = (state = initialState, action) => {
    switch(action.type) {
        case USER_ID :
            return {
                ...state,
                userId: action.payload.userId,
            };
        
        case SET_AUTHENTICATED:
            return {
                ...state,
                authenticated: action.payload.authenticated,
            }

        default :
            return state;
    }
};

export default userReducer;