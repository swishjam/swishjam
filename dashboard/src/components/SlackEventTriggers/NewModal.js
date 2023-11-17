import Dropdown from '@/components/utils/Dropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/utils/Modal';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import SlackMessagePreview from './SlackMessagePreview';
import MessageBodyMarkdownRenderer from './MessageBodyMarkdownRenderer';
import EventTriggerStepsSelectors from './EventTriggerStepsSelectors';
import LoadingSpinner from '../LoadingSpinner';
// import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function NewSlackEventTriggerModal({ isOpen, onClose, onNewTrigger }) {
  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const [selectedEvent, setSelectedEvent] = useState();
  const [selectedSlackChannel, setSelectedSlackChannel] = useState();
  const [slackChannels, setSlackChannels] = useState();
  const [slackMessageBody, setSlackMessageBody] = useState();
  const [slackMessageHeader, setSlackMessageHeader] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();

  const saveTrigger = async e => {
    e.preventDefault();
    if (!selectedEvent) {
      setErrorMessage('Please select an event from the event dropdown.');
      return;
    }
    if (!selectedSlackChannel) {
      setErrorMessage('Please select a Slack channel from the Slack channel dropdown.');
      return;
    }
    setIsLoading(true)
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
    if (error) {
      setIsLoading(false);
      setErrorMessage(error);
    } else {
      onNewTrigger(trigger);
      setSelectedEvent();
      setSelectedSlackChannel();
      setErrorMessage();
      setSlackMessageHeader();
      setSlackMessageBody();
      onClose();
      setTimeout(() => setIsLoading(false), 500);
    }
  }

  const findSlackChannelByNameAndSetAsSelected = channelName => {
    const channel = slackChannels.find(c => c.name === channelName);
    setSelectedSlackChannel(channel);
    setErrorMessage();
  }

  const setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary = async (eventName) => {
    setSelectedEvent(eventName);
    setErrorMessage();
    SwishjamAPI.Events.Properties.listUnique(eventName).then(properties => {
      setPropertyOptionsForSelectedEvent(properties);
      // we re-set this every time they change the event..?
      setSlackMessageHeader(`✨ ${eventName} occurred ✨`);
      let formattedPropertyOptions = '';
      properties.forEach(property => formattedPropertyOptions += `- ${property}: {${property}}  \n`)
      setSlackMessageBody(`The _${eventName}_ event has the following properties: \n${formattedPropertyOptions}`);
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
    SwishjamAPI.Events.listUnique().then(events => {
      const sortedEvents = events.sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) {
          return -1;
        } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        } else {
          return 0;
        }
      })
      setUniqueEvents
    });
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedEvent();
        setSelectedSlackChannel();
        setErrorMessage();
        setSlackMessageHeader();
        setSlackMessageBody();
        onClose();
        setTimeout(() => setIsLoading(false), 500);
      }}
      title='New Slack Trigger'
    >
      <form onSubmit={saveTrigger}>
        <div className='flex text-sm text-gray-700 items-center'>
          <EventTriggerStepsSelectors
            eventOptions={uniqueEvents}
            onSlackChannelSelected={findSlackChannelByNameAndSetAsSelected}
            onEventSelected={setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary}
            slackChannelOptions={slackChannels}
          />
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
        <div className='mt-2'>
          <Label>Message Preview</Label>
          <SlackMessagePreview
            header={slackMessageHeader}
            body={<MessageBodyMarkdownRenderer body={slackMessageBody} availableEventOptions={propertyOptionsForSelectedEvent} />}
          />
        </div>
        {errorMessage && <div className='mt-2 text-red-500 text-sm'>{errorMessage}</div>}
        <div className='w-full flex justify-end mt-4'>
          {/* <button
            className={`${isLoading ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-gray-200 outline outline-gray-200'} ml-2 inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam`}
            onClick={sendTestTrigger}
          >
            <PaperAirplaneIcon className='w-5 h-5 mr-1' />
            Send test message
          </button> */}
          <button
            type='submit'
            className={`${isLoading ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'text-white bg-swishjam hover:bg-swishjam-dark'} ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam`}
          >
            {isLoading ? <LoadingSpinner className='w-5 h-5' /> : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}