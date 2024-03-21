import { ClipboardCheckIcon, CopyIcon } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react"

export default function CopiableText({ value, children, displayMessageFor = 3_500, pressEffect = true, includeIcon = false, ...props }) {
  const [showCopiedState, setShowCopiedState] = useState(false);
  return (
    <CopyToClipboard
      text={value}
      onCopy={() => {
        setShowCopiedState(true)
        setTimeout(() => setShowCopiedState(false), displayMessageFor);
      }}
    >
      <button {...props} className={`group cursor-pointer w-fit inline-flex items-center justify-center px-1 rounded ${pressEffect ? `transform transition-transform duration-150 active:scale-[95%]` : ''} ${props.className || ''}`}>
        <div className='relative w-fit inline-flex items-center space-x-2'>
          {children ?? <><span>{value}</span> <CopyIcon className={`h-4 w-4 transition-colors text-gray-700 group-hover:text-gray-900 group-hover:bg-gray-50 group-active:text-gray-900 group-active:bg-gray-50 ${props.copyIconClassName}`} /></>}
          {children && includeIcon && <CopyIcon className={`h-4 w-4 transition-colors text-gray-700 group-hover:text-gray-900 group-hover:bg-gray-50 group-active:text-gray-900 group-active:bg-gray-50 ${props.copyIconClassName}`} />}
          <div className={`${showCopiedState ? 'opacity-100 translate-y-[-125%] z-100' : 'opacity-0 translate-y-0 -z-10'} transition-all transform absolute top-0 flex items-center justify-center w-0 left-[50%]`}>
            <div className='font-normal whitespace-nowrap bg-white text-center border border-gray-200 shadow-lg rounded-md px-2 py-1 text-xs flex items-center space-x-1'>
              <ClipboardCheckIcon className='h-4 w-4 text-green-700' />
              <span className='text-gray-700'>Copied to clipboard</span>
            </div>
          </div>
        </div>
      </button>
    </CopyToClipboard >
  )
}