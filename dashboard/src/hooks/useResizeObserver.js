import { useEffect } from 'react';

const useResizeObserver = (ref, callback, { enabled = true } = {}) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const observer = new ResizeObserver(entries => callback(entries));

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, callback, enabled]);
}

export { useResizeObserver };
export default useResizeObserver;