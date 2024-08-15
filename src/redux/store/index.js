import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../reducers/rootReducer";
import { loadState, saveState } from "./storage";

const persistedState = loadState();

const store = configureStore({
    reducer: rootReducer,
    preloadedState: persistedState,
});

store.subscribe(() => {
    saveState(store.getState());
})

export default store;