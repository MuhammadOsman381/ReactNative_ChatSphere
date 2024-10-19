import React, { useState } from 'react';
import { MyContext } from './Context.js'; 

const MyProvider = ({ children }) => {
  const [state, setState] = useState(false);
  const updateState = (newValue) => {
    setState(newValue);
  };
  return (
    <MyContext.Provider value={{ state, updateState }}>
      {children}
    </MyContext.Provider>
  );
};

export default MyProvider;
