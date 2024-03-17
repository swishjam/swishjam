import { LuAlarmClock, LuFilter } from "react-icons/lu"
import LogRow from "./LogRow"
import { MailIcon, SlackIcon } from "lucide-react"

const ICONS_DICT = {
  'AutomationSteps::Delay': LuAlarmClock,
  'AutomationSteps::SlackMessage': SlackIcon,
  'AutomationSteps::ResendEmail': MailIcon,
  'AutomationSteps::Filter': LuFilter,
}

const includeStartedAndCompletedLogs = (executedStepType) => !['AutomationSteps::EntryPoint', 'AutomationSteps::Exit'].includes(executedStepType)

export default function ExecutedAutomationLogs({ executedAutomation, className = '', timestampFormatterOptions = { seconds: 'numeric', milliseconds: true } }) {
  return (
    <div className={`w-full rounded-md max-h-96 overflow-y-scroll overflow-x-hidden bg-gray-700 p-2 ${className}`}>
      {executedAutomation.started_at && (
        <LogRow
          timestampFormatterOptions={timestampFormatterOptions}
          log={{
            level: 'info',
            message: '~~ Beginning automation ~~',
            timestamp: executedAutomation.started_at
          }}
        />
      )}
      {executedAutomation.executed_automation_steps.map(executedStep => {
        return (
          <>
            {includeStartedAndCompletedLogs(executedStep.automation_step.type) && (
              <LogRow
                timestampFormatterOptions={timestampFormatterOptions}
                icon={ICONS_DICT[executedStep.automation_step.type]}
                textColor='text-yellow-500'
                log={{
                  level: 'start',
                  message: `-- Beginning ${executedStep.automation_step.friendly_type} automation step --`,
                  timestamp: executedStep.started_at
                }}
              />
            )}
            {executedStep.logs.map((log, i) => <LogRow key={i} log={log} timestampFormatterOptions={timestampFormatterOptions} />)}
            {includeStartedAndCompletedLogs(executedStep.automation_step.type) && executedStep.completed_at && !executedStep.error_message && (
              <LogRow
                timestampFormatterOptions={timestampFormatterOptions}
                icon={ICONS_DICT[executedStep.automation_step.type]}
                log={{
                  level: 'success',
                  message: `-- Completed ${executedStep.automation_step.friendly_type} automation step --`,
                  timestamp: executedStep.completed_at
                }}
              />
            )}
            {includeStartedAndCompletedLogs(executedStep.automation_step.type) && executedStep.error_message && (
              <LogRow
                timestampFormatterOptions={timestampFormatterOptions}
                icon={ICONS_DICT[executedStep.automation_step.type]}
                log={{
                  level: 'error',
                  message: `Error in ${executedStep.automation_step.friendly_type} automation step: ${executedStep.error_message}`,
                  timestamp: executedStep.completed_at
                }}
              />
            )}
            {includeStartedAndCompletedLogs(executedStep.automation_step.type) && executedStep.response_data && executedStep.response_data !== '{}' && (
              <LogRow
                timestampFormatterOptions={timestampFormatterOptions}
                log={{
                  level: 'json',
                  message: executedStep.response_data,
                  timestamp: executedStep.completed_at
                }}
              />
            )}
          </>
        )
      })}
      {executedAutomation.completed_at && (
        <LogRow
          timestampFormatterOptions={timestampFormatterOptions}
          log={{
            level: 'success',
            message: '~~ Automation completed ~~',
            timestamp: executedAutomation.completed_at
          }}
        />
      )}
    </div>
  )
}