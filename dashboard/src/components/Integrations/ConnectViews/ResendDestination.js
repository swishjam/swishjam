import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowTopRightOnSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RocketIcon } from "@radix-ui/react-icons";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from "react";

export default function ResendDestination({ onNewIntegration }) {
  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [resendApiKey, setResendApiKey] = useState();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const createIntegration = async e => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage()
    const { integration, error } = await SwishjamAPI.Integrations.create({ type: 'Integrations::Destinations::Resend', enabled: true, config: { api_key: resendApiKey } })
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
        href='https://resend.com/api-keys'
        target='_blank'
      >
        API Keys page <ArrowTopRightOnSquareIcon className='inline-block h-3 w-3 ml-1' />
      </Link> in your Resend dashboard.
    </>,
    <div className='flex items-center'>
      Click the
      <span className='inline-flex items-center bg-white px-2 py-1 border border-black rounded text-black mx-1 cursor-default'>
        <PlusIcon className='h-4 w-4 mr-1 inline-block text-black' />
        Create API Key
      </span>
      button.
    </div>,
    <>Input a name, select the <span className='bg-gray-200 rounded italic px-1 py-0.5'>Sending access</span> permission, and select the domains you would like to send emails from with Swishjam.</>,
    <div className='w-full'>
      Paste your new <span className='italic'>API Key</span> below and submit.
      <form onSubmit={createIntegration} className='mt-4'>
        <Input
          className='input'
          onChange={e => setResendApiKey(e.target.value)}
          placeholder='Resend API Key'
        />
        <Button
          type="submit"
          className={`whitespace-nowrap w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner color='white' /> : <>Create destination</>}
        </Button>
      </form>
      {errorMessage && <p className='text-red-600 text-center mt-2'>{errorMessage}</p>}
    </div>,
  ]

  return (
    showSuccessMessage
      ? (
        <Alert>
          <AlertTitle className='flex items-center gap-x-1'>
            <RocketIcon className="h-4 w-4 inline" /> Success
          </AlertTitle>
          <AlertDescription>
            Your Resend destination has been created. You can now start sending emails in response to specified events in the <Link className='underline text-blue-600 hover:text-blue-700' href='/automations/event-triggers'>Event Triggers view</Link> of your Swishjam instance.
          </AlertDescription>
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
                    <div className="flex min-w-0 w-full flex-1 justify-between space-x-4 pt-1.5 text-sm text-gray-700">
                      <div className="w-full">
                        {step}
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