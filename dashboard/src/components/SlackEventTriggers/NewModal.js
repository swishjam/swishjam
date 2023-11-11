import Dropdown from '@/components/utils/Dropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/utils/Modal';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import SlackMessagePreview from './SlackMessagePreview';

export default function NewSlackEventTriggerModal({ isOpen, onClose }) {
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const [selectedEvent, setSelectedEvent] = useState();
  const [selectedSlackChannel, setSelectedSlackChannel] = useState();
  const [slackChannels, setSlackChannels] = useState();
  const [slackMessageBody, setSlackMessageBody] = useState();
  const [slackMessageHeader, setSlackMessageHeader] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();

  const saveTrigger = async e => {
    e.preventDefault();
    const config = {
      message_header: slackMessageHeader,
      message_body: slackMessageBody,
      channel_id: selectedSlackChannel.id,
      channel_name: selectedSlackChannel.name
    }
    const { error, trigger } = await SwishjamAPI.EventTriggers.create({
      eventName: selectedEvent,
      steps: [{ type: 'EventTriggerSteps::Slack', config }]
    })
  }

  const findSlackChannelByNameAndSetAsSelected = channelName => {
    const channel = slackChannels.find(c => c.name === channelName);
    debugger;
    setSelectedSlackChannel(channel);
  }

  const setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary = async (eventName) => {
    setSelectedEvent(eventName);
    SwishjamAPI.Events.Properties.listUnique(eventName).then(properties => {
      setPropertyOptionsForSelectedEvent(properties);
      if (!slackMessageHeader || slackMessageHeader.length < 1) {
        setSlackMessageHeader(`✨ ${eventName} occurred ✨`);
      }
      if (!slackMessageBody || slackMessageBody.length < 1) {
        setSlackMessageBody(`Property options: ${properties.join(', ')}`);
      }
    });
  }

  useEffect(() => {
    SwishjamAPI.Slack.getChannels().then(channels => {
      const sortedChannels = channels.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        } else {
          return 0;
        }
      })
      setSlackChannels(sortedChannels);
    });
    SwishjamAPI.Events.listUnique().then(setUniqueEvents);
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='New Slack Trigger'>
      <form onSubmit={saveTrigger}>
        <div className='flex text-sm text-gray-700 items-center'>

          <div className="flow-root">
            <ul role="list" className="-mb-8">
              <li>
                <div className="relative pb-8 flex items-center">
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className='h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-200 text-gray-700 text-sm'>
                        1
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <div className="text-sm text-gray-500 flex items-center">
                          When the
                          <div className='mx-1'><Dropdown label='event' options={uniqueEvents} onSelect={setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary} /></div>
                          event is triggered
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className='h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-200 text-gray-700 text-sm'>
                        2
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <div className="text-sm text-gray-500 flex items-center">
                          Send a message to
                          <div className='mx-1'><Dropdown label='Slack Channel' options={slackChannels} onSelect={findSlackChannelByNameAndSetAsSelected} /></div>.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-2'>
          <Label htmlFor='header'>Header</Label>
          <Input
            id='header'
            disabled={!selectedEvent}
            value={slackMessageHeader}
            onChange={e => setSlackMessageHeader(e.target.value)}
          />
        </div>
        <div className='mt-2'>
          <Label htmlFor='body'>Body</Label>
          <Textarea
            id='body'
            disabled={!selectedEvent}
            value={slackMessageBody}
            onChange={e => setSlackMessageBody(e.target.value)}
          />
        </div>
        <SlackMessagePreview header={slackMessageHeader} body={slackMessageBody} className='mt-2' />
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