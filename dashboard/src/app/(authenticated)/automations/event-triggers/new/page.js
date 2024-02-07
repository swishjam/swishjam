'use client'

import Link from 'next/link';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useSearchParams } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import AddEditSlackEventTrigger from '@/components/Automations/EventTriggers/AddEditSlackEventTrigger';
import ResendEmailView from "@/components/EventTriggers/ResendEmailView";

export default function NewEventTrigger() {
  const searchParams = useSearchParams();
 
  async function onSubmit(triggerValue, onSuccess = () => {}, onError = () => {}) {
    const { trigger, error } = await SwishjamAPI.EventTriggers.create(triggerValue)
    if (error) {
      onError(error)
      return
    } else {
      onSuccess(trigger)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-2 mt-8 items-center">
        <div>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/automations/event-triggers"
          >
            <ArrowLeftIcon className='inline mr-1' size={12} />
            Back to all Event Triggers
          </Link>
          <h1 className="text-lg font-medium text-gray-700 mb-0">New Event Trigger</h1>
        </div>
      </div>
      {searchParams.get('type') == 'Slack' && (
        <AddEditSlackEventTrigger
          onEventTriggerCreated={onSubmit}
        />
      )}
      {searchParams.get('type') == 'ResendEmail' && (
        <ResendEmailView onSubmit={onSubmit} />
      )}
    </main>
  )
}