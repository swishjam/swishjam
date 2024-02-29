
import ExecutionResultBadge from './ExecutionResultBadge';
import NodeContentForStepType from './NodeContentForStepType';

export default function AutomationStepResultNode({ executedStep: maybeExecutedStep, step }) {
  const borderColor = maybeExecutedStep?.status === 'completed'
    ? 'border-l-4 border-l-green-500'
    : maybeExecutedStep?.status === 'failed'
      ? 'border-l-4 border-l-red-500'
      : maybeExecutedStep?.status === 'pending'
        ? 'border-l-4 border-l-blue-500'
        : ''
  return (
    <div className={`relative border rounded-md w-96 p-8 transition-all hover:bg-gray-50 border-gray-200 ${borderColor}`}>
      {maybeExecutedStep && <ExecutionResultBadge executedStep={maybeExecutedStep} />}
      <NodeContentForStepType step={step} executedStep={maybeExecutedStep} />
    </div>
  )
}