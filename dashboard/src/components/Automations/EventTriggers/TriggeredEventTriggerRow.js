import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BadgeAlertIcon, BadgeCheckIcon, CalendarClockIcon, RefreshCwIcon } from "lucide-react";
import EmailPreview from "@/components/Resend/EmailPreview";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";

export default function TriggeredEventTriggerRow({ triggeredEventTrigger }) {
  const triggeredStep = triggeredEventTrigger.triggered_event_trigger_steps[0]
  if (!triggeredStep) return <></>;

  const [isHovered, setIsHovered] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const triggerStepFailed = triggeredStep.error_message;
  const triggerStepSucceeded = !triggerStepFailed && triggeredStep.completed_at;
  const triggerStepIsPending = !triggerStepFailed && !triggerStepSucceeded;

  const onRetryClick = e => {
    setIsRetrying(true)
    e.preventDefault();
    SwishjamAPI.EventTriggers.TriggeredEventTriggers.retry(triggeredEventTrigger.event_trigger_id, triggeredEventTrigger.id).then(({ error, new_triggered_event_trigger }) => {
      setIsRetrying(false)
      if (error) {
        toast.error('Retry failed', { description: error });
      } else {
        toast.success('Retry successful, find the results on page 1.');
      }
    })
  }

  return (
    <li
      className='bg-white relative border border-zinc-200 shadow-sm rounded-sm transition-colors hover:bg-gray-50 p-4'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value='1' className="border-none">
          <AccordionTrigger
            className="cursor-pointer"
            chevronFirst={true}
            underline={false}
          >
            <div className="flex items-center justify-between w-full">
              <div className='flex items-center space-x-4'>
                {triggerStepFailed && <BadgeAlertIcon className='h-5 w-5 text-red-600' />}
                {triggerStepSucceeded && <BadgeCheckIcon className='h-5 w-5 text-green-600' />}
                {triggerStepIsPending && <CalendarClockIcon className='h-5 w-5 text-blue-500' />}
                <div className='text-left'>
                  <span className="block text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto">
                    To: {triggeredStep.triggered_payload.resend_request_body?.to}
                  </span>
                  <span className="text-xs flex text-gray-600">
                    {triggerStepSucceeded && <span className='text-gray-600'>Delivered {prettyDateTime(triggeredStep.completed_at)}</span>}
                    {triggerStepFailed && <span className='text-red-600'>{triggeredStep.error_message}</span>}
                    {triggerStepIsPending && <span className='text-blue-500'>Scheduled to be delivered on {prettyDateTime(triggeredStep.triggered_payload.scheduled_delivery_for)}</span>}
                  </span>
                </div>
              </div>
              <div className='flex flex-col justify-end'>
                {triggerStepFailed && !triggeredEventTrigger.retried_triggered_event_trigger_id && (
                  <button
                    className={`${isRetrying ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'} outline rounded-sm outline-gray-200 px-4 py-2 text-xs text-gray-600 mb-2 transition-colors hover:bg-gray-100 flex items-center`}
                    disabled={isRetrying}
                    onClick={onRetryClick}
                  >
                    Retry
                    <RefreshCwIcon className={`h-3 w-3 inline-block ml-1 ${isRetrying ? 'animate-spin' : ''}`} />
                  </button>
                )}
                <span className="text-xs leading-6 text-gray-600 hover:underline">
                  View Details
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className='border-t border-gray-200 pt-2'>
              <EmailPreview
                resendEmailId={triggeredStep.triggered_payload.resend_response?.id}
                to={triggeredStep.triggered_payload.resend_request_body.to}
                from={triggeredStep.triggered_payload.resend_request_body.from}
                replyTo={triggeredStep.triggered_payload.resend_request_body.reply_to}
                cc={triggeredStep.triggered_payload.resend_request_body.cc}
                bcc={triggeredStep.triggered_payload.resend_request_body.bcc}
                subject={triggeredStep.triggered_payload.resend_request_body.subject}
                body={triggeredStep.triggered_payload.resend_request_body.text}
                className={`border-none shadow-none ${isHovered ? 'bg-gray-50' : ''}`}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion >
    </li>
  )
}