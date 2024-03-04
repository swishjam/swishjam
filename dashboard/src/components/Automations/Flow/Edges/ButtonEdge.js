import React from 'react';
import { AddNewNodePopover } from '@/components/Automations/Flow/Edges/AddNewNodePopover';
import {
  useNodes,
  useEdges,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
} from 'reactflow';

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

  const allNodes = useNodes();
  const allEdges = useEdges();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onAddNode = (nodeType) => {
    if (nodeType === 'IfElse') {
      data.onAddNode({ nodeType, data, edgeId: id, currentNodes: allNodes, currentEdges: allEdges, numEdgesToAdd: 2 })
    } else {
      data.onAddNode({ nodeType, data, edgeId: id, currentNodes: allNodes, currentEdges: allEdges })
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
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
          <AddNewNodePopover onSelection={onAddNode} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
