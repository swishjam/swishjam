import { CheckCircleIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react"

export default function CopiableSnippet({ value }) {
  const [showCopiedState, setShowCopiedState] = useState(false);
  return (
    <CopyToClipboard
      text={value}
      onCopy={() => {
        setShowCopiedState(true)
        setTimeout(() => setShowCopiedState(false), 5_000);
      }}
    >
      <span className='cursor-pointer bg-gray-200 mt-2 inline-flex items-center gap-x-2 hover:bg-gray-300 transition-all w-fit rounded-md px-2 py-1'>
        <span className='italic'>{value}</span>
        {showCopiedState
          ? <CheckCircleIcon className='inline h-6 w-6 text-green-700' />
          : <ClipboardDocumentIcon className='inline h-6 w-6' />}
      </span>
    </CopyToClipboard>
  )
}