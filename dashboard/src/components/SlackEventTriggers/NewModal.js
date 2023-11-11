import Dropdown from '@/components/utils/Dropdown'
import Modal from '@/components/utils/Modal'
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react'

export default function NewSlackEventTriggerModal({ isOpen, onClose }) {
  const [selectedEvent, setSelectedEvent] = useState();
  const [selectedSlackChannel, setSelectedSlackChannel] = useState();
  const [slackChannels, setSlackChannels] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();

  const saveTrigger = async () => {
    SwishjamAPI.EventTriggers.create({
      event_name: selectedEvent,
      steps: [{
        type: 'EventTriggerSteps::Slack',
        config: { channel: selectedSlackChannel }
      }]
    })
  }

  useEffect(() => {
    SwishjamAPI.Slack.getChannels().then(setSlackChannels);
    SwishjamAPI.Events.listUnique().then(setUniqueEvents);
  }, [])

  console.log(slackChannels);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title='New Slack Trigger'>
      <form onSubmit={saveTrigger}>
        <div className='flex text-sm text-gray-700 items-center'>
          When the
          <div className='mx-1'><Dropdown label='event' options={uniqueEvents} onSelect={setSelectedEvent} /></div>
          event is triggered, send a message to the
          <div className='mx-1'><Dropdown label='Slack Channel' options={slackChannels} onSelect={setSelectedSlackChannel} /></div>
        </div>
        <div className='w-full flex justify-end mt-4'>
          <button
            type='submit'
            className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}