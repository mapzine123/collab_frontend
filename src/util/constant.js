export const apiPath = 'http://localhost:8080/api'
export const articlePath = apiPath + "/articles";
export const userPath = apiPath + "/users";
export const authPath = apiPath + "/auth";
export const todoPath = apiPath + "/todos";
export const commentPath = apiPath + "/comments";

export const writeMode = "write";
export const modifyMode = "modify";

// .env.development, .env.production 파일 등에서 관리
export const API = {
    BASE: 'http://localhost:8080/api',
    ARTICLES: "/articles",
    USERS: "/users",
    AUTH: "/auth",
    TODOS: "/todos"
};

export const MODES = {
    WRITE: "write",
    MODIFY: "modify"
};

export const getApiUrl = (endpoint) => `${API.BASE}${endpoint}`;
