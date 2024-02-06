'use client'

import { useEffect, useState } from 'react';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { LuPlus, LuTrash } from "react-icons/lu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import Link from 'next/link';
import LoadingSpinner from '@components/LoadingSpinner';
import { toast } from 'sonner'
import SlackMessagePreview from '@components/Slack/SlackMessagePreview';
import MessageBodyMarkdownRenderer from '@components/Slack/MessageBodyMarkdownRenderer';
import { swishjam } from '@swishjam/react';
import { useRouter } from 'next/navigation';
import { Tooltipable } from '@/components/ui/tooltip';
import { ArrowLeftIcon, InfoIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import TestTriggerModal from '@/components/EventTriggers/TestTriggerModal';

export default function EditSlackTriggerPage({ eventTrigger }) {
  const form = useForm({ defaultValues: { header: '✨ Event Name' } });
  const router = useRouter();

  const [conditionalStatements, setConditionalStatements] = useState();
  const [selectedEventName, setSelectedEventName] = useState();
  const [slackMessageHeader, setSlackMessageHeader] = useState();
  const [slackMessageBody, setSlackMessageBody] = useState();
  const [selectedSlackChannelId, setSelectedSlackChannelId] = useState();
  const [loading, setLoading] = useState(false);
  const [slackChannels, setSlackChannels] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const [testTriggerModalIsOpen, setTestTriggerModalIsOpen] = useState(false);

  const getAndSetSlackChannelOptions = async () => {
    SwishjamAPI.Slack.getChannels().then(channels => {
      const sortedChannels = channels?.sort((a, b) => {
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
  }

  const getAndSetEventOptions = async () => {
    SwishjamAPI.Events.listUnique().then(events => {
      const sortedEvents = events.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        } else {
          return 0;
        }
      })
      setUniqueEvents(sortedEvents);
    });
  }

  useEffect(() => {
    setSelectedEventName(eventTrigger.event_name)
    setSelectedSlackChannelId(eventTrigger.steps[0].config.channel_id)
    setSlackMessageHeader(eventTrigger.steps[0].config.message_header)
    setSlackMessageBody(eventTrigger.steps[0].config.message_body)
    setConditionalStatements(eventTrigger.conditional_statements)
    getAndSetSlackChannelOptions();
    getAndSetEventOptions();
    SwishjamAPI.Events.Properties.listUnique(eventTrigger.event_name).then(setPropertyOptionsForSelectedEvent);
  }, [eventTrigger])

  const setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary = async eventName => {
    setSlackMessageHeader('✨ ' + eventName + ' ✨')
    setConditionalStatements([])
    SwishjamAPI.Events.Properties.listUnique(eventName).then(properties => {
      setPropertyOptionsForSelectedEvent(properties);
      // we re-set this every time they change the event..?
      let formattedPropertyOptions = '';
      properties.forEach(property => formattedPropertyOptions += `- ${property}: {${property}}  \n`)
      setSlackMessageBody(`The _${eventName}_ event has the following properties: \n${formattedPropertyOptions}`)
    });
  }

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true)

    let errMessage = '';
    if (!selectedEventName) errMessage += 'Please select an event. '
    if (!selectedSlackChannelId) errMessage += 'Please select a Slack channel. '
    if (!slackMessageHeader || !slackMessageBody) errMessage += 'Please enter a message header or body. '
    conditionalStatements.forEach((statement, index) => {
      if (!statement.property || !statement.condition || (!statement.property_value && statement.condition !== 'is_defined')) {
        errMessage += `Please fill in all fields for condition #${index + 1}. `
      }
    })
    if (errMessage !== '') {
      toast.error("Please fill in the required fields.", { description: errMessage })
      setLoading(false);
      return;
    }

    const config = {
      message_header: slackMessageHeader,
      message_body: slackMessageBody,
      channel_id: selectedSlackChannelId,
      channel_name: slackChannels.find(channel => channel.id === selectedSlackChannelId)?.name,
    }
    const { trigger, error } = await SwishjamAPI.EventTriggers.update(id, {
      eventName: selectedEventName,
      conditionalStatements: conditionalStatements,
      steps: [{ type: 'EventTriggerSteps::Slack', config }]
    })

    if (error) {
      setLoading(false);
      toast.error("Uh oh! Something went wrong.", {
        description: error,
      })
    } else {
      swishjam.event('event_trigger_updated', {
        event_name: selectedEventName,
        slack_channel: config.channel_name,
        trigger_id: eventTrigger.id,
        message_header: config.message_header,
      })
      router.push(`/automations/event-triggers?success=${"Event trigger updated successfully."}`);
    }
  }

  if (!selectedEventName || !slackChannels || !uniqueEvents) {
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
            <h1 className="text-lg font-medium text-gray-700 mb-0">Edit Event Trigger</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <Skeleton className='h-32 w-full' />
          </div>
          <div>
            <Skeleton className='h-14 w-full' />
            <Skeleton className='h-32 w-full mt-4' />
            <Skeleton className='h-14 w-full mt-4' />
            <Skeleton className='h-32 w-full mt-4' />
            <Skeleton className='h-14 w-full mt-4' />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      {testTriggerModalIsOpen && (
        <TestTriggerModal
          conditionalStatements={conditionalStatements}
          eventName={selectedEventName}
          isOpen={testTriggerModalIsOpen}
          onClose={() => setTestTriggerModalIsOpen(false)}
          propertyOptions={propertyOptionsForSelectedEvent}
          slackMessageHeader={slackMessageHeader}
          slackMessageBody={slackMessageBody}
          slackChannelName={slackChannels.find(channel => channel.id === selectedSlackChannelId)?.name}
          slackChannelId={selectedSlackChannelId}
        />
      )}
      <div className="grid grid-cols-2 mt-8 items-center">
        <div>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/automations/event-triggers"
          >
            <ArrowLeftIcon className='inline mr-1' size={12} />
            Back to all Event Triggers
          </Link>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Edit Event Trigger</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className='text-sm italic'>Slack Preview</h2>
          <SlackMessagePreview
            header={slackMessageHeader}
            body={<MessageBodyMarkdownRenderer body={slackMessageBody} availableEventOptions={propertyOptionsForSelectedEvent} />}
          />
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4 px-4">
              <FormItem>
                <FormLabel className='flex items-center'>
                  Trigger Event
                  <Tooltipable content="The event which should set off this Event Trigger (pending your trigger conditions are also met).">
                    <InfoIcon className='inline ml-1 text-gray-500' size={16} />
                  </Tooltipable>
                </FormLabel>
                <Select
                  onValueChange={val => {
                    setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary(val);
                    setSelectedEventName(val)
                  }}
                  defaultValue={selectedEventName}
                  disabled={selectedEventName === undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your event" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {uniqueEvents?.map(event => (
                      <SelectItem key={event.name} className="cursor-pointer hover:bg-gray-100" value={event.name}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <div className='mt-4'>
                <FormLabel className='flex items-center'>
                  Trigger Conditions
                  <Tooltipable content="Trigger conditions allow you to specify a set of conditions based on the event properties that must be met in order for this trigger to fire. If the conditions are not met for the event, the trigger will not fire.">
                    <InfoIcon className='inline ml-1 text-gray-500' size={16} />
                  </Tooltipable>
                </FormLabel>

                {conditionalStatements.length == 0 && (
                  <div
                    onClick={() => setConditionalStatements([{}])}
                    className='bg-white px-6 py-6 border-2 border-gray-200 border-dashed mt-2 rounded-md text-center text-gray-400 text-sm cursor-pointer duration-500 transition-all hover:border-swishjam hover:text-swishjam'
                  >
                    <LuPlus size="24" className='mx-auto mb-4' />
                    Add Trigger Condition
                  </div>
                )}
                {conditionalStatements.length > 0 && (
                  <ul className='grid gap-y-2 mt-2'>
                    {conditionalStatements.map((conditionalStatement, index) => {
                      return (
                        <li key={index} className='w-full flex items-center gap-x-2'>
                          <span className='text-sm'>
                            {conditionalStatements.length > 1 && index > 0 ? 'And if' : 'If'}
                          </span>
                          <FormItem>
                            <Select
                              className='flex-grow'
                              disabled={propertyOptionsForSelectedEvent === undefined}
                              onValueChange={val =>
                                setConditionalStatements(
                                  conditionalStatements.map((statement, i) => {
                                    if (i === index) {
                                      statement.property = val
                                    }
                                    return statement;
                                  })
                                )
                              }
                              value={conditionalStatement.property}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={<span className='text-gray-500 italic'>Event Property</span>} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='_header' disabled>
                                  Event Property
                                </SelectItem>
                                {propertyOptionsForSelectedEvent?.map(propertyName => (
                                  <SelectItem className="cursor-pointer hover:bg-gray-100" value={propertyName} key={propertyName}>
                                    {propertyName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                          <FormItem>
                            <Select
                              className='flex-grow'
                              disabled={propertyOptionsForSelectedEvent === undefined}
                              onValueChange={val => {
                                setConditionalStatements(
                                  conditionalStatements.map((statement, i) => {
                                    if (i === index) {
                                      statement.condition = val
                                    }
                                    return statement;
                                  })
                                )
                              }}
                              value={conditionalStatement.condition}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={<span className='text-gray-500 italic mr-2'>Condition</span>} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='_header' disabled>
                                  Condition
                                </SelectItem>
                                {['equals', 'contains', 'does not contain', 'ends with', 'does not end with', 'is defined'].sort().map(condition => (
                                  <SelectItem className="cursor-pointer hover:bg-gray-100" value={condition.replace(/\s/g, '_')} key={condition}>
                                    {condition}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                          {conditionalStatement.condition !== 'is_defined' && (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Your property value"
                                  disabled={propertyOptionsForSelectedEvent === undefined}
                                  onChange={e => {
                                    setConditionalStatements(
                                      conditionalStatements.map((statement, i) => {
                                        if (i === index) {
                                          statement.property_value = e.target.value
                                        }
                                        return statement;
                                      })
                                    )
                                  }}
                                  value={conditionalStatement.property_value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                          <Button
                            onClick={() => setConditionalStatements(conditionalStatements.filter((statement, i) => i !== index))}
                            type='button'
                            variant="ghost"
                            className='flex-none ml-2 duration-500 hover:text-rose-600'
                          >
                            <LuTrash size={14} />
                          </Button>
                        </li>
                      )
                    })}
                    <li key="add-more-button">
                      <Button
                        onClick={() => setConditionalStatements([...conditionalStatements, {}])}
                        type='button'
                        variant="outline"
                        className='!mt-2 w-full'
                      >
                        Add Condition
                      </Button>
                    </li>
                  </ul>
                )}
              </div>

              <FormItem>
                <FormLabel>Header</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="off"
                    value={slackMessageHeader}
                    onChange={e => setSlackMessageHeader(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel className='flex items-center'>
                  Body
                  <Tooltipable
                    content={
                      <>
                        Within the body of the Slack message you can use markdown syntax, as well as reference event properties by wrapping the property in {"{}"} (ie: if you want to include the `url` property in the body of the message, you can reference it as <span className='bg-gray-200 italic text-emerald-400 px-1 py-0.5 rounded-md'>{'{url}'}</span>).
                      </>
                    }
                  >
                    <InfoIcon className='inline ml-1 text-gray-500' size={16} />
                  </Tooltipable>
                </FormLabel>
                <FormControl>
                  <Textarea
                    value={slackMessageBody}
                    onChange={e => setSlackMessageBody(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Slack Channel</FormLabel>
                <Select
                  onValueChange={e => setSelectedSlackChannelId(e)}
                  defaultValue={selectedSlackChannelId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your slack channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {slackChannels && slackChannels.map(c => {
                      return (
                        <SelectItem
                          key={c.id}
                          className="cursor-pointer hover:bg-gray-100"
                          value={c.id}
                        >
                          #{c.name}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <div className='flex gap-x-2'>
                <button
                  type="button"
                  className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 bg-white hover:bg-gray-200`}
                  disabled={loading || !selectedEventName || !selectedSlackChannelId || (!slackMessageHeader && !slackMessageBody)}
                  onClick={() => setTestTriggerModalIsOpen(true)}
                >
                  <PaperAirplaneIcon className='w-4 h-4 inline mr-2' />
                  Test Your Trigger
                </button>
                <Button
                  className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner color="white" /> : 'Update Trigger'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main >
  )
}
