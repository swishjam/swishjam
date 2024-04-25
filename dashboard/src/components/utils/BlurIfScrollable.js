import { useEffect, useRef, useState } from "react"

export default function BlurIfScrollable({ height, children }) {
  const scrollContainerRef = useRef();
  const [displayTopBlur, setDisplayTopBlur] = useState(false);
  const [displayBottomBlur, setDisplayBottomBlur] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight === scrollHeight;

      setDisplayTopBlur(!isAtTop);
      setDisplayBottomBlur(!isAtBottom);
    };

    scrollContainerRef.current.addEventListener('scroll', handleScroll);
    return () => scrollContainerRef.current.removeEventListener('scroll', handleScroll);
  }, []);

  if (!height) {
    throw new Error('BlurIfScrollable component requires a height prop.')
  }

  return (
    <div
      className={`relative overflow-y-scroll ${height}`}
      ref={scrollContainerRef}
    >
      <div className={`absolute top-0 left-0 right-0 h-[20px] blur-lg bg-white ${displayTopBlur ? 'block' : 'hidden'}`} />
      {children}
      <div className={`absolute bottom-0 left-0 right-0 h-[20px] blur-lg bg-white ${displayBottomBlur ? 'block' : 'hidden'}`} />
    </div>
  )
}