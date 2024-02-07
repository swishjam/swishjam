import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from '@/components/ui/skeleton';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { Textarea } from "@/components/ui/textarea"
import { Tooltipable } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from "react-hook-form"
import { ChevronRightIcon, InfoIcon } from 'lucide-react';
import { LuPlus, LuTrash } from "react-icons/lu";
import useAuthData from "@/hooks/useAuthData";
import EmailPreview from "@/components/Resend/EmailPreview";
import { ScrollArea } from "../ui/scroll-area";
import InterpolatedMarkdown from "../VariableParser/InterpolatedMarkdown";

const FormInputOrLoadingState = ({ children, className, isLoading }) => {
  if (isLoading) {
    return <Skeleton className={`h-10 w-full ${className || ''}`} />
  } else {
    return children;
  }
}

export default function ResendEmailView({ onSubmit }) {
  const { email: currentUserEmail } = useAuthData();
  const form = useForm({ defaultValues: { to: '{ user.email }', send_once_per_user: true, un_resolved_variable_safety_net: true } });
  const conditionalStatementsFieldArray = useFieldArray({ control: form.control, name: "conditionalStatements" });

  const [ccSectionsIsExpanded, setCcSectionsIsExpanded] = useState(false);
  const [bccSectionsIsExpanded, setBccSectionsIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [userPropertyOptions, setUserPropertyOptions] = useState();
  // const [testTriggerModalIsOpen, setTestTriggerModalIsOpen] = useState(false);

  const setSelectedEventAndGetPropertiesAndAutofillMessageContentIfNecessary = async eventName => {
    conditionalStatementsFieldArray.fields.forEach((field, index) => {
      // only remove conditional statements that are non-empty
      if (field.property || field.condition || field.property_value) {
        conditionalStatementsFieldArray.remove(index)
      }
    })
    SwishjamAPI.Events.Properties.listUnique(eventName).then(properties => {
      setPropertyOptionsForSelectedEvent([...properties, ...properties.map(p => `event.${p}`)]);
      // we re-set this every time they change the event..?
      let formattedPropertyOptions = '';
      properties.forEach(property => formattedPropertyOptions += `- ${property}: {${property}}  \n`)
      form.setValue('body', `The _${eventName}_ event has the following properties: \n${formattedPropertyOptions}`);
    });
  }

  async function verifyAndSubmitForm(values) {
    setLoading(true)
    const isValid = values.event_name && values.subject && values.body && values.to && values.from;
    if (!isValid) {
      Object.keys(values).forEach(key => {
        const isRequired = ['event_name', 'subject', 'body', 'to', 'from'].includes(key);
        if (isRequired && (!values[key] || values[key].trim().length === 0)) {
          form.setError(key, { message: `${key[0].toUpperCase() + key.slice(1).replace('_', ' ')} is a required field.` })
        }
      })
      setLoading(false);
      return;
    }
    let hasEmptyConditionalStatements = false;
    if (values.conditionalStatements.length > 0) {
      values.conditionalStatements.forEach((statement, index) => {
        if (!statement.property || !statement.condition || !statement.property_value) {
          if (!statement.property) {
            hasEmptyConditionalStatements = true;
            form.setError(`conditionalStatements.${index}.property`, { message: 'Property is a required field.' })
          }
          if (!statement.condition) {
            hasEmptyConditionalStatements = true;
            form.setError(`conditionalStatements.${index}.condition`, { message: 'Condition is a required field.' })
          }
          if (!statement.property_value && statement.condition !== 'is_defined') {
            hasEmptyConditionalStatements = true;
            form.setError(`conditionalStatements.${index}.property_value`, { message: 'Property Value is a required field.' })
          }
        }
      })
    }
    if (hasEmptyConditionalStatements) {
      setLoading(false);
      return;
    }

    const config = {
      to: values.to,
      cc: values.cc,
      bcc: values.bcc,
      from: values.from,
      subject: values.subject,
      body: values.body,
      send_once_per_user: values.send_once_per_user,
      un_resolved_variable_safety_net: values.un_resolved_variable_safety_net,
    }
    const payload = {
      eventName: values.event_name,
      conditionalStatements: values.conditionalStatements,
      steps: [{ type: 'EventTriggerSteps::ResendEmail', config }],
    }
    onSubmit(payload)
  }

  useEffect(() => {
    const getUniqueEventsAndUserProperties = async () => {
      const [events, userProperties] = await Promise.all([
        SwishjamAPI.Events.listUnique(),
        SwishjamAPI.Users.uniqueProperties()
      ]);
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
      setUserPropertyOptions(['user.email', ...userProperties.map(property => `user.${property}`)])
    }

    getUniqueEventsAndUserProperties();
  }, [])

  useEffect(() => {
    form.setValue('from', currentUserEmail)
  }, [currentUserEmail])

  return (
    <div className="grid grid-cols-2 gap-8 mt-8">
      <div>
        <span className='text-sm text-gray-500'>Email Preview</span>
        <FormInputOrLoadingState isLoading={uniqueEvents === undefined || userPropertyOptions === undefined} classname='h-44'>
          <EmailPreview
            to={
              <InterpolatedMarkdown
                content={form.watch('to')}
                availableEventOptions={[...(propertyOptionsForSelectedEvent || []), ...(userPropertyOptions || [])]}
              />
            }
            cc={
              <InterpolatedMarkdown
                content={form.watch('cc')}
                availableEventOptions={[...(propertyOptionsForSelectedEvent || []), ...(userPropertyOptions || [])]}
              />
            }
            bcc={
              <InterpolatedMarkdown
                content={form.watch('bcc')}
                availableEventOptions={[...(propertyOptionsForSelectedEvent || []), ...(userPropertyOptions || [])]}
              />
            }
            from={form.watch('from')}
            subject={
              <InterpolatedMarkdown
                content={form.watch('subject')}
                availableEventOptions={[...(propertyOptionsForSelectedEvent || []), ...(userPropertyOptions || [])]}
              />
            }
            body={
              <InterpolatedMarkdown
                content={form.watch('body')}
                availableEventOptions={[...(propertyOptionsForSelectedEvent || []), ...(userPropertyOptions || [])]}
              />
            }
          />
        </FormInputOrLoadingState>
      </div>
      <div>
        <ScrollArea className="max-h-[80vh] overflow-y-scroll pb-10 px-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(verifyAndSubmitForm)} className="space-y-4">
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
                    <FormInputOrLoadingState isLoading={uniqueEvents === undefined || userPropertyOptions === undefined}>
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

                <FormInputOrLoadingState className='h-24 mt-2' isLoading={uniqueEvents === undefined || userPropertyOptions === undefined}>
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
                              name={`conditionalStatements.${index}.property`}
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
                                      <SelectItem value='_subject' disabled>
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
                              name={`conditionalStatements.${index}.condition`}
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
                                      <SelectItem value='_subject' disabled>
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
                            {form.watch(`conditionalStatements.${index}.condition`) !== 'is_defined' && (
                              <FormField
                                control={form.control}
                                name={`conditionalStatements.${index}.property_value`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        placeholder="Your property value"
                                        disabled={propertyOptionsForSelectedEvent === undefined}
                                        {...form.register(`conditionalStatements.${index}.property_value`)}
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
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      To
                      <Tooltipable
                        content={
                          <>
                            Most often you will want to leave this as <span className='bg-gray-200 italic text-emerald-400 px-1 py-0.5 rounded-md'>{'{user.email}'}</span> variable,
                            as that is the currently identified user, however you have the option to pass in a different event or user property here if you desire.
                          </>
                        }
                      >
                        <InfoIcon className='inline ml-1 text-gray-500' size={16} />
                      </Tooltipable>
                    </FormLabel>
                    <FormControl>
                      <FormInputOrLoadingState isLoading={uniqueEvents === undefined || userPropertyOptions === undefined}>
                        <Input
                          type="text"
                          placeholder="{user.email}"
                          {...form.register("to")}
                        />
                      </FormInputOrLoadingState>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={`flex items-center pr-4 py-0.5 transition-all rounded w-fit ${form.watch('cc') ? '' : 'cursor-pointer hover:bg-gray-100'}`}
                      onClick={() => {
                        if (!form.watch('cc')) {
                          setCcSectionsIsExpanded(!ccSectionsIsExpanded)
                        }
                      }}
                    >
                      <ChevronRightIcon className={`w-4 h-4 transition-all ${ccSectionsIsExpanded ? 'transform rotate-90' : ''}`} />
                      CC:
                    </FormLabel>
                    <FormControl>
                      {(ccSectionsIsExpanded || form.watch('cc')) && (
                        <FormInputOrLoadingState isLoading={uniqueEvents === undefined || userPropertyOptions === undefined}>
                          <Input
                            type="text"
                            placeholder="somone-to-cc@example.com"
                            {...form.register("cc")}
                          />
                        </FormInputOrLoadingState>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bcc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={`flex items-center pr-4 py-0.5 transition-all rounded w-fit ${form.watch('bcc') ? '' : 'cursor-pointer hover:bg-gray-100'}`}
                      onClick={() => {
                        if (!form.watch('bcc')) {
                          setBccSectionsIsExpanded(!bccSectionsIsExpanded)
                        }
                      }}
                    >
                      <ChevronRightIcon className={`w-4 h-4 transition-all ${bccSectionsIsExpanded ? 'transform rotate-90' : ''}`} />
                      BCC:
                    </FormLabel>
                    <FormControl>
                      {(bccSectionsIsExpanded || form.watch('bcc')) && (
                        <FormInputOrLoadingState isLoading={uniqueEvents === undefined || userPropertyOptions === undefined}>
                          <Input
                            type="text"
                            placeholder="someone-to-bcc@example.com"
                            {...form.register("bcc")}
                          />
                        </FormInputOrLoadingState>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From:</FormLabel>
                    <FormControl>
                      <FormInputOrLoadingState isLoading={uniqueEvents === undefined || userPropertyOptions === undefined}>
                        <Input
                          type="text"
                          placeholder='from-email@example.com'
                          {...form.register("from")}
                        />
                      </FormInputOrLoadingState>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <FormInputOrLoadingState isLoading={uniqueEvents === undefined || userPropertyOptions === undefined}>
                        <Input
                          type="text"
                          placeholder="Your subject line here"
                          autoComplete="off"
                          {...form.register("subject")}
                        />
                      </FormInputOrLoadingState>
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
                    <FormLabel className='flex items-center'>
                      Email Body
                      <Tooltipable
                        content={
                          <>
                            Within the body of the email you can reference event properties and user properties by wrapping the property in {"{}"} (ie: if you want to
                            include the <span className='italic'>url</span> property of the event in the body of the email,
                            you can reference it as <span className='bg-gray-200 italic text-emerald-400 px-1 py-0.5 rounded-md'>{'{url}'}</span>).
                          </>
                        }
                      >
                        <InfoIcon className='inline ml-1 text-gray-500' size={16} />
                      </Tooltipable>
                    </FormLabel>
                    <FormControl>
                      <FormInputOrLoadingState isLoading={uniqueEvents === undefined || userPropertyOptions === undefined}>
                        <Textarea {...form.register("body")} className='min-h-[140px]' />
                      </FormInputOrLoadingState>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="send_once_per_user"
                render={({ field }) => (
                  <FormItem className='flex items-center gap-x-2'>
                    <Tooltipable content="If checked, this email will not be sent on subsequent events for the same email address.">
                      <InfoIcon className='inline text-gray-500 mr-1' size={16} />
                    </Tooltipable>
                    <FormLabel className='cursor-pointer'>
                      Only ever send this email to a user once
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="checkbox"
                        className='h-3 w-3 mt-0 cursor-pointer focus-visible:bg-swishjam focus:bg-swishjam checked:bg-swishjam checked:border-transparent checked:ring-0 hover:bg-swishjam'
                        style={{ marginTop: 0 }}
                        {...form.register("send_once_per_user")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="un_resolved_variable_safety_net"
                render={({ field }) => (
                  <FormItem className='flex items-center gap-x-2'>
                    <Tooltipable
                      content={
                        <>
                          <span className='font-bold'>Highly encouraged to remain enabled.</span> If checked, the email will not be sent if any of the variables used within
                          it do not resolve (ie: if the body uses a variable such as {'{event.myVariable}'} but the triggered event does not have that property).
                        </>
                      }
                    >
                      <InfoIcon className='inline text-gray-500 mr-1' size={16} />
                    </Tooltipable>
                    <FormLabel className='cursor-pointer'>
                      Unresolved Variable Safety Net
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="checkbox"
                        className='h-3 w-3 mt-0 cursor-pointer focus-visible:bg-swishjam focus:bg-swishjam checked:bg-swishjam checked:border-transparent checked:ring-0 hover:bg-swishjam'
                        style={{ marginTop: 0 }}
                        {...form.register("un_resolved_variable_safety_net")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex gap-x-2'>
                {/* {!form.watch('event_name') || (!form.watch('subject') && !form.watch('body'))
                  ? (
                    <Tooltipable content="You must select an event, a slack channel, and provide either a subject or a body value for your slack message before you can test your trigger.">
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
                      disabled={loading || uniqueEvents === undefined || userPropertyOptions === undefined}
                      onClick={() => setTestTriggerModalIsOpen(true)}
                    >
                      <PaperAirplaneIcon className='w-4 h-4 inline mr-2' />
                      Test Your Trigger
                    </button>
                  )} */}
                <Button
                  className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
                  type="submit"
                  disabled={loading || uniqueEvents === undefined || userPropertyOptions === undefined}
                >
                  {loading ? <LoadingSpinner color="white" /> : 'Create Trigger'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </div>
    </div>
  )
}