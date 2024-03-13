'use client'

import { AccordionOpen } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import EmptyState from "@/components/utils/PageEmptyState";
import { InfoIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@components/LoadingSpinner';
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from '@/components/ui/skeleton';
import SlackMessagePreview from '@components/Slack/SlackMessagePreview';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { toast } from 'sonner'
import { Textarea } from "@/components/ui/textarea"
import { Tooltipable } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
import VariableSyntaxDocumentation from "@/components/Automations/VariableSyntaxDocumentation";
import InterpolatedMarkdown from "@/components/VariableParser/InterpolatedMarkdown";
import useCommonQueries from "@/hooks/useCommonQueries";
import useAutomationBuilder from "@/hooks/useAutomationBuilder";
import { useForm } from "react-hook-form";

const FormInputOrLoadingState = ({ children, className, isLoading }) => {
  if (isLoading) {
    return <Skeleton className={`h-10 w-full ${className || ''}`} />
  } else {
    return children;
  }
}

export default function ConfigureSlackAutomationStep({ onSave, data = {} }) {
  const form = useForm({ defaultValues: data });

  const [hasSlackDestination, setHasSlackDestination] = useState();
  const [isFormSaving, setIsFormSaving] = useState();
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const [slackChannels, setSlackChannels] = useState();

  const { uniqueUserProperties } = useCommonQueries();
  const { selectedEntryPointEventName } = useAutomationBuilder();

  const getAndSetSlackChannels = async () => {
    const resp = await SwishjamAPI.Slack.getChannels()
    if (resp.error) {
      if (/must connect your slack/i.test(resp.error)) {
        setHasSlackDestination(false);
      } else {
        toast.error("Uh oh! Something went wrong.", { description: resp.error })
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
  }

  const getUniqueEventPropertiesForEntryPointEvent = async () => {
    // disabling for now because it overwrites the header value on initial load
    // form.setValue('message_header', `✨ ${selectedEntryPointEventName} ✨`)
    const properties = await SwishjamAPI.Events.Properties.listUnique(selectedEntryPointEventName)
    setPropertyOptionsForSelectedEvent(properties.sort());
  }

  useEffect(() => {
    if (selectedEntryPointEventName) {
      getUniqueEventPropertiesForEntryPointEvent();
    } else {
      form.setValue('message_header', '')
      setPropertyOptionsForSelectedEvent([]);
    }
  }, [selectedEntryPointEventName])

  useEffect(() => {
    getAndSetSlackChannels();
  }, [])

  const onSubmit = async values => {
    setIsFormSaving(true)
    const isValid = values.channel_id && (values.message_header || values.message_body)
    if (!isValid) {
      Object.keys(values).forEach(key => {
        if (!values[key]) {
          if ((key === 'message_header' || key === 'message_body') && !values.message_header && !values.message_body) {
            form.setError(key, { message: 'You must provide either a header or a body value for your slack message.' })
          } else if (key !== 'message_header' && key !== 'message_body') {
            form.setError(key, { message: `${key[0].toUpperCase() + key.slice(1).replace('_', ' ')} is a required field.` })
          }
        }
      })
      setIsFormSaving(false);
      return;
    }

    setTimeout(() => {
      setIsFormSaving(false);
      values.channel_name = slackChannels.find(channel => channel.id === values.channel_id)?.name;
      onSave(values)
    }, 250)
  }

  if (hasSlackDestination === false) {
    return <EmptyState title={<><Link className='text-blue-700 underline' href='/integrations/destinations'>Connect Slack</Link> to begin creating Slack triggers</>} />
  }

  return (
    <main>
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <FormInputOrLoadingState className='h-44' isLoading={slackChannels === undefined}>
            <SlackMessagePreview
              header={form.watch('message_header')}
              body={
                <InterpolatedMarkdown
                  availableVariables={[
                    ...(propertyOptionsForSelectedEvent || []),
                    ...(propertyOptionsForSelectedEvent || []).map(p => `event.${p}`),
                    ...(uniqueUserProperties || []).map(p => `user.${p}`),
                    'user.email'
                  ]}
                  content={form.watch('message_body')}
                  useSlackLinkFormatting={true}
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
                availableUserProperties={(uniqueUserProperties || []).map(p => `user.${p} `).concat('user.email')}
                eventName={selectedEntryPointEventName}
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
                name="message_header"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header</FormLabel>
                    <FormControl>
                      <FormInputOrLoadingState isLoading={slackChannels === undefined}>
                        <Input
                          type="search"
                          placeholder="✨ Event Name"
                          autoComplete="off"
                          {...form.register("message_header")}
                        />
                      </FormInputOrLoadingState>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message_body"
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
                      <FormInputOrLoadingState isLoading={slackChannels === undefined}>
                        <Textarea {...form.register("message_body")} />
                      </FormInputOrLoadingState>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slack Channel</FormLabel>
                    <FormInputOrLoadingState isLoading={slackChannels === undefined}>
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
                <Button
                  className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isFormSaving ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
                  type="submit"
                  disabled={isFormSaving || slackChannels === undefined}
                >
                  {isFormSaving ? <LoadingSpinner color="white" /> : 'Save Slack Message'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  )
}