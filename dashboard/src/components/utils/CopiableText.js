import { ClipboardCheckIcon } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react"

export default function CopiableText({ value, children, displayMessageFor = 3_500, ...props }) {
  const [showCopiedState, setShowCopiedState] = useState(false);
  return (
    <CopyToClipboard
      text={value}
      onCopy={() => {
        setShowCopiedState(true)
        setTimeout(() => setShowCopiedState(false), displayMessageFor);
      }}
    >
      <button className='cursor-pointer w-fit inline-block transform transition-transform duration-150 active:scale-[98%]' {...props}>
        <div className='relative w-fit inline-block'>
          {children}
          <div className={`${showCopiedState ? 'opacity-100 translate-y-[-125%] z-10' : 'opacity-0 translate-y-0 -z-10'} transition-all transform absolute top-0 flex items-center justify-center w-0 left-[50%]`}>
            <div className='whitespace-nowrap bg-white text-center border border-gray-200 shadow-lg rounded-md px-2 py-1 text-xs flex items-center space-x-1'>
              <ClipboardCheckIcon className='h-4 w-4 text-green-700' />
              <span>Copied to clipboard</span>
            </div>
          </div>
        </div>
      </button>
    </CopyToClipboard >
  )
}