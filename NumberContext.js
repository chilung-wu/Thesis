// NumberContext.js
import React, { createContext, useState, useContext } from 'react';

const NumberContext = createContext();

export const useNumber = () => useContext(NumberContext);

export const NumberProvider = ({ children }) => {
  const [number, setNumber] = useState(0);

  return (
    <NumberContext.Provider value={{ number, setNumber }}>
      {children}
    </NumberContext.Provider>
  );
};
