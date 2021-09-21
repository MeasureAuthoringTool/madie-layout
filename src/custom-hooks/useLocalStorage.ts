import { useState, useEffect } from "react";
const getStorageValue = (key, defaultValue) =>
  localStorage.getItem(key) || defaultValue;

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => getStorageValue(key, defaultValue));

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
};
