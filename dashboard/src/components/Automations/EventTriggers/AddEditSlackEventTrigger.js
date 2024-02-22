'use client'

import { AccordionOpen } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button"
import Combobox from "@/components/utils/Combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import EmptyState from "@/components/utils/PageEmptyState";
import { FormInput, InfoIcon, SparkleIcon, UserCircleIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@components/LoadingSpinner';
import Link from "next/link"
import { LuPlus, LuTrash } from "react-icons/lu";
import MessageBodyMarkdownRenderer from '@components/Slack/MessageBodyMarkdownRenderer';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
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
import VariableSyntaxDocumentation from "./VariableSyntaxDocumentation";
import InterpolatedMarkdown from "@/components/VariableParser/InterpolatedMarkdown";

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
    event_name: '',
    conditional_statements: [],
    steps: [{
      type: 'EventTriggerSteps::Slack', config: {
        message_header: '✨ Event Name',
        message_body: '',
        channel_id: '',
        channel_name: ''
      }
    }],
  }
}) {
  const form = useForm({ defaultValues: defaultTriggerValues });
  const conditionalStatementsFieldArray = useFieldArray({ control: form.control, name: "conditional_statements" });
  const router = useRouter();

  const [hasSlackDestination, setHasSlackDestination] = useState();
  const [isFormSaving, setIsFormSaving] = useState();
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const [slackChannels, setSlackChannels] = useState();
  const [testTriggerModalIsOpen, setTestTriggerModalIsOpen] = useState(false);
  const [uniqueEvents, setUniqueEvents] = useState();
  const [uniqueUserProperties, setUniqueUserProperties] = useState();

  const setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary = async eventName => {
    form.setValue('steps.0.config.message_header', '✨ ' + eventName + ' ✨')
    conditionalStatementsFieldArray.fields.forEach((field, index) => {
      // only remove conditional statements that are non-empty
      if (field.property || field.condition || field.property_value) {
        conditionalStatementsFieldArray.remove(index)
      }
    })
    SwishjamAPI.Events.Properties.listUnique(eventName).then(properties => {
      setPropertyOptionsForSelectedEvent(properties.sort());
      // we re-set this every time they change the event..?
      let formattedPropertyOptions = '';
      properties.forEach(property => formattedPropertyOptions += `- ${property}: {${property}}  \n`)
      form.setValue('steps.0.config.message_body', `The _${eventName}_ event has the following properties: \n${formattedPropertyOptions}`);
    });
  }

  async function onSubmit(values) {
    setIsFormSaving(true)
    const isValid = values.event_name && values?.steps[0].config.channel_id && (values?.steps[0].config.message_header || values?.steps[0].config.message_body)
    if (!isValid) {
      Object.keys(values.steps[0].config).forEach(key => {
        if (!values.steps[0].config[key]) {
          if ((key === 'message_header' || key === 'message_body') && !values.steps[0].config.message_header && !values.steps[0].config.message_body) {
            form.setError(key, { message: 'You must provide either a header or a body value for your slack message.' })
          } else if (key !== 'message_header' && key !== 'message_body') {
            form.setError(values.steps[0].config[key], { message: `${key[0].toUpperCase() + key.slice(1).replace('_', ' ')} is a required field.` })
          }
        }
      })
      if (values.conditional_statements.length > 0) {
        values.conditional_statements.forEach((statement, index) => {
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

    const onSuccess = (trigger) => {
      setIsFormSaving(false);
      swishjam.event(`slack_event_trigger_${triggerId ? 'edited' : 'created'}`, {
        event_name: values.event_name,
        slack_channel: values.steps[0].config.channel_name,
        trigger_id: trigger.id,
        message_header: values.steps[0].config.message_header,
      })
      toast.success(`${triggerId ? 'edited successfully' : 'Trigger created. Redirecting to all event triggers'} `)
      if (!triggerId) {
        router.push(`/automations/event-triggers?success=${"Your new Slack event trigger was created successfully."}`);
      }
    }

    const onError = (error) => {
      setIsFormSaving(false);
      toast.error("uh oh! Something went wrong.", {
        description: error,
      })
    }

    values.steps[0].config.channel_name = slackChannels.find(channel => channel.id === values.steps[0].config.channel_id)?.name;
    onSave(values, onSuccess, onError)
  }

  useEffect(() => {
    SwishjamAPI.Slack.getChannels().then(resp => {
      if (resp.error) {
        if (/must connect your slack/i.test(resp.error)) {
          setHasSlackDestination(false);
        } else {
          toast.error("Uh oh! Something went wrong.", {
            description: resp.error,
          })
        }
      } else {
        const sortedChannels = resp.sort((a, b) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          } else {
            return 0;
          }
        })
        setSlackChannels(sortedChannels);
      }
    });

    SwishjamAPI.Events.listUnique({ limit: 100 }).then(events => {
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

    SwishjamAPI.Users.uniqueProperties().then(properties => setUniqueUserProperties(['email', ...properties].sort()))

    if (triggerId) {
      SwishjamAPI.Events.Properties.listUnique(defaultTriggerValues.event_name).then(properties => {
        setPropertyOptionsForSelectedEvent(properties);
      });
    }
  }, [])

  if (hasSlackDestination === false) {
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
          <FormInputOrLoadingState className='h-44' isLoading={uniqueEvents === undefined || slackChannels === undefined}>
            <SlackMessagePreview
              header={form.watch('steps.0.config.message_header')}
              body={
                <InterpolatedMarkdown
                  content={form.watch('steps.0.config.message_body')}
                  availableVariables={propertyOptionsForSelectedEvent || []}
                />
              }
            />
          </FormInputOrLoadingState>
          <div className='mt-2'>
            <AccordionOpen
              trigger={<h2 className="text-sm font-medium text-gray-700">Slack Formatting Reference</h2>}
              open={true}
              rememberState={true}
            >
              <VariableSyntaxDocumentation
                availableEventProperties={propertyOptionsForSelectedEvent}
                availableUserProperties={(uniqueUserProperties || []).map(p => `user.${p}`)}
                eventName={form.watch('event_name')}
                additionalSections={[
                  <>
                    <p className="text-sm font-medium">Hyperlinks</p>
                    <p className="text-sm mt-1">
                      If you'd like to add a link to your text rather than just displaying the URL, you can use the following syntax:
                      <span className="ml-1 text-sm px-1.5 py-0.5 border border-zinc-200 bg-accent rounded-sm transition-colors cursor-default hover:bg-gray-200">
                        {'<https://example.com | Your Text>'}
                      </span>
                    </p>
                  </>
                ]}
              />
            </AccordionOpen>
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
                    <FormLabel className='flex items-center mb-1'>
                      Trigger Event
                      <Tooltipable content="The event which should set off this Event Trigger (pending your trigger conditions are also met).">
                        <InfoIcon className='inline ml-1 text-gray-500' size={16} />
                      </Tooltipable>
                    </FormLabel>
                    <FormInputOrLoadingState isLoading={uniqueEvents === undefined || slackChannels === undefined}>
                      {/* <Combobox
                        minWidth='0'
                        buttonClass='w-full'
                        selectedValue={field.value}
                        onSelectionChange={val => {
                          setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary(val);
                          form.setValue(`event_name`, val)
                        }}
                        options={uniqueEvents?.map(e => e.name)}
                        placeholder={<span className='text-gray-500 italic'>Select your event</span>}
                      /> */}
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
                              {form.watch(`conditional_statements.${index}.property`)?.startsWith('user.') ? ' the user\'s' : ' the event\'s'}
                            </span>
                            <FormField
                              control={field.control}
                              name={`conditional_statements.${index}.property`}
                              render={({ field }) => (
                                <FormItem>
                                  <Combobox
                                    minWidth='0'
                                    selectedValue={field.value}
                                    onSelectionChange={val => form.setValue(`conditional_statements.${index}.property`, val)}
                                    options={[
                                      { type: "title", label: <div className='flex items-center'><SparkleIcon className='h-4 w-4 mr-1' /> Event Properties</div> },
                                      ...(propertyOptionsForSelectedEvent || []).map(p => ({ label: p, value: `event.${p}` })),
                                      { type: "title", label: <div className='flex items-center'><UserCircleIcon className='h-4 w-4 mr-1' /> User Properties</div> },
                                      ...(uniqueUserProperties || []).map(p => ({ label: p, value: `user.${p}` })),
                                    ]}
                                    placeholder={<span className='text-gray-500 italic'>Property</span>}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={field.control}
                              name={`conditional_statements.${index}.condition`}
                              render={({ field }) => (
                                <FormItem>
                                  <Combobox
                                    minWidth='0'
                                    selectedValue={field.value}
                                    onSelectionChange={val => form.setValue(`conditional_statements.${index}.condition`, val)}
                                    options={[
                                      { label: 'equals', value: 'equals' },
                                      { label: 'does not equals', value: 'does_not_equal' },
                                      { label: 'contains', value: 'contains' },
                                      { label: 'does not contain', value: 'does_not_contain' },
                                      { label: 'ends with', value: 'ends_with' },
                                      { label: 'does not end with', value: 'does_not_end_with' },
                                      { label: 'is defined', value: 'is_defined' },
                                      { label: 'is not defined', value: 'is_not_defined' },
                                      { label: 'greater than', value: 'greater_than' },
                                      { label: 'less than', value: 'less_than' },
                                      { label: 'greater than or equal to', value: 'greater_than_or_equal_to' },
                                      { label: 'less than or equal to', value: 'less_than_or_equal_to' },
                                    ]}
                                    placeholder={<span className='text-gray-500 italic'>Operator</span>}
                                  />
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
                                        // disabled={propertyOptionsForSelectedEvent === undefined}
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
                  {isFormSaving ? <LoadingSpinner color="white" /> : triggerId ? 'Save Trigger' : 'Create Trigger'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  )
}