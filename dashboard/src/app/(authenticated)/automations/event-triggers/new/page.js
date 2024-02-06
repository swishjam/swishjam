'use client'

import Link from 'next/link';
import { swishjam } from '@swishjam/react';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import AddEditSlackEventTrigger from '@/components/Automations/EventTriggers/AddEditSlackEventTrigger';

export default function NewEventTrigger() {
  const router = useRouter();
  const searchParams = useSearchParams();

  async function onSubmit(triggerValue) {
    const { trigger, error } = await SwishjamAPI.EventTriggers.create(triggerValue)
    if (error) {
      setLoading(false);
      toast.error("Uh oh! Something went wrong.", {
        description: error,
      })
    } else {
      swishjam.event('event_trigger_created', {
        event_name: values.event_name,
        slack_channel: config.channel_name,
        trigger_id: trigger.id,
        message_header: config.message_header,
      })
      router.push(`/automations/event-triggers?success=${"Your new event trigger was created successfully."}`);
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
        <div>Resend Email Form</div>
      )}
    </main>
  )
}