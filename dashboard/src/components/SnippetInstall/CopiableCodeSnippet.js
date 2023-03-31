import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function CopiableCodeSnippet({ snippet, copyContent, className = 'bg-slate-700 text-slate-100', copyPos = 'absolute' }) {
  const [copyBtnTxt, setcopyBtnTxt] = useState('Copy');

  return (
    <div className={`${copyPos==='absolute' ? 'pr-24':''} relative rounded-xl p-4 break-all font-medium text-sm flex items-center justify-between ${className}`}>
      {snippet}
      <CopyToClipboard
        text={copyContent}
        className={`${copyPos==='absolute' ? 'absolute top-2 right-2':''} px-2.5 py-0.5 ml-8 text-slate-900 !border rounded-lg bg-white inline-flex items-center gap-x-1.5 cursor-pointer hover:text-swishjam`}
        >
        <button onClick={() => { setcopyBtnTxt('Copied!'); setTimeout(() => setcopyBtnTxt('Copy'), 2000) }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="-ml-0.5 w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          {copyBtnTxt}
        </button>
      </CopyToClipboard>
    </div>
  )
}