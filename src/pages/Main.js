import React from 'react'
import { useSelector } from 'react-redux';

const Main = () => {
  const userId = useSelector(state => state.user.userId);

  console.log(userId);
  
  return (
    <div>index</div>
  )
}

export default Main;