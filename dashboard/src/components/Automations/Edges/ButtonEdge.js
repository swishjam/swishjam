import { AddNewNodePopover } from '@/components/Automations/Edges/AddNewNodePopover';
import useAutomationBuilder from '@/hooks/useAutomationBuilder';
import { CheckIcon } from 'lucide-react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';

export function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) {
  const { addNodeInEdge, isLoading } = useAutomationBuilder();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onAddNode = nodeType => {
    addNodeInEdge({ nodeType, data: {}, edgeId: id, numEdgesToAdd: nodeType === 'IfElse' ? 2 : 1 })
  };

  const maybeSatisfiedConditionStyles = data.satisfied_at ? { stroke: 'rgb(34 197 94)', strokeWidth: 2 } : {};
  const isExecutionResult = !!data.satisfied_at;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, ...maybeSatisfiedConditionStyles }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {isExecutionResult
            ? (
              <div className='p-1 rounded-full bg-green-100 hover:bg-green-200 transition-all'>
                <CheckIcon className='h-4 w-4 text-gray-700' />
              </div>
            ) : <AddNewNodePopover disabled={isLoading} onSelection={onAddNode} />
          }
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
