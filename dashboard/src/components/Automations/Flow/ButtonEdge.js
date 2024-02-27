import React from 'react';
import { AddNewNodePopover } from '@/components/Automations/Flow/AddNewNodePopover';
import {
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
  style={},
  markerEnd,
  data,
}) {
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onAddNode = (nodeType) => {
    console.log('edgeId', id)
    console.log('nodeType', nodeType)
    data.onAddNode(nodeType)
    // console.log('all Nodes', nodes)
    // console.log('all edges', edges)
    // let newNode = { id: 'asdfasdf', position: { x: 0, y: 1000 }, data: { onChange: () => console.log('change'), width: NodeWidth, height: NodeHeight, content: { label: 'poop' }, }, type: 'slack' };
    // setNodes([...nodes, newNode])
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
          {/* <Button onClick={() => onEdgeClick(id)} className="bg-swishjam hover:bg-swishjam-dark">
            <LuPlus size={16} className='' />
          </Button> */}
          <AddNewNodePopover onSelection={onAddNode} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
