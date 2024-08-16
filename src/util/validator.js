export const validatePassword = (password) => {
    if(password.length < 4 || password.length > 16) {
        return false;
    } else {
        return true;
    }
}