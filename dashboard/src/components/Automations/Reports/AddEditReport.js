import { useEffect, useState, useRef } from 'react';
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
import LoadingSpinner from '@components/LoadingSpinner';
import SlackMessagePreview from '@/components/Slack/SlackMessagePreview';
import MessageBodyMarkdownRenderer from '@/components/Slack/MessageBodyMarkdownRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { swishjam } from '@swishjam/react';

export default function AddEditReport({ onNewReport, className }) {
  const form = useForm({ defaultValues: { name: '', cadence: 'daily', sending_mechanism: 'slack', slack_channel: '', messageSections: [{ type: 'web' }, { type: 'product' }, { type: 'revenue' }] } });
  const fieldArray = useFieldArray({
    control: form.control,
    name: "messageSections",
  });

  const [loading, setLoading] = useState(false);
  const [slackChannels, setSlackChannels] = useState();
  const [mkdPreview, setMkdPreview] = useState()

  const resetForm = () => {
    form.reset();
  }

  async function onSubmit(values) {
    setLoading(true)
    if (!values.name || !values.slack_channel || values.messageSections.length == 0) {
      toast.error('All fields are required')
      setLoading(false);
      return;
    }
    const { report, error } = await SwishjamAPI.Reports.create({
      name: values.name,
      cadence: values.cadence,
      sending_mechanism: values.sending_mechanism,
      config: {
        sections: values.messageSections,
        slack_channel_id: values.slack_channel
      }
    })

    setLoading(false);
    if (error) {
      toast.error(error)
    } else {
      swishjam.event('report_created', { report_id: report.id, report_name: report.name })
      toast.success(`${values.name} created successfully..`)
      form.reset();
      onNewReport(report)
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
  }, [])

  const renderMarkdown = () => {
    const slackMessageHeaderDaily = '📅 10/09/2023 \n\n'
    const slackMessageHeaderWeekly = '📅 10/09/2023 — 📅 10/16/2023\n\n'
    const reportWebSection = '📣 **Web Analytics:** \n\n↔️ Sessions: 500\n\n📉 Unique Visitors: 340\n\n📈 Page Views: 456\n\n';
    const reportProductSection = '**🧑‍💻 Product Analytics:**\n\n↔️ Daily Active Users: 500\n\n📉 Sessions: 340\n\n📈 New Users: 456\n\n';
    const reportRevenueSection = '**🧑‍💻 Revenue Analytics:**\n\n↔️ MRR: $1,500\n\n📉 Active Subscriptions: 56\n\n📈 Churn: $456\n\n';
    let msg = ''
    if(form.getValues('cadence') == 'daily') {
      msg += slackMessageHeaderDaily;
    } else { 
      msg += slackMessageHeaderWeekly;
    }

    form.getValues('messageSections').map((sec) => {
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

  form.watch((data, { name, type }) => renderMarkdown())

  return (
    <div className={`grid grid-cols-2 gap-8 ${className}`}>
      <div className=''>
        <ScrollArea className="max-h-96 overflow-y-scroll border border-gray-200 rounded-md bg-white">
          <SlackMessagePreview
            header={form.getValues('cadence') == 'daily' ? 'Daily Update' : 'Weekly Update'}
            body={<MessageBodyMarkdownRenderer body={mkdPreview} />}
            className={'border-0'}
          />
        </ScrollArea>
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
                  <FormControl>
                    <Input
                      type="search"
                      placeholder="Summary"
                      autoComplete="off"
                      {...form.register("name")}
                    />
                  </FormControl>
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
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Daily" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="daily">Daily</SelectItem>
                      <SelectItem className="cursor-pointer" value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly" disabled>Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sending_mechanism"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <Select onValueChange={field.onChange} disabled>
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
                </FormItem>
              )}
            />

            <div className='mt-4'>
              <FormLabel>Report Sections</FormLabel>

              {fieldArray.fields.length == 0 &&
                <div
                  onClick={() => fieldArray.append({ type: 'web' })}
                  className='px-6 py-20 border-2 border-gray-200 border-dashed mt-2 rounded-md text-center text-gray-400 text-sm cursor-pointer duration-500 transition-all hover:border-swishjam hover:text-swishjam'
                >
                  <LuPlus size="24" className='mx-auto mb-4' />
                  Add Report Sections
                </div>}
              {fieldArray.fields.length > 0 &&
                <ul className='grid gap-y-2 mt-2'>
                  {fieldArray.fields.map((field, index) =>
                    <li key={index} className='w-full flex'>
                      <div className="flex-1" >
                        <FormField
                          key={field.id}
                          control={field.control}
                          name={`messageSections.${index}.type`}
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
                                  <SelectItem className="cursor-pointer hover:bg-gray-100" value="revenue">Revenue Analytics</SelectItem>
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
                        const otherType = fieldArray.fields[0].type == 'web' ? 'product' : 'web'
                        fieldArray.append({ type: otherType })
                      }}
                      type='button'
                      variant="outline"
                      className={`!mt-2 w-full ${fieldArray.fields.length >= 3 ? 'cursor-disabled' : ''}`}
                      disabled={fieldArray.fields.length >= 3}
                    >
                      Add Section
                    </Button>
                  </li>
                </ul>}
            </div>
            <Button
              className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
              type="submit"
              disabled={loading || form.getValues('messageSections').length == 0}
            >
              {loading ? <LoadingSpinner color="white" /> : 'Create Report'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}