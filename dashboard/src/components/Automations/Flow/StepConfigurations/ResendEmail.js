import { AccordionOpen } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import EmailPreview from "@/components/Resend/EmailPreview";
import EmptyState from "@/components/utils/PageEmptyState";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import InterpolatedMarkdown from "@/components/VariableParser/InterpolatedMarkdown";
import Link from "next/link";
import LoadingSpinner from '@components/LoadingSpinner';
import { LuX, LuInfo } from "react-icons/lu";
import { Skeleton } from '@/components/ui/skeleton';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { Textarea } from "@/components/ui/textarea"
import { Tooltipable } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form"
import useAutomationBuilder from "@/hooks/useAutomationBuilder";
import useAuthData from "@/hooks/useAuthData";
import useCommonQueries from "@/hooks/useCommonQueries";
import VariableSyntaxDocumentation from "../VariableSyntaxDocumentation";

const FormInputOrLoadingState = ({ children, className, isLoading }) => {
  if (isLoading) {
    return <Skeleton className={`h-10 w-full ${className || ''}`} />
  } else {
    return children;
  }
}

export default function ResendEmail({ data = { to: '{{ user.email }}', send_once_per_user: true }, onSave }) {
  const { email: currentUserEmail } = useAuthData();
  const form = useForm({ defaultValues: data });

  const [ccSectionsIsExpanded, setCcSectionsIsExpanded] = useState(data.cc ? true : false);
  const [bccSectionsIsExpanded, setBccSectionsIsExpanded] = useState(data.bcc ? true : false);
  const [hasResendDestinationEnabled, setHasResendDestinationEnabled] = useState();
  const [loading, setLoading] = useState(false);
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const [replyToSectionIsExpanded, setReplyToSectionIsExpanded] = useState(data.reply_to ? true : false);
  const { uniqueUserProperties } = useCommonQueries();
  const { selectedEntryPointEventName } = useAutomationBuilder();

  const isFetchingData = hasResendDestinationEnabled === undefined || uniqueUserProperties === undefined;

  async function verifyAndSubmitForm(values) {
    setLoading(true)
    const isValid = values.subject && values.body && values.to && values.from;
    if (!isValid) {
      Object.keys(values).forEach(key => {
        const isRequired = ['subject', 'body', 'to', 'from'].includes(key);
        if (isRequired && (!values[key] || values[key].trim().length === 0)) {
          form.setError(key, { message: `${key[0].toUpperCase() + key.slice(1).replace('_', ' ')} is a required field.` })
        }
      })
      setLoading(false);
      return;
    }

    onSave(values)
  }

  useEffect(() => {
    const determineIfResendDestinationIsEnabled = async () => {
      await SwishjamAPI.Integrations.list({ destinations: true }).then(({ enabled_integrations }) => {
        const hasIntegration = enabled_integrations.find(integration => integration.name === 'Resend')
        setHasResendDestinationEnabled(!!hasIntegration)
      });
    }

    determineIfResendDestinationIsEnabled();
  }, [])

  useEffect(() => {
    if (selectedEntryPointEventName) {
      SwishjamAPI.Events.Properties.listUnique(selectedEntryPointEventName).then(properties => {
        setPropertyOptionsForSelectedEvent(properties.sort());
      });
    }
  }, [selectedEntryPointEventName])

  useEffect(() => {
    if (currentUserEmail && !data.from) {
      form.setValue('from', `Your name <${currentUserEmail}>`)
    }
  }, [currentUserEmail])

  if (hasResendDestinationEnabled === false) {
    return (
      <EmptyState
        className='pb-40'
        title={
          <>
            Enable the <Link className='text-blue-600 underline' href='/integrations/destinations'>Resend destination</Link> to begin sending Resend email automations.
          </>
        }
      />
    )
  }

  return (
    <div className='grid grid-cols-2 gap-8'>
      <div>
        <FormInputOrLoadingState isLoading={isFetchingData || (selectedEntryPointEventName && propertyOptionsForSelectedEvent === undefined)} className='h-44'>
          <EmailPreview
            to={
              <InterpolatedMarkdown
                content={form.watch('to')}
                availableVariables={[
                  ...[...(propertyOptionsForSelectedEvent || []),
                  ...(propertyOptionsForSelectedEvent || []).map(e => `event.${e}`)],
                  ...(uniqueUserProperties || []).map(e => `user.${e}`),
                  'user.email'
                ]}
              />
            }
            cc={
              <InterpolatedMarkdown
                content={(form.watch('cc') || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                availableVariables={[
                  ...[...(propertyOptionsForSelectedEvent || []),
                  ...(propertyOptionsForSelectedEvent || []).map(e => `event.${e}`)],
                  ...(uniqueUserProperties || []).map(e => `user.${e}`),
                  'user.email'
                ]}
              />
            }
            bcc={
              <InterpolatedMarkdown
                content={(form.watch('bcc') || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                availableVariables={[
                  ...[...(propertyOptionsForSelectedEvent || []),
                  ...(propertyOptionsForSelectedEvent || []).map(e => `event.${e}`)],
                  ...(uniqueUserProperties || []).map(e => `user.${e}`),
                  'user.email'
                ]}
              />
            }
            from={
              <InterpolatedMarkdown
                content={(form.watch('from') || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                availableVariables={[
                  ...[...(propertyOptionsForSelectedEvent || []),
                  ...(propertyOptionsForSelectedEvent || []).map(e => `event.${e}`)],
                  ...(uniqueUserProperties || []).map(e => `user.${e}`),
                  'user.email'
                ]}
              />
            }
            replyTo={
              <InterpolatedMarkdown
                content={(form.watch('reply_to') || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                availableVariables={[
                  ...[...(propertyOptionsForSelectedEvent || []),
                  ...(propertyOptionsForSelectedEvent || []).map(e => `event.${e}`)],
                  ...(uniqueUserProperties || []).map(e => `user.${e}`),
                  'user.email'
                ]}
              />
            }
            subject={
              <InterpolatedMarkdown
                content={form.watch('subject')}
                availableVariables={[
                  ...[...(propertyOptionsForSelectedEvent || []),
                  ...(propertyOptionsForSelectedEvent || []).map(e => `event.${e}`)],
                  ...(uniqueUserProperties || []).map(e => `user.${e}`),
                  'user.email'
                ]}
              />
            }
            body={
              <InterpolatedMarkdown
                content={form.watch('body')}
                availableVariables={[
                  ...[...(propertyOptionsForSelectedEvent || []),
                  ...(propertyOptionsForSelectedEvent || []).map(e => `event.${e}`)],
                  ...(uniqueUserProperties || []).map(e => `user.${e}`),
                  'user.email'
                ]}
              />
            }
          />
          <div className='mt-2'>
            <AccordionOpen
              trigger={<h2 className="text-sm font-medium text-gray-700">Resend Email Formatting Reference</h2>}
              open={true}
              rememberState={true}
            >
              <VariableSyntaxDocumentation
                availableEventProperties={propertyOptionsForSelectedEvent}
                availableUserProperties={['user.email', ...(uniqueUserProperties || []).map(e => `user.${e}`)]}
                eventName={selectedEntryPointEventName}
              />
            </AccordionOpen>
          </div>
        </FormInputOrLoadingState>
      </div>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(verifyAndSubmitForm)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="flex">
                    To
                    <Tooltipable
                      content={
                        <>
                          Most often you will want to leave this as <span className='bg-gray-200 italic text-emerald-400 px-1 py-0.5 rounded-md'>{'{user.email}'}</span> variable,
                          as that is the currently identified user, however you have the option to pass in a different event or user property here if you desire.
                        </>
                      }
                    >
                      <div className=""><LuInfo className='ml-1 text-gray-500' size={16} /></div>
                    </Tooltipable>
                  </FormLabel>
                  <FormControl>
                    <FormInputOrLoadingState isLoading={isFetchingData}>
                      <Input
                        type="text"
                        placeholder="{{ user.email }}"
                        {...form.register("to")}
                      />
                      <div className="absolute top-6 right-2 flex gap-2 z-10">
                        {!bccSectionsIsExpanded && (
                          <div
                            onClick={() => setBccSectionsIsExpanded(true)}
                            className='cursor-pointer px-2 py-0.5 rounded border border-gray-200 text-xs hover:bg-accent'
                          >
                            BCC
                          </div>
                        )}
                        {!ccSectionsIsExpanded && (
                          <div
                            onClick={() => setCcSectionsIsExpanded(true)}
                            className='cursor-pointer px-2 py-0.5 rounded border border-gray-200 text-xs hover:bg-accent'
                          >
                            CC
                          </div>
                        )}
                      </div>
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
                <FormItem className="relative">
                  {(ccSectionsIsExpanded || form.watch('cc')) && <FormLabel className={`flex items-center pr-4 py-0.5`}>CC</FormLabel>}
                  <FormControl>
                    {(ccSectionsIsExpanded || form.watch('cc')) && (
                      <FormInputOrLoadingState isLoading={isFetchingData}>
                        <Input
                          type="text"
                          placeholder="somone-to-cc@example.com"
                          {...form.register("cc")}
                        />
                        <div className="absolute top-6 right-2 flex gap-2 z-10">
                          <div
                            onClick={() => {
                              setCcSectionsIsExpanded(false)
                              form.setValue('cc', null)
                            }}
                            className={`cursor-pointer px-2 py-1.5 text-xs hover:bg-accent rounded-md group transition-all duration-300`}
                          >
                            <LuX size={16} className="group-hover:text-gray-900 text-gray-200" />
                          </div>
                        </div>
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
                <FormItem className="relative">
                  {(bccSectionsIsExpanded || form.watch('bcc')) && <FormLabel className={`flex items-center pr-4 py-0.5`}>BCC</FormLabel>}
                  <FormControl>
                    {(bccSectionsIsExpanded || form.watch('bcc')) && (
                      <FormInputOrLoadingState isLoading={isFetchingData}>
                        <Input
                          type="text"
                          placeholder="someone-to-bcc@example.com"
                          {...form.register("bcc")}
                        />
                        <div className="absolute top-6 right-2 flex gap-2 z-10">
                          <div
                            onClick={() => {
                              setBccSectionsIsExpanded(false)
                              form.setValue('bcc', null)
                            }}
                            className='cursor-pointer px-2 py-1.5 text-xs hover:bg-accent rounded-md group transition-all duration-300'
                          >
                            <LuX size={16} className="group-hover:text-gray-900 text-gray-200" />
                          </div>
                        </div>
                      </FormInputOrLoadingState>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='from'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel className='flex'>From</FormLabel>
                  <FormControl>
                    <FormInputOrLoadingState isLoading={isFetchingData}>
                      <Input
                        type="text"
                        placeholder='Your Name <from-email@example.com>'
                        {...form.register('from')}
                      />
                      {!replyToSectionIsExpanded && (
                        <div className="absolute top-6 right-2 flex gap-2 z-10">
                          <div
                            onClick={() => setReplyToSectionIsExpanded(true)}
                            className='cursor-pointer px-2 py-0.5 rounded border border-gray-200 text-xs hover:bg-accent'
                          >
                            REPLY TO
                          </div>
                        </div>
                      )}
                    </FormInputOrLoadingState>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reply_to"
              render={({ field }) => (
                <FormItem className="relative">
                  {(replyToSectionIsExpanded || form.watch('reply_to')) && <FormLabel className={`flex items-center pr-4 py-0.5`}>Reply To</FormLabel>}
                  <FormControl>
                    {(replyToSectionIsExpanded || form.watch('reply_to')) && (
                      <FormInputOrLoadingState isLoading={isFetchingData}>
                        <Input
                          type="text"
                          placeholder="reply-to@example.com"
                          {...form.register("reply_to")}
                        />
                        <div className="absolute top-6 right-2 flex gap-2 z-10">
                          <div
                            onClick={() => {
                              setReplyToSectionIsExpanded(false)
                              form.setValue('reply_to', null)
                            }}
                            className='cursor-pointer px-2 py-1.5 text-xs hover:bg-accent rounded-md group transition-all duration-300'
                          >
                            <LuX size={16} className="group-hover:text-gray-900 text-gray-200" />
                          </div>
                        </div>
                      </FormInputOrLoadingState>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='subject'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Line</FormLabel>
                  <FormControl>
                    <FormInputOrLoadingState isLoading={isFetchingData}>
                      <Input
                        type="text"
                        placeholder="Your subject line here"
                        autoComplete="off"
                        {...form.register('subject')}
                      />
                    </FormInputOrLoadingState>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='body'
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
                      <div><LuInfo className='inline ml-1 text-gray-500' size={16} /></div>
                    </Tooltipable>
                  </FormLabel>
                  <FormControl>
                    <FormInputOrLoadingState isLoading={isFetchingData}>
                      <Textarea {...form.register('body')} className='min-h-[140px]' />
                    </FormInputOrLoadingState>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='send_once_per_user'
              render={({ field }) => (
                <FormInputOrLoadingState isLoading={isFetchingData}>
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 bg-white rounded-md border border-gray-200 p-4 shadow-sm'>
                    <FormControl>
                      <Checkbox
                        className='data-[state=checked]:bg-swishjam data-[state=checked]:border-swishjam'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="flex">
                      Send Once Per User
                      <Tooltipable
                        className=""
                        content={
                          <>
                            If enabled, a user will only receive this email once. If the user triggers the automation again, the email will not be sent and this automation step will be skipped.
                          </>
                        }
                      >
                        <div><LuInfo className='text-gray-500 ml-1' size={16} /></div>
                      </Tooltipable>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                </FormInputOrLoadingState>
              )}
            />

            {/* <FormField
              control={form.control}
              name='un_resolved_variable_safety_net'
              render={({ field }) => (
                <FormInputOrLoadingState isLoading={isFetchingData}>
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 bg-white rounded-md border border-gray-200 p-4 shadow-sm'>
                    <FormControl>
                      <Checkbox
                        className='data-[state=checked]:bg-swishjam data-[state=checked]:border-swishjam'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="flex">
                      Unresolved Variable Safety Net
                      <Tooltipable
                        className=""
                        content={
                          <>
                            <span className='font-bold'>Highly encouraged to remain enabled.</span> If checked, the email will not be sent if any of the variables used within
                            it do not resolve (ie: if the body uses a variable such as {'{event.myVariable}'} but the triggered event does not have that property).
                          </>
                        }
                      >
                        <div><LuInfo className='text-gray-500 ml-1' size={16} /></div>
                      </Tooltipable>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                </FormInputOrLoadingState>
              )}
            /> */}

            <div className='flex gap-x-2'>
              <Button
                className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
                type="submit"
                disabled={loading || uniqueUserProperties === undefined}
              >
                {loading ? <LoadingSpinner color="white" /> : 'Save Email'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}