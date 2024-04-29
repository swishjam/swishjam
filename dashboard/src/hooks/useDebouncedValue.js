import { useState, useEffect, useRef } from 'react';

export const useDebouncedValue = (visibleState, onUpdate = () => { }, { delay = 500 } = {}) => {
  const [visibleValue, setVisibleValue] = visibleState;
  const [debouncedValue, setDebouncedValue] = useState(visibleValue);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedValue(visibleValue);
      onUpdate(visibleValue);
    }, delay);
  }, [visibleValue])

  useEffect(() => {
    return () => clearTimeout(debounceTimeoutRef.current);
  }, []);

  return [visibleValue, setVisibleValue, debouncedValue];
};