import { useEffect, useState, useRef } from 'react';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { ScrollArea } from "@/components/ui/scroll-area";
import { LuPlus, LuTrash } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useFieldArray, useForm } from "react-hook-form"
import LoadingSpinner from '@components/LoadingSpinner';
import { toast } from 'sonner'
import SlackMessagePreview from '@components/Slack/SlackMessagePreview';
import MessageBodyMarkdownRenderer from '@components/Slack/MessageBodyMarkdownRenderer';
import { swishjam } from '@swishjam/react';

export default function AddTriggerModal({ onNewTrigger }) {
  const dialogRef = useRef();
  const form = useForm({ defaultValues: { header: '✨ Event Name' } });
  const conditionsFieldArray = useFieldArray({ control: form.control, name: "conditionalStatements" });
  const [loading, setLoading] = useState(false);
  const [slackChannels, setSlackChannels] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();

  const setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary = async (eventName) => {
    form.setValue('header', '✨ ' + eventName + ' ✨')
    SwishjamAPI.Events.Properties.listUnique(eventName).then(properties => {
      setPropertyOptionsForSelectedEvent(properties);
      // we re-set this every time they change the event..?
      let formattedPropertyOptions = '';
      properties.forEach(property => formattedPropertyOptions += `- ${property}: {${property}}  \n`)
      form.setValue('body', `The _${eventName}_ event has the following properties: \n${formattedPropertyOptions}`);
    });
  }

  async function onSubmit(values) {
    setLoading(true)
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
      setLoading(false);
      return;
    }

    const config = {
      message_header: values.header,
      message_body: values.body,
      channel_id: values.slack_channel,
      channel_name: slackChannels.find(channel => channel.id === values.slack_channel)?.name,
    }
    const { trigger, error } = await SwishjamAPI.EventTriggers.create({
      eventName: values.event_name,
      steps: [{ type: 'EventTriggerSteps::Slack', config }]
    })

    setLoading(false);
    if (error) {
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
      form.reset();
      onNewTrigger && onNewTrigger(trigger);
      dialogRef.current.click();
    }
  }

  useEffect(() => {
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
  }, [])

  return (
    <Dialog>
      <DialogTrigger
        className={`duration-300 transition-all ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark`}
        ref={dialogRef}
      >
        <LuPlus className="h-4 w-4 mt-0.5 mr-2" />
        Add Event Trigger
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Event Trigger</DialogTitle>
          <DialogDescription>
            Send key data to slack
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2>Slack Preview</h2>
            <ScrollArea className="max-h-96 overflow-y-scroll border border-gray-200 rounded-md">
              <SlackMessagePreview
                header={form.watch('header')}
                body={<MessageBodyMarkdownRenderer body={form.watch('body')} availableEventOptions={propertyOptionsForSelectedEvent} />}
                className={'mt-2 border-0'}
              />
            </ScrollArea>
          </div>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="event_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Event</FormLabel>
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
                          {uniqueEvents?.map(c => <SelectItem key={c.name} className="cursor-pointer hover:bg-gray-100" value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='mt-4'>
                  <FormLabel>Trigger Conditions</FormLabel>

                  {conditionsFieldArray.fields.length == 0 && (
                    <div
                      onClick={() => conditionsFieldArray.append({ type: 'web' })}
                      className='px-6 py-6 border-2 border-gray-200 border-dashed mt-2 rounded-md text-center text-gray-400 text-sm cursor-pointer duration-500 transition-all hover:border-swishjam hover:text-swishjam'
                    >
                      <LuPlus size="24" className='mx-auto mb-4' />
                      Add Trigger Condition
                    </div>
                  )}
                  {conditionsFieldArray.fields.length > 0 &&
                    <ul className='grid gap-y-2 mt-2'>
                      {conditionsFieldArray.fields.map((field, index) =>
                        <li key={index} className='w-full flex items-center gap-x-2'>
                          <span className='text-xs'>If</span>
                          <FormField
                            key={field.id}
                            control={field.control}
                            name={`conditionalStatements.${index}.property`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  className='flex-grow'
                                  disabled={propertyOptionsForSelectedEvent === undefined}
                                  key={field.id}
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Event Property" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {propertyOptionsForSelectedEvent?.map(propertyName => (
                                      <SelectItem className="cursor-pointer hover:bg-gray-100" value={propertyName}>
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
                            key={field.id}
                            control={field.control}
                            name={`conditionalStatements.${index}.condition`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  className='flex-grow'
                                  disabled={propertyOptionsForSelectedEvent === undefined}
                                  key={field.id}
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Condition" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {['equals', 'contains', 'does not contain', 'ends with', 'does not end with'].map(propertyName => (
                                      <SelectItem className="cursor-pointer hover:bg-gray-100" value={propertyName}>
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
                            control={form.control}
                            name={`conditionalStatements.${index}.propertyValue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="Your property value"
                                    {...form.register(`conditionalStatements.${index}.propertyValue`)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            onClick={() => conditionsFieldArray.remove(index)}
                            type='button'
                            variant="ghost"
                            className='flex-none ml-2 duration-500 hover:text-rose-600'
                          >
                            <LuTrash size={14} />
                          </Button>
                        </li>
                      )}
                      <li key="add-more-button">
                        <Button
                          onClick={() => {
                            const otherType = conditionsFieldArray.fields[0].type == 'web' ? 'product' : 'web'
                            conditionsFieldArray.append({ type: otherType })
                          }}
                          type='button'
                          variant="outline"
                          className={`!mt-2 w-full ${conditionsFieldArray.fields.length >= 2 ? 'cursor-disabled' : ''}`}
                          disabled={conditionsFieldArray.fields.length >= 2}
                        >
                          Add Condition
                        </Button>
                      </li>
                    </ul>}
                </div>

                <FormField
                  control={form.control}
                  name="header"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header</FormLabel>
                      <FormControl>
                        <Input
                          type="search"
                          placeholder="✨ Event Name"
                          autoComplete="off"
                          {...form.register("header")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <Textarea
                          {...form.register("body")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slack_channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slack Channel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your slack channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {slackChannels && slackChannels.map(c => <SelectItem key={c.id} className="cursor-pointer hover:bg-gray-100" value={c.id}>#{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
                  type="submit"
                >
                  {loading ? <LoadingSpinner color="white" /> : 'Create Trigger'}
                </Button>
              </form>
            </Form>
          </div>
        </div>


      </DialogContent>
    </Dialog>
  )
}