import { useEffect, useState } from 'react';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { LuPlus, LuTrash } from "react-icons/lu";

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm, useFieldArray } from "react-hook-form"
import { toast } from 'sonner'
import LoadingSpinner from '@components/LoadingSpinner'
import SlackMessagePreview from '@/components/Slack/SlackMessagePreview'
import MessageBodyMarkdownRenderer from '@/components/utils/MarkdownRenderer'
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area'
import { swishjam } from '@swishjam/react'
import { useRouter } from 'next/navigation'

const FormInputOrLoadingState = ({ children, className, isLoading }) => {
  if (isLoading) {
    return <Skeleton className={`h-10 w-full ${className || ''}`} />
  } else {
    return children;
  }
}

export default function AddEditReport({
  onSave,
  className,
  reportId,
  defaultReportValues = {
    name: '',
    cadence: 'daily',
    sending_mechanism: 'slack',
    config: {
      slack_channel_id: '',
      sections: [{ type: 'web' }]
    }
  },
}) {
  const router = useRouter();
  const form = useForm({ defaultValues: defaultReportValues });
  const fieldArray = useFieldArray({
    control: form.control,
    name: "config.sections",
  });

  const [hasStripeIntegrationEnabled, setHasStripeIntegrationEnabled] = useState();
  const [loading, setLoading] = useState(false);
  const [mkdPreview, setMkdPreview] = useState()
  const [slackChannels, setSlackChannels] = useState();

  const isAwaitingRenderData = hasStripeIntegrationEnabled === undefined || slackChannels === undefined;

  async function onSubmit(values) {
    setLoading(true)
    if (!values.name || !values.config.slack_channel_id || values.config.sections.length == 0) {
      toast.error('All fields are required')
      setLoading(false);
      return;
    }
    const { report, error } = await onSave(values);
    setLoading(false);
    if (error) {
      toast.error(error)
    } else {
      swishjam.event(`${reportId ? 'report_edited' : 'report_created'}`, { report_id: report.id, report_name: report.name })
      toast.success(`${values.name} ${reportId ? 'edited successfully' : 'report created. Redirecting to all Reports'} `)
      if (!reportId) {
        form.reset();
        router.push('/reports')
      }
    }
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
    SwishjamAPI.Integrations.list().then(({ enabled_integrations }) => {
      const stripeIntegration = enabled_integrations.find(({ name }) => name.toLowerCase() === 'stripe');
      setHasStripeIntegrationEnabled(stripeIntegration !== undefined);
    })
  }, [])

  const renderMarkdown = () => {
    const currentCadence = form.getValues('cadence')
    const comparisonText = currentCadence === 'daily' ? 'yesterday' : currentCadence === 'weekly' ? 'last week' : 'last month';
    const reportWebSection = [
      '📣 **Web Analytics:**',
      `📈 Sessions: 500 (+11% from ${comparisonText})`,
      `📉 Unique Visitors: 340 (-4% from ${comparisonText})`,
      `📈 Page Views: 456 (+8% from ${comparisonText})`
    ].join('\n\n');
    const reportProductSection = [
      '🧑‍💻 **Product Analytics:**',
      `↔️ Active Users: 210 (No change from ${comparisonText})`,
      `📉 Sessions: 340 (-6% from ${comparisonText})`,
      `📈 New Users: 456 (+12% from ${comparisonText})`
    ].join('\n\n');
    const reportRevenueSection = [
      '🏦 **Revenue Analytics:**',
      `↔️ Current MRR: $1,500 (No change from ${comparisonText})`,
      `📉 New Subscriptions: 56 (-4% from ${comparisonText})`,
      `📈 Churn: $456 (+3% from ${comparisonText})`
    ].join('\n\n');
    let msg = ''
    const today = new Date();
    const oneDayAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }

    if (currentCadence == 'daily') {
      msg += `📅 ${formatDate(oneDayAgo)}\n\n`;
    } else if (currentCadence == 'weekly') {
      msg += `📅 ${formatDate(oneWeekAgo)} — 📅 ${formatDate(today)}\n\n`;
    } else {
      msg += `📅 ${formatDate(oneMonthAgo)} — 📅 ${formatDate(today)}\n\n`;
    }

    (form.getValues('config.sections') || []).map((sec, i) => {
      if (i > 0) {
        msg += '\n\n'
      }
      if (sec.type == 'web') {
        msg += reportWebSection
      }
      if (sec.type == 'product') {
        msg += reportProductSection
      }
      if (sec.type == 'revenue') {
        msg += reportRevenueSection
      }
    })
    setMkdPreview(msg)
  }

  form.watch(renderMarkdown);

  return (
    <div className={`grid grid-cols-2 gap-8 ${className}`}>
      <div className=''>
        <FormInputOrLoadingState isLoading={isAwaitingRenderData} className='h-72'>
          <ScrollArea className="border border-gray-200 rounded-md bg-white">
            <SlackMessagePreview
              header={form.getValues('cadence') + ' Update'}
              body={<MessageBodyMarkdownRenderer markdown={mkdPreview} />}
              className={'border-0'}
            />
          </ScrollArea>
        </FormInputOrLoadingState>
      </div>
      <div className=''>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Name</FormLabel>
                  <FormInputOrLoadingState isLoading={isAwaitingRenderData}>
                    <FormControl>
                      <Input
                        type="search"
                        placeholder="Summary"
                        autoComplete="off"
                        {...form.register("name")}
                      />
                    </FormControl>
                  </FormInputOrLoadingState>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cadence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormInputOrLoadingState isLoading={isAwaitingRenderData}>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Daily" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem className="cursor-pointer" value="daily">Daily</SelectItem>
                        <SelectItem className="cursor-pointer" value="weekly">Weekly</SelectItem>
                        <SelectItem className='cursor-pointer' value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormInputOrLoadingState>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="sending_mechanism"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <FormInputOrLoadingState isLoading={isAwaitingRenderData}>
                    <Select onValueChange={field.onChange} disabled defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Slack" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem className="cursor-pointer" value="slack">Slack</SelectItem>
                        <SelectItem value="email" disabled>Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormInputOrLoadingState>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="config.slack_channel_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slack Channel</FormLabel>
                  <FormInputOrLoadingState isLoading={isAwaitingRenderData}>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your Slack channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {slackChannels && slackChannels.map(c => (
                          <SelectItem key={c.id} className="cursor-pointer hover:bg-gray-100" value={c.id}>#{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormInputOrLoadingState>
                </FormItem>
              )}
            />

            <div className='mt-4'>
              <FormLabel>Report Sections</FormLabel>
              <FormInputOrLoadingState isLoading={isAwaitingRenderData} className='h-48'>
                {fieldArray.fields.length == 0 && (
                  <div
                    onClick={() => fieldArray.append({ type: 'web' })}
                    className='px-6 py-20 border-2 border-gray-200 border-dashed mt-2 rounded-md text-center text-gray-400 text-sm cursor-pointer duration-500 transition-all hover:border-swishjam hover:text-swishjam'
                  >
                    <LuPlus size="24" className='mx-auto mb-4' />
                    Add Report Sections
                  </div>
                )}
                {fieldArray.fields.length > 0 && (
                  <ul className='grid gap-y-2 mt-2'>
                    {fieldArray.fields.map((field, index) =>
                      <li key={index} className='w-full flex'>
                        <div className="flex-1" >
                          <FormField
                            key={field.id}
                            control={field.control}
                            name={`config.sections.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <Select value={field.value} key={field.id} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Web Analytics" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem className="cursor-pointer hover:bg-gray-100" value="web">Web Analytics</SelectItem>
                                    <SelectItem className="cursor-pointer hover:bg-gray-100" value="product">Product Analytics</SelectItem>
                                    <SelectItem
                                      disabled={!hasStripeIntegrationEnabled}
                                      className="cursor-pointer hover:bg-gray-100"
                                      value="revenue"
                                    >
                                      Revenue Analytics {!hasStripeIntegrationEnabled && <span className="text-xs text-gray-500">- Enable Stripe in the integrations tab</span>}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          onClick={() => fieldArray.remove(index)}
                          type={'button'}
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
                          const otherType = ['web', 'product', 'revenue'].filter(t => !fieldArray.fields.map(f => f.type).includes(t))[0]
                          fieldArray.append({ type: otherType })
                        }}
                        type='button'
                        variant="outline"
                        className={`!mt-2 w-full ${fieldArray.fields.length >= (hasStripeIntegrationEnabled ? 3 : 2) ? 'cursor-disabled' : ''}`}
                        disabled={fieldArray.fields.length >= (hasStripeIntegrationEnabled ? 3 : 2)}
                      >
                        Add Section
                      </Button>
                    </li>
                  </ul>
                )}
              </FormInputOrLoadingState>
            </div>
            <Button
              className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
              type="submit"
              disabled={loading || (form.getValues('config.sections') || []).length == 0}
            >
              {loading ? <LoadingSpinner color="white" /> : `${reportId ? 'Save' : 'Create'} Report`}
            </Button>
          </form>
        </Form>
      </div>
    </div >
  )
}