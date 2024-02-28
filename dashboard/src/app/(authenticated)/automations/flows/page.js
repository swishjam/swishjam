'use client'

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { LuArrowLeft } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NodeTypes, NodeWidth, NodeHeight } from '@/components/Automations/Flow/FlowHelpers';
import { ButtonEdge } from '@/components/Automations/Flow/ButtonEdge';

import ReactFlow, {
  ReactFlowProvider,
  useNodes,
  Panel, 
  Background,
  useNodesState,
  useEdgesState,
  // Handle,
  // Position,
  // NodeToolbar,
  // MiniMap,
  // Controls,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));


const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NodeWidth, height: NodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node, index) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    if(index === 0) {
      node.position = {
        x: nodeWithPosition.x - NodeWidth / 2,
        y: nodeWithPosition.y - NodeHeight,
      };
    } else {
      node.position = {
        x: nodeWithPosition.x - NodeWidth / 2,
        y: nodeWithPosition.y*1.2 - NodeHeight,
      };
    }

    return node;
  });

  return { nodes, edges };
};

const createNewNode = (id, type, data, onChange) => {
  let nid = id || 'new-'+Math.random().toString(36);
   
  return {
    id: nid,
    position: { x: 0, y: 0 },
    data: { onChange, width: NodeWidth, height: NodeHeight, content: data },
    draggable: false, 
    type
  }
}

const createNewEdge = (source, target, data, type = 'buttonedge') => {
  return { 
    id: `e${source}-${target}`,
    source,
    target,
    type,
    data
  }
}

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const initialNodes = [
      createNewNode('1', 'trigger', { label: 'poop' }, () => console.log('change')),
      createNewNode('2', 'slack', { label: 'poop' }, () => console.log('change')),
      createNewNode('3', 'slack', { label: 'poop' }, () => console.log('change')),
      createNewNode('4', 'end', null, null),
    ];
    const initialEdges = [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge', data: { onAddNode: onAddNodeInEdge } },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge', data: { onAddNode: onAddNodeInEdge } },
      { id: 'e3-4', source: '3', target: '4', type: 'buttonedge', data: { onAddNode: onAddNodeInEdge } },
    ];
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    // setNodes((nds) => nds.concat(layoutedNodes)); 
    // setEdges((egs) => egs.concat(layoutedEdges)); 
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  },[])

  const onAddNodeInEdge = useCallback((nodeType, edgeId) => {
    console.log(`onAddNodeInEdge for Edge id: ${edgeId}`, nodeType)
    let newNode = createNewNode(null, nodeType, { label: 'poop' }, () => console.log('change'))
  
    // find the edge from edges that matches edgeId
    console.log('Edges', edges)
    const removedEdge = edges.find(edge => edge.id === edgeId);
    console.log('Removed Edge', removedEdge)
    const remainingEdges = edges.filter((edge) => edge.id !== edgeId)
    // create 2 new edges 
    const newEdge1 = createNewEdge(removedEdge.source, newNode.id, { onAddNode: onAddNodeInEdge }) 
    const newEdge2 = createNewEdge(newNode.id, removedEdge.target, { onAddNode: onAddNodeInEdge })
    console.log('New Edges 1', newEdge1)
    console.log('New Edges 2', newEdge2)

    // setNodes((nds) => nds.concat(newNode));
    // setEdges((egs) => egs.concat(newEdge1, newEdge2));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      [...nodes, newNode],
      [...remainingEdges, newEdge1, newEdge2]
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges])

 


  const edgeTypes = {
    buttonedge: ButtonEdge,
  };

  async function onSubmit(triggerValue, onSuccess, onError) {
    const { trigger, error } = await SwishjamAPI.EventTriggers.create(triggerValue)
    if (error) {
      onError(error)
      return
    } else {
      onSuccess(trigger)
    }
  }
  // mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 
  return (
    <ReactFlowProvider>
    <main className="relative h-screen w-screen overflow-hidden overflow-clip">
      <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange} 
          nodeTypes={NodeTypes} 
          edgeTypes={edgeTypes} 
          snapToGrid={true}
          defaultViewport={{ x: 600, y: 100, zoom: 1 }}
          elementsSelectable={false}
          panOnScroll={true}
          panOnScrollMode='vertical' 
        >
          <Panel position="top-left">
            <div className='w-80 p-4 ml-6 mt-6 bg-white border border-gray-200 rounded-md mb-6'>
              <div>
                <Link
                  className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
                  href="/automations"
                >
                  <LuArrowLeft className='inline mr-1' size={12} />
                  Back to all Automation Flows
                </Link>
                <h1 className="text-lg font-medium text-gray-700 mb-0">New Automation</h1>
              </div>
              <p className='text-sm font-medium leading-none flex items-center mb-1 mt-6'>Automation Name</p>
              <Input className='w-full' /> 
              <Button className="mt-4 w-full">Save Flow</Button>
            </div>
          </Panel>

          <Background variant="dots" gap={6} size={0.5} />
        </ReactFlow>
      </div>
    </main>
    </ReactFlowProvider> 
  )
}