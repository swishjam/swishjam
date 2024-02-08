import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CalendarClockIcon, MailCheckIcon, MailWarningIcon } from "lucide-react";
import EmailPreview from "@/components/Resend/EmailPreview";
import { prettyDateTime } from "@/lib/utils/timeHelpers";

export default function TriggeredEventTriggerRow({ triggeredEventTrigger }) {
  const triggeredStep = triggeredEventTrigger.triggered_event_trigger_steps[0]
  if (!triggeredStep) return <></>;

  const triggerStepFailed = triggeredStep.error_message;
  const triggerStepSucceeded = !triggerStepFailed && triggeredStep.completed_at;
  const triggerStepIsPending = !triggerStepFailed && !triggerStepSucceeded;

  return (
    <li className='bg-white relative border border-zinc-200 shadow-sm rounded-sm transition-colors hover:bg-gray-50 p-4'>
      <Accordion type="single" collapsible>
        <AccordionItem value='1' className="border-none">
          <AccordionTrigger
            className="cursor-pointer"
            chevronFirst={true}
            underline={false}
          >
            <div className="flex items-center justify-between w-full">
              <div className='flex items-center space-x-4'>
                {triggerStepFailed && <MailWarningIcon className='h-5 w-5 text-red-600' />}
                {triggerStepSucceeded && <MailCheckIcon className='h-5 w-5 text-green-600' />}
                {triggerStepIsPending && <CalendarClockIcon className='h-5 w-5 text-blue-500' />}
                <div className='text-left'>
                  <span className="block text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto">
                    To: {triggeredStep.triggered_payload.resend_request_body?.to}
                  </span>
                  <span className="text-xs text-gray-600">
                    {triggerStepSucceeded && <span className='text-green-600'>Delivered {prettyDateTime(triggeredStep.completed_at)}</span>}
                    {triggerStepFailed && <span className='text-red-600'>{triggeredStep.error_message}</span>}
                    {triggerStepIsPending && <span className='text-blue-500'>Scheduled to be delivered at {prettyDateTime(triggeredStep.triggered_payload.scheduled_delivery_for)}</span>}
                  </span>
                </div>
              </div>
              <span className="text-xs leading-6 text-gray-600 hover:underline">
                View Details
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div>
              <EmailPreview
                resendEmailId={triggeredStep.triggered_payload.resend_response?.id}
                to={triggeredStep.triggered_payload.resend_request_body.to}
                from={triggeredStep.triggered_payload.resend_request_body.from}
                cc={triggeredStep.triggered_payload.resend_request_body.cc}
                bcc={triggeredStep.triggered_payload.resend_request_body.bcc}
                subject={triggeredStep.triggered_payload.resend_request_body.subject}
                body={triggeredStep.triggered_payload.resend_request_body.text}
                className="border-none"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion >
    </li>
  )
}