import { useState } from "react";

export default function FakeReactionButton({ emoji, likeCount = 1 }) {
  const [hasLiked, setHasLiked] = useState(false)
  return (
    <button
      className={`${hasLiked ? 'bg-blue-100 border-blue-400' : 'bg-gray-200 border-transparent hover:bg-gray-300 hover:border-gray-400'} active:scale-90 border rounded-full w-fit px-2 py-0.5 flex items-center cursor-pointer transition-all`}
      onClick={e => {
        e.preventDefault();
        setHasLiked(!hasLiked);
      }}
    >
      <div>
        <>{emoji}</> <span style={{ fontSize: '0.6rem' }}>{hasLiked ? likeCount + 1 : likeCount}</span>
      </div>
    </button>
  )
}