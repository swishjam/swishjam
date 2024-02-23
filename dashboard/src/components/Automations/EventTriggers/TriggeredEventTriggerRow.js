import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BadgeAlertIcon, BadgeCheckIcon, BanIcon, CalendarClockIcon, CopyIcon, RefreshCwIcon } from "lucide-react";
import CopiableText from "@/components/utils/CopiableText";
import EmailPreview from "@/components/Resend/EmailPreview";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useState } from "react";

export default function TriggeredEventTriggerRow({ triggeredEventTrigger, onRetrySuccess, onCancelSuccess }) {
  if (!triggeredEventTrigger.triggered_event_trigger_steps[0]) return <></>;

  const [isHovered, setIsHovered] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const triggeredStep = triggeredEventTrigger.triggered_event_trigger_steps[0];
  const triggerStepFailed = triggeredStep.error_message;
  const triggerStepSucceeded = !triggerStepFailed && triggeredStep.completed_at;
  const triggerStepIsPending = !triggerStepFailed && !triggerStepSucceeded;

  const onRetryClick = e => {
    setIsRetrying(true)
    e.preventDefault();
    SwishjamAPI.EventTriggers.TriggeredEventTriggers.retry(triggeredEventTrigger.event_trigger_id, triggeredEventTrigger.id).then(({ error, provided_triggered_event_trigger, new_triggered_event_trigger_retry }) => {
      setIsRetrying(false)
      if (error) {
        toast.error('Retry failed', { description: error });
      } else {
        onRetrySuccess({ newTrigger: new_triggered_event_trigger_retry, retriedTrigger: provided_triggered_event_trigger })
        toast.success('Successfully retried event trigger (refresh view to see the new retry trigger).');
      }
    })
  }

  const onCancelClick = e => {
    e.preventDefault();
    setIsCancelling(true)
    SwishjamAPI.EventTriggers.TriggeredEventTriggers.cancel(triggeredEventTrigger.event_trigger_id, triggeredEventTrigger.id).then(response => {
      setIsCancelling(false)
      if (response.error) {
        toast.error('Unable to cancel delivery', { description: response.error });
      } else {
        onCancelSuccess(response)
        toast.success('Successfully cancelled the scheduled delivery.');
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
          <AccordionTrigger className="cursor-pointer" chevronFirst={true} underline={false}>
            <div className="flex items-center justify-between w-full">
              <div className='flex items-center space-x-4'>
                {triggerStepFailed && <BadgeAlertIcon className='h-5 w-5 text-red-600' />}
                {triggerStepSucceeded && <BadgeCheckIcon className='h-5 w-5 text-green-600' />}
                {triggerStepIsPending && <CalendarClockIcon className='h-5 w-5 text-blue-500' />}
                <div className='text-left'>
                  <div className="block">
                    <span className='text-sm text-gray-600 mr-1'>To:</span>
                    <CopiableText value={triggeredStep.triggered_payload.resend_request_body?.to} onClick={e => e.preventDefault()}>
                      <span className="text-sm font-semibold text-gray-600">
                        {triggeredStep.triggered_payload.resend_request_body?.to}
                        <CopyIcon className='h-3 w-3 inline-block ml-1 transition-colors text-gray-600 group-hover:text-swishjam' />
                      </span>
                    </CopiableText>
                  </div>
                  <span className="text-xs flex text-gray-600 mt-2">
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
                {triggerStepIsPending && (
                  <button
                    className={`${isCancelling ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'} flex items-center outline rounded-sm outline-gray-200 px-4 py-2 text-xs text-gray-600 mb-2 transition-colors hover:text-red-400 hover:outline-red-100`}
                    disabled={isCancelling}
                    onClick={onCancelClick}
                  >
                    Cancel
                    <BanIcon className={`h-3 w-3 inline-block ml-1 ${isCancelling ? 'animate-spin' : ''}`} />
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