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
import LoadingSpinner from '@components/LoadingSpinner';
import { toast } from 'sonner'

export default function AddReportModal({ onNewReport }) {
  const dialogRef = useRef(); 
  const form = useForm();
  const [ loading, setLoading ] = useState(false);
  const [ slackChannels, setSlackChannels ] = useState();
  
  async function onSubmit(values) {
    setLoading(true)
    console.log('Submission Values', values)
    if (!values.name || !values.slack_channel) {
    //if (!values.name || !values.cadence || !values.sending_mechanism || !values.slack_channel) {
      toast.error('All fields are required')
      console.error('All fields are required');
      console.error('All fields are required');
      setLoading(false);
      return;
    }
      //cadence: values.candence,
      //sending_mechanism: values.sending_mechanism,
    const { report, error } = await SwishjamAPI.Reports.create({
      name: values.name,
      cadence: 'daily',
      sending_mechanism: 'slack',
      config: {
        channel_id: values.slack_channel
      }
    })

    if (error) {
      console.error(error) 
      toast.error("Uh oh! Something went wrong.", {
        description: "Contact founders@swishjam.com for help",
      })
    }
  
    form.reset();
    setLoading(false);
    dialogRef.current.click();
    onNewReport(report)
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
        <LuPlus className="h-4 w-4 mt-0.5 mr-2"/> 
        Add Report
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Report</DialogTitle>
          <DialogDescription>
            Schedule an automated report of your key data to slack or via email  
          </DialogDescription>
        </DialogHeader> 

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
                      {slackChannels.map(c => <SelectItem key={c.id} className="cursor-pointer" value={c.id}>#{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className={`!mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-swishjam-dark':'bg-swishjam'} hover:bg-swishjam-dark`} 
              type="submit"
            >
              {loading ? <LoadingSpinner color="white"/>:'Create Report'}
            </Button>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}