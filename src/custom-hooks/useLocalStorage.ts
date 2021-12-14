import { useState, useEffect, SetStateAction, Dispatch } from "react";

export const useLocalStorage = (
  key: string,
  defaultValue: string
): [string, Dispatch<SetStateAction<string>>] => {
  const [value, setValue] = useState(
    () => localStorage.getItem(key) || defaultValue
  );

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
};
