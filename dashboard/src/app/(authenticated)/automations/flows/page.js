'use client'

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
  MiniMap,
  Controls,
  Panel, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle, Position, NodeToolbar,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { KeyIcon } from 'lucide-react';

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
    console.log(index)
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

const createNewNode = (id, type, data, onChange,) => {
  let nid = id || 'new-'+Math.random().toString(36);
   
  return {
    id: nid,
    position: { x: 0, y: 0 },
    data: { onChange, width: NodeWidth, height: NodeHeight, content: data },
    type
  }
}

export default function FlowEditor() {

  
  const onAddNodeInEdge = (nodeType, edgeId) => {
    console.log('nodeType, onaddnode in edge', nodeType)
    let newNode = createNewNode(null, nodeType, { label: 'poop' }, () => console.log('change'))
    setNodes([
      ...nodes,
      newNode
    ])
  }

  const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { onChange: () => console.log('change'), width: NodeWidth, height: NodeHeight, content: { label: 'poop' }, }, type: 'trigger' },
    { id: '2', position: { x: 0, y: 0 }, data: { onChange: () => console.log('change'), width: NodeWidth, height: NodeHeight, content: { label: 'poop' }, }, type: 'slack' },
    { id: '3', position: { x: 0, y: 0 }, data: { onChange: () => console.log('change'), width: NodeWidth, height: NodeHeight, content: { label: 'poop' }, }, type: 'slack' },
    { id: '4', position: { x: 0, y: 0 }, data: { width: NodeWidth, height: NodeHeight }, type: 'end' },
  ];
  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', type: 'buttonedge', data: { onAddNode: onAddNodeInEdge}},
    { id: 'e2-3', source: '2', target: '3', type: 'buttonedge', data: { onAddNode: onAddNodeInEdge}},
    { id: 'e3-4', source: '3', target: '4', type: 'buttonedge', data: { onAddNode: onAddNodeInEdge}},
  ];

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

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