import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowTopRightOnSquareIcon, ClipboardDocumentIcon, CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import CopyToClipboard from "react-copy-to-clipboard";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RocketIcon } from "@radix-ui/react-icons"
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from 'react'
import useAuthData from "@/hooks/useAuthData";
import CopiableSnippet from "./CopiableSnippet";

export default function CalComConnectView({ onNewConnection }) {
  const { currentWorkspaceId } = useAuthData();

  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showCopiedState, setShowCopiedState] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const signingSecret = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const createIntegration = async e => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage()
    const { integration, error } = await SwishjamAPI.Integrations.create({ type: 'Integrations::CalCom', enabled: true, config: { signing_secret: signingSecret } })
    setIsLoading(false);
    if (error) {
      setErrorMessage(error);
    } else {
      setShowSuccessMessage(true);
      onNewConnection({ name: 'Cal.com', ...integration })
    }
  }

  const steps = [
    <>
      Navigate to the{' '}
      <Link
        className='underline text-blue-700 hover:text-blue-900 inline-flex items-center'
        href='https://app.cal.com/settings/developer/webhooks/new'
        target='_blank'
      >
        new Webhook page <ArrowTopRightOnSquareIcon className='inline-block h-3 w-3 ml-1' />
      </Link> in your Cal.com settings.
    </>,
    <>
      Paste this URL into the <span className='italic'>Subscriber URL</span> field:{' '}
      <CopiableSnippet value={`https://capture.swishjam.com/api/v1/webhooks/cal_com/${currentWorkspaceId}`} />
    </>,
    <>Add/remove the Cal.com events you would like Swishjam to capture in the <span className='italic'>Event Triggers</span> section.</>,
    <>
      Paste this <span className='italic'>Signing Secret</span> into the <span className='italic'>Secret</span> field:{' '}
      <CopiableSnippet value={signingSecret} />
    </>,
    <>
      Click the <span className='italic'>Create Webhook</span> button to save your changes.
    </>,
  ]

  return (
    showSuccessMessage
      ? (
        <Alert>
          <div className='flex items-center gap-x-4'>
            <RocketIcon className="h-5 w-5" />
            <div>
              <AlertTitle>Connection added!</AlertTitle>
              <AlertDescription>
                Swishjam will now automatically capture your Resend email events.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ) : (
        <div className="flow-root">
          <ul role="list">
            {steps.map((step, i) => (
              <li key={i}>
                <div className="relative pb-8">
                  {i !== steps.length - 1
                    ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    : null
                  }
                  <div className="relative flex items-center space-x-3">
                    <div>
                      <span className='h-8 w-8 rounded-full flex items-center justify-center bg-gray-200'>
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div className="text-sm text-gray-700">
                        {step}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={createIntegration}
            className={`w-full whitespace-nowrap ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner color='white' /> : <>Complete connection</>}
          </button>
        </div>
      )
  )
}