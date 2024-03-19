import { LuAlarmClock, LuFilter } from "react-icons/lu"
import LogRow from "./LogRow"
import { MailIcon, PlayCircleIcon, SlackIcon } from "lucide-react"

const ICONS_DICT = {
  'AutomationSteps::Delay': LuAlarmClock,
  'AutomationSteps::SlackMessage': SlackIcon,
  'AutomationSteps::ResendEmail': MailIcon,
  'AutomationSteps::Filter': LuFilter,
}

const includeStartedAndCompletedLogs = (executedStepType) => !['AutomationSteps::EntryPoint', 'AutomationSteps::Exit', 'AutomationSteps::Filter'].includes(executedStepType)

export default function ExecutedAutomationLogs({ executedAutomation, className = '', timestampFormatterOptions = { seconds: 'numeric', milliseconds: true } }) {
  const supplementedExecutionLogs = [
    executedAutomation.started_at && {
      level: 'start',
      icon: PlayCircleIcon,
      color: 'green',
      message: '~~ Beginning automation ~~',
      timestamp: executedAutomation.started_at,
    },
    executedAutomation.completed_at && {
      level: 'success',
      message: '~~ Automation completed ~~',
      timestamp: executedAutomation.completed_at,
    },
    ...executedAutomation.executed_automation_steps.map(executedStep => {
      return [
        ...executedStep.logs.map(log => ({ ...log, icon: ICONS_DICT[executedStep.automation_step.type] })),
        includeStartedAndCompletedLogs(executedStep.automation_step.type) && {
          level: 'start',
          icon: ICONS_DICT[executedStep.automation_step.type],
          color: 'yellow',
          message: `Beginning ${executedStep.automation_step.friendly_type} automation step`,
          timestamp: executedStep.started_at,
        },
        includeStartedAndCompletedLogs(executedStep.automation_step.type) && executedStep.completed_at && !executedStep.error_message && {
          level: 'success',
          icon: ICONS_DICT[executedStep.automation_step.type],
          message: `Completed ${executedStep.automation_step.friendly_type} automation step`,
          metadata: executedStep.response_data,
          timestamp: executedStep.completed_at,
        },
        executedStep.error_message && {
          level: 'error',
          icon: ICONS_DICT[executedStep.automation_step.type],
          message: `Error in ${executedStep.automation_step.friendly_type} automation step: ${executedStep.error_message}`,
          metadata: executedStep.response_data,
          timestamp: executedStep.completed_at,
        },
      ]
    })
  ].flat().filter(Boolean).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  return (
    <div className={`w-full rounded-md max-h-96 overflow-y-scroll overflow-x-hidden bg-white border border-gray-200 p-2 ${className}`}>
      {supplementedExecutionLogs.map((log, i) => (
        <LogRow
          key={i}
          log={log}
          icon={log.icon}
          color={log.color}
          timestampFormatterOptions={timestampFormatterOptions}
        />
      ))}
    </div>
  )
}