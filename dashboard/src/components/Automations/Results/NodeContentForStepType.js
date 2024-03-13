import EmailPreview from "@/components/Resend/EmailPreview"
import SlackMessagePreview from "@/components/Slack/SlackMessagePreview"
import { AccordionOpen } from "@/components/ui/accordion"
import DottedUnderline from "@/components/utils/DottedUnderline"
import MarkdownRenderer from "@/components/utils/MarkdownRenderer"
import { prettyDateTime } from "@/lib/utils/timeHelpers"
import { MailCheckIcon, MailIcon, MailWarningIcon, PauseCircleIcon } from "lucide-react"
import Image from "next/image"

const Content = ({ icon, title, children }) => (
  <>
    <div className='flex items-center space-x-2'>
      {icon}
      <h3 className='text-lg font-bold text-gray-700'>{title}</h3>
    </div>
    <div className='mt-4'>
      {children}
    </div>
  </>
)

const SlackNodeContent = ({ step, executedStep }) => {
  return (
    <Content
      icon={<Image src='/logos/slack.svg' className="h-5 w-5" width={20} height={20} />}
      title='Send Slack Message'
    >
      <>
        {executedStep?.error_message && <span className='block text-sm font-semibold text-red-700'>{executedStep.error_message}</span>}
        {executedStep?.status === 'completed' && (
          <span className='block text-sm text-gray-700 mb-1'>
            Message was delivered to <DottedUnderline>#{executedStep.execution_data.delivered_to_channel_name}</DottedUnderline> on <DottedUnderline>{prettyDateTime(executedStep.completed_at)}</DottedUnderline>.
          </span>
        )}
        <AccordionOpen className='group' trigger={<span className='group-hover:underline'>Preview Message</span>}>
          <SlackMessagePreview
            body={
              <MarkdownRenderer markdown={executedStep?.execution_data?.delivered_message_body || step.config.message_body} />
            }
            header={executedStep?.execution_data?.delivered_message_header || step.config.message_header}
            includePreviewBadge={false}
            includeReactionEmojis={false}
            timestamp={executedStep?.completed_at}
          />
        </AccordionOpen>
      </>
    </Content>
  )
}

const DelayNodeContent = ({ step, executedStep }) => {
  return (
    <Content
      icon={<PauseCircleIcon className='h-6 w-6  text-gray-700' />}
      title='Delay'
    >
      <span className='text-sm font-semibold text-gray-700'>

      </span>
      {!executedStep && <>Going to delay the next step by <DottedUnderline>{step.config.delay_amount} {step.config.delay_unit}</DottedUnderline></>}
      {executedStep?.status === 'pending' && <>Currently delaying the next step by <DottedUnderline>{step.config.delay_amount} {step.config.delay_unit}</DottedUnderline>, automation will resume on <DottedUnderline>{prettyDateTime(executedStep.execution_data.scheduled_to_be_executed_at)}</DottedUnderline>.</>}
      {executedStep?.status === 'completed' && <>Delayed the next step by <DottedUnderline>{step.config.delay_amount} {step.config.delay_unit}</DottedUnderline>, automation resumed on <DottedUnderline>{prettyDateTime(executedStep.completed_at)}</DottedUnderline>.</>}
    </Content>
  )
}

const ResendEmailNodeContent = ({ step, executedStep }) => {
  const icon = executedStep?.error_message
    ? <MailWarningIcon className='h-6 w-6  text-red-700' />
    : executedStep?.status === 'completed'
      ? <MailCheckIcon className='h-6 w-6 text-green-700' />
      : <MailIcon className='h-6 w-6 text-gray-700' />
  return (
    <Content icon={icon} title='Send Email'>
      {executedStep?.error_message && <span className='block text-sm font-semibold text-red-700'>{executedStep.error_message}</span>}
      {!executedStep?.completed_at && (
        <span className='block text-sm text-gray-700'>Email will be sent to <DottedUnderline>{step.config.to}</DottedUnderline>.</span>
      )}
      {executedStep?.completed_at && (
        <span className='block text-sm text-gray-700 mb-1'>
          Email was delivered to <DottedUnderline>{executedStep.execution_data.resend_request_body.to}</DottedUnderline> on <DottedUnderline>{prettyDateTime(executedStep.completed_at)}</DottedUnderline>.
        </span>
      )}
      <AccordionOpen className='group' trigger={<span className='group-hover:underline'>Preview Email</span>}>
        <EmailPreview
          to={executedStep?.execution_data?.resend_request_body?.to || step.config.to}
          from={executedStep?.execution_data?.resend_request_body?.from || step.config.from}
          subject={executedStep?.execution_data?.resend_request_body?.subject || step.config.subject}
          body={executedStep?.execution_data?.resend_request_body?.body || step.config.body}
          bcc={executedStep?.execution_data?.resend_request_body?.bcc || step.config.bcc}
          cc={executedStep?.execution_data?.resend_request_body?.cc || step.config.cc}
          replyTo={executedStep?.execution_data?.resend_request_body?.reply_to || step.config.reply_to}
          resendEmailId={executedStep?.execution_data?.resend_response?.id}
          includeResendPreviewBadge={false}
        />
      </AccordionOpen>
    </Content>
  )
}

export default function NodeContentForStepType({ step, executedStep }) {
  switch (step.type) {
    case 'AutomationSteps::SlackMessage':
      return <SlackNodeContent step={step} executedStep={executedStep} />
    case 'AutomationSteps::Delay':
      return <DelayNodeContent step={step} executedStep={executedStep} />
    case 'AutomationSteps::ResendEmail':
      return <ResendEmailNodeContent step={step} executedStep={executedStep} />
    default:
      return <h2>Step: {step.type}</h2>
  }
}