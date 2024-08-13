import { setAuthenticated, setUserId } from "./actions/user";

export const mapStateToProps = (state) => ({
    userId: state.user.userId,
    authenticated: state.user.authenticated,
});

export const mapDispatchToProps = {
    setUserId,
    setAuthenticated,
}