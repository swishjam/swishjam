'use client'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Link from "next/link"
import EmptyState from "src/app/(authenticated)/automations/EmptyState";
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@components/LoadingSpinner';
import MessageBodyMarkdownRenderer from '@components/Slack/MessageBodyMarkdownRenderer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from '@/components/ui/skeleton';
import SlackMessagePreview from '@components/Slack/SlackMessagePreview';
import { swishjam } from '@swishjam/react';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { toast } from 'sonner'
import { Textarea } from "@/components/ui/textarea"
import { Tooltipable } from '@/components/ui/tooltip';
import TestTriggerModal from '@/components/Automations/EventTriggers/TestTriggerModal';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from "react-hook-form"
import { useRouter } from 'next/navigation';
import { InfoIcon } from 'lucide-react';
import { LuPlus, LuTrash } from "react-icons/lu";
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

const FormInputOrLoadingState = ({ children, className, isLoading }) => {
  if (isLoading) {
    return <Skeleton className={`h-10 w-full ${className || ''}`} />
  } else {
    return children;
  }
}

export default function AddEditSlackEventTrigger({
  onSave,
  className,
  triggerId,
  defaultTriggerValues = {
    header: '✨ Event Name'
  }
}) {
  const form = useForm({ defaultValues: defaultTriggerValues });
  const conditionalStatementsFieldArray = useFieldArray({ control: form.control, name: "conditional_statements" });
  const router = useRouter();

  const [isFormSaving, setIsFormSaving] = useState();
  const [slackChannels, setSlackChannels] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const [testTriggerModalIsOpen, setTestTriggerModalIsOpen] = useState(false);

  const setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary = async eventName => {
    form.setValue('steps.0.config.message_header', '✨ ' + eventName + ' ✨')
    conditionalStatementsFieldArray.fields.forEach((field, index) => {
      // only remove conditional statements that are non-empty
      if (field.property || field.condition || field.property_value) {
        conditionalStatementsFieldArray.remove(index)
      }
    })
    SwishjamAPI.Events.Properties.listUnique(eventName).then(properties => {
      setPropertyOptionsForSelectedEvent(properties);
      // we re-set this every time they change the event..?
      let formattedPropertyOptions = '';
      properties.forEach(property => formattedPropertyOptions += `- ${property}: {${property}}  \n`)
      form.setValue('steps.0.config.message_body', `The _${eventName}_ event has the following properties: \n${formattedPropertyOptions}`);
    });
  }

  async function onSubmit(values) {
    setIsFormSaving(true)
    const isValid = values.event_name && values.slack_channel && (values.header || values.body)
    if (!isValid) {
      Object.keys(values).forEach(key => {
        if (!values[key]) {
          if ((key === 'header' || key === 'body') && !values.header && !values.body) {
            form.setError(key, { message: 'You must provide either a header or a body value for your slack message.' })
          } else if (key !== 'header' && key !== 'body') {
            form.setError(key, { message: `${key[0].toUpperCase() + key.slice(1).replace('_', ' ')} is a required field.` })
          }
        }
      })
      if (values.conditionalStatements.length > 0) {
        values.conditionalStatements.forEach((statement, index) => {
          if (!statement.property || !statement.condition || !statement.property_value) {
            if (!statement.property) {
              form.setError(`conditional_statements.${index}.property`, { message: 'Property is a required field.' })
            }
            if (!statement.condition) {
              form.setError(`conditional_statements.${index}.condition`, { message: 'Condition is a required field.' })
            }
            if (!statement.property_value) {
              form.setError(`conditional_statements.${index}.property_value`, { message: 'Property Value is a required field.' })
            }
          }
        })
      }
      setIsFormSaving(false);
      return;
    }

    // const config = {
    //   message_header: values.header,
    //   message_body: values.body,
    //   channel_id: values.slack_channel,
    //   channel_name: slackChannels.find(channel => channel.id === values.slack_channel)?.name,
    // }
      
    const onSuccess = (trigger) => {
      setIsFormSaving(false);
      swishjam.event(`slack_event_trigger_${triggerId ? 'edited' : 'created'}`, {
        event_name: values.event_name,
        slack_channel: config.channel_name,
        trigger_id: trigger.id,
        message_header: config.message_header,
      })
      toast.success(`${triggerId ? 'edited successfully' : 'Trigger created. Redirecting to all event triggers'} `)
      if(!triggerId) { 
        router.push(`/automations/event-triggers?success=${"Your new Slack event trigger was created successfully."}`);
      }
    }
      
    const onError = (error) => {
      setIsFormSaving(false);
      toast.error("uh oh! Something went wrong.", {
        description: error,
      })
    }

    // {
    //   eventName: values.event_name,
    //   conditionalStatements: values.conditionalStatements,
    //   steps: [{ type: 'EventTriggerSteps::Slack', config }]
    // }
    onSave(values, onSuccess, onError)
  }

  useEffect(() => {
    try {
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
    } catch(e) {
      console.log(e)
    }
  }, [])

  if(!slackChannels && slackChannels?.length == 0 && !uniqueEvents && uniqueEvents?.length == 0) {
    return <EmptyState title={<><Link className='text-blue-700 underline' href='/integrations/destinations'>Connect Slack</Link> to begin creating Slack triggers.</>} />
  }
  return (
    <main>
      {testTriggerModalIsOpen && (
        <TestTriggerModal
          conditionalStatements={form.watch('conditional_statements')}
          eventName={form.watch('event_name')}
          isOpen={testTriggerModalIsOpen}
          onClose={() => setTestTriggerModalIsOpen(false)}
          propertyOptions={propertyOptionsForSelectedEvent}
          slackMessageHeader={form.watch('steps.0.config.message_header')}
          slackMessageBody={form.watch('steps.0.config.message_body')}
          slackChannelName={slackChannels.find(channel => channel.id === form.watch('steps.0.config.channel_id'))?.name}
          slackChannelId={form.watch('steps.0.config.channel_id')}
        />
      )}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <SlackMessagePreview
            header={form.watch('steps.0.config.message_header')}
            body={<MessageBodyMarkdownRenderer body={form.watch('steps.0.config.message_body')} availableEventOptions={propertyOptionsForSelectedEvent} />}
          />
          <h2 className="text-sm font-medium text-gray-700 mb-2 mt-4">Slack Formatting Reference</h2>
          <div className="border border-zinc-200 shadow-sm bg-white rounded-md p-4">

            <p className="text-sm font-medium">Links</p>
            <p className="text-sm mt-1">
              Format:
              <span className="ml-1 text-sm px-1.5 py-0.5 border border-zinc-200 bg-accent rounded-sm">{"<{your link}|Displayed text>"}</span>
            </p>
            <p className="text-sm py-1.5">
              Example:
              <span className="ml-1 text-sm px-1.5 py-0.5 border border-zinc-200 bg-accent rounded-sm">{"<https://swishjam.com/integrations|Integrations>"}</span>
            </p>
            <p className="text-sm">
              Result:
              <a className="ml-1 underline hover:text-blue-400" href="https://swishjam.com/integrations">Integrations</a>
            </p>
          </div> 
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="event_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center'>
                      Trigger Event
                      <Tooltipable content="The event which should set off this Event Trigger (pending your trigger conditions are also met).">
                        <InfoIcon className='inline ml-1 text-gray-500' size={16} />
                      </Tooltipable>
                    </FormLabel>
                    <FormInputOrLoadingState isLoading={uniqueEvents === undefined || slackChannels === undefined}>
                      <Select
                        onValueChange={(e) => { setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary(e); field.onChange(e) }}
                        defaultValue={field.value}
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
                    </FormInputOrLoadingState>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='mt-4'>
                <FormLabel className='flex items-center'>
                  Trigger Conditions
                  <Tooltipable content="Trigger conditions allow you to specify a set of conditions based on the event properties that must be met in order for this trigger to fire. If the conditions are not met for the event, the trigger will not fire.">
                    <InfoIcon className='inline ml-1 text-gray-500' size={16} />
                  </Tooltipable>
                </FormLabel>

                <FormInputOrLoadingState className='h-24 mt-2' isLoading={uniqueEvents === undefined || slackChannels === undefined}>
                  {conditionalStatementsFieldArray.fields.length == 0 && (
                    <div
                      onClick={() => conditionalStatementsFieldArray.append()}
                      className='bg-white px-6 py-6 border-2 border-gray-200 border-dashed mt-2 rounded-md text-center text-gray-400 text-sm cursor-pointer duration-500 transition-all hover:border-swishjam hover:text-swishjam'
                    >
                      <LuPlus size="24" className='mx-auto mb-4' />
                      New Trigger Condition
                    </div>
                  )}
                  {conditionalStatementsFieldArray.fields.length > 0 && (
                    <ul className='grid gap-y-2 mt-2'>
                      {conditionalStatementsFieldArray.fields.map((field, index) => {
                        return (
                          <li key={index} className='w-full flex items-center gap-x-2'>
                            <span className='text-sm'>
                              {conditionalStatementsFieldArray.fields.length > 1 && index > 0 ? 'And if' : 'If'}
                            </span>
                            <FormField
                              control={field.control}
                              name={`conditional_statements.${index}.property`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    className='flex-grow'
                                    disabled={propertyOptionsForSelectedEvent === undefined}
                                    onValueChange={field.onChange}
                                    value={field.value}
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
                              )}
                            />
                            <FormField
                              control={field.control}
                              name={`conditional_statements.${index}.condition`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    className='flex-grow'
                                    disabled={propertyOptionsForSelectedEvent === undefined}
                                    onValueChange={field.onChange}
                                    value={field.value}
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
                              )}
                            />
                            {form.watch(`conditional_statements.${index}.condition`) !== 'is_defined' && (
                              <FormField
                                control={form.control}
                                name={`conditional_statements.${index}.property_value`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        placeholder="Your property value"
                                        disabled={propertyOptionsForSelectedEvent === undefined}
                                        {...form.register(`conditional_statements.${index}.property_value`)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                            <Button
                              onClick={() => conditionalStatementsFieldArray.remove(index)}
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
                          onClick={() => conditionalStatementsFieldArray.append()}
                          type='button'
                          variant="outline"
                          className='!mt-2 w-full'
                        >
                          Add Condition
                        </Button>
                      </li>
                    </ul>
                  )}
                </FormInputOrLoadingState>
              </div>

              <FormField
                control={form.control}
                name="steps.0.config.message_header"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header</FormLabel>
                    <FormControl>
                      <FormInputOrLoadingState isLoading={uniqueEvents === undefined || slackChannels === undefined}>
                        <Input
                          type="search"
                          placeholder="✨ Event Name"
                          autoComplete="off"
                          {...form.register("steps.0.config.message_header")}
                        />
                      </FormInputOrLoadingState>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="steps.0.config.message_body"
                render={({ field }) => (
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
                      <FormInputOrLoadingState isLoading={uniqueEvents === undefined || slackChannels === undefined}>
                        <Textarea {...form.register("steps.0.config.message_body")} />
                      </FormInputOrLoadingState>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="steps.0.config.channel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slack Channel</FormLabel>
                    <FormInputOrLoadingState isLoading={uniqueEvents === undefined || slackChannels === undefined}>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your slack channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {slackChannels && slackChannels.map(c => <SelectItem key={c.id} className="cursor-pointer hover:bg-gray-100" value={c.id}>#{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormInputOrLoadingState>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex gap-x-2'>
                {!form.watch('event_name') || !form.watch('steps.0.config.channel_id') || (!form.watch('steps.0.config.message_header') && !form.watch('steps.0.config.message_body'))
                  ? (
                    <Tooltipable content="You must select an event, a slack channel, and provide either a header or a body value for your slack message before you can test your trigger.">
                      <button
                        type="button"
                        className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 bg-gray-200 cursor-not-allowed`}
                        disabled={true}
                      >
                        <PaperAirplaneIcon className='w-4 h-4 inline mr-2' />
                        Test Your Trigger
                      </button>
                    </Tooltipable>
                  ) : (
                    <button
                      type="button"
                      className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 bg-white hover:bg-gray-200`}
                      disabled={isFormSaving || uniqueEvents === undefined || slackChannels === undefined}
                      onClick={() => setTestTriggerModalIsOpen(true)}
                    >
                      <PaperAirplaneIcon className='w-4 h-4 inline mr-2' />
                      Test Your Trigger
                    </button>
                  )}
                <Button
                  className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isFormSaving ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
                  type="submit"
                  disabled={isFormSaving || uniqueEvents === undefined || slackChannels === undefined}
                >
                  {isFormSaving ? <LoadingSpinner color="white" /> : 'Create Trigger'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  )
}