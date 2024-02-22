import { CheckCircleIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react"

export default function CopiableText({ value, children }) {
  const [showCopiedState, setShowCopiedState] = useState(false);
  return (
    <CopyToClipboard
      text={value}
      onCopy={() => {
        setShowCopiedState(true)
        setTimeout(() => setShowCopiedState(false), 5_000);
      }}
    >
      <div className='relative cursor-pointer w-fit inline-block'>
        {children}
        <div className={`${showCopiedState ? 'opacity-100 translate-y-[-110%] z-10' : 'opacity-0 translate-y-0 -z-10'} transition-all transform w-44 text-center absolute top-0 right-0 left-0 mx-auto bg-white border border-gray-300 rounded-md p-1 shadow-md text-xs`}>
          <CheckCircleIcon className='inline h-4 w-4 text-green-700' /> Copied to clipboard
        </div>
      </div>
    </CopyToClipboard >
  )
}