export const loadState = () => {
  try {
    const serializedState = sessionStorage.getItem("reduxState");

    if (serializedState === null) {
      return undefined;
    }

    return JSON.parse(serializedState);
  } catch (error) {
    console.error("데이터 로드 실패", error);
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem("reduxState", serializedState);
  } catch (error) {
    console.error("데이터 저장 실패", error);
  }
};
