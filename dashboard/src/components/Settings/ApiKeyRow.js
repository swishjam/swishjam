import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const CopiableKey = ({ value, displayValue }) => {
  const [showCopySuccessText, setShowCopySuccessText] = useState(false);
  return (
    <div className='flex items-center'>
      <div className='italic cursor-pointer flex items-center hover:text-gray-700 transition w-fit'>
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <CopyToClipboard
              text={value}
              onCopy={() => {
                setShowCopySuccessText(true);
                setTimeout(() => {
                  setShowCopySuccessText(false);
                }, 3_000);
              }}
            >
              <TooltipTrigger asChild>
                <span>{displayValue || value}</span>
              </TooltipTrigger>
            </CopyToClipboard>
            <TooltipContent>
              Click to copy.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {showCopySuccessText
        ? (
          <span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <ClipboardDocumentCheckIcon className='w-4 h-4' />
          </span>
        ) : (
          <span className="ml-2 inline-flex px-2 py-1">
            <span className='w-4 h-4' />
          </span>
        )
      }
    </div>
  )
}

export default function ApiKeyRow({ apiKey }) {
  const parts = apiKey.private_key.split('-');
  const lastPart = parts[parts.length - 1];
  const redactedLastPart = '*'.repeat(lastPart.length - 4) + lastPart.substr(-4);
  const redactedPrivateKey = parts.slice(0, parts.length - 1).join('-') + '-' + redactedLastPart;
  return (
    <tr key={apiKey.id} className="group hover:bg-gray-50 duration-300 transition cursor-default">
      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{apiKey.data_source == 'marketing' ? 'web' : apiKey.data_source}</td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
        <CopiableKey value={apiKey.public_key} />
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
        <CopiableKey value={apiKey.private_key} displayValue={redactedPrivateKey} />
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
        {apiKey.enabled
          ? <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Enabled</span>
          : <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Disabled</span>
        }
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{new Date(apiKey.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
    </tr>
  )
}