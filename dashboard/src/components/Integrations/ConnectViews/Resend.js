import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowTopRightOnSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import CopiableSnippet from "./CopiableSnippet";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RocketIcon } from "@radix-ui/react-icons"
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from 'react'
import useAuthData from "@/hooks/useAuthData";

export default function ResendConnectView({ onNewIntegration }) {
  const { currentWorkspaceId } = useAuthData();

  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [signingSecret, setSigningSecret] = useState();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const createIntegration = async e => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage()
    const { integration, error } = await SwishjamAPI.Integrations.create({ type: 'Integrations::Resend', enabled: true, config: { webhook_signing_secret: signingSecret } })
    setIsLoading(false);
    if (error) {
      setErrorMessage(error);
    } else {
      setShowSuccessMessage(true);
      onNewIntegration({ name: 'Resend', ...integration })
    }
  }

  const steps = [
    <>
      Navigate to the{' '}
      <Link
        className='underline text-blue-700 hover:text-blue-900 inline-flex items-center'
        href='https://resend.com/webhooks'
        target='_blank'
      >
        Webhooks page <ArrowTopRightOnSquareIcon className='inline-block h-3 w-3 ml-1' />
      </Link> in your Resend dashboard.
    </>,
    <div className='flex items-center'>
      Click the
      <span className='inline-flex items-center bg-white px-2 py-1 border border-black rounded text-black mx-1 cursor-default'>
        <PlusIcon className='h-4 w-4 mr-1 inline-block text-black' />
        Add Webhook
      </span>
      button.
    </div>,
    <>
      Paste this URL into the endpoint field:{' '}
      <CopiableSnippet value={`https://capture.swishjam.com/api/v1/webhooks/resend/${currentWorkspaceId}`} />
    </>,
    <>Select the Resend events you would like Swishjam to capture and click <span className='inline-flex items-center bg-white px-2 py-1 border border-black rounded text-black mx-1 cursor-default'>Add</span>.</>,
    <>
      Paste the <span className='italic'>Signing Secret</span> from the newly created webhook details page and submit this form!
      <form onSubmit={createIntegration} className='flex items-center mt-4'>
        <input
          className='input'
          onChange={e => setSigningSecret(e.target.value)}
          placeholder='Resend Signing Secret'
        />
        <button
          type="submit"
          className={`whitespace-nowrap ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner color='white' /> : <>Complete connection</>}
        </button>
      </form>
      {errorMessage && <p className='text-red-600 text-center mt-2'>{errorMessage}</p>}
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
                  <div className="relative flex space-x-3">
                    <div>
                      <span className='h-8 w-8 rounded-full flex items-center justify-center bg-gray-200'>
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-700">
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )
  )
}