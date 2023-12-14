import { useEffect, useState, useRef } from 'react';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { LuPlus } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { useForm } from "react-hook-form"
import { toast } from 'sonner'
import LoadingSpinner from '@components/LoadingSpinner';
import SlackMessagePreview from '@/components/Slack/SlackMessagePreview';
import MessageBodyMarkdownRenderer from '@/components/Slack/MessageBodyMarkdownRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';

const reportMarkdown = '📅 10/2/2023 \n\n📣 **Marketing Site:** \n\n↔️ Sessions: 500\n\n📉 Unique Visitors: 340\n\n📈 Page Views: 456\n\n **🧑‍💻 Product Usage:**\n\n↔️ Daily Active Users: 500\n\n📉 Sessions: 340\n\n📈 New Users: 456'

export default function AddReportModal({ onNewReport }) {
  const dialogRef = useRef();
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [slackChannels, setSlackChannels] = useState();

  async function onSubmit(values) {
    setLoading(true)
    if (!values.name || !values.slack_channel) {
      toast.error('All fields are required')
      setLoading(false);
      return;
    }
    const { report, error } = await SwishjamAPI.Reports.create({
      name: values.name,
      cadence: 'daily',
      sending_mechanism: 'slack',
      config: {
        channel_id: values.slack_channel
      }
    })

    setLoading(false);
    if (error) {
      toast.error(error)
    } else {
      toast.success(`${values.name} created successfully..`)
      form.reset();
      dialogRef.current.click();
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

  return (
    <Dialog>
      <DialogTrigger
        className={`duration-300 transition-all ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark`}
        ref={dialogRef}
      >
        <LuPlus className="h-4 w-4 mt-0.5 mr-2" />
        Add Report
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create a Report</DialogTitle>
          <DialogDescription>
            Schedule an automated report of your key data to slack or via email
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2>Report Preview</h2>
            <ScrollArea className="max-h-96 overflow-y-scroll border border-gray-200 rounded-md">
              <SlackMessagePreview
                header={'Daily Update'}
                body={<MessageBodyMarkdownRenderer body={reportMarkdown} />}
                className={'mt-2 border-0'}
              />
            </ScrollArea>
          </div>
          <div>
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
                      <Select onValueChange={field.onChange} disabled>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Daily" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem className="cursor-pointer" value="daily">Daily</SelectItem>
                          <SelectItem value="weekly" disabled>Monthly</SelectItem>
                          <SelectItem value="monthly" disabled>Yearly</SelectItem>
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
                            <SelectValue placeholder="Select your slack channel" />
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

                <Button
                  className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-swishjam-dark' : 'bg-swishjam'} hover:bg-swishjam-dark`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner color="white" /> : 'Create Report'}
                </Button>
              </form>
            </Form>
          </div>
        </div>


      </DialogContent>
    </Dialog>
  )
}