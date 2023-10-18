'use client';

import { HandRaisedIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '@/components/Logo';
import ReactFlow, { addEdge, applyNodeChanges, applyEdgeChanges, Background, Controls } from 'reactflow';
import ResendImg from '@public/resend-logo.png';
import SlackLogo from '@public/slack-logo.jpeg';
import StripeImg from '@public/stripe-logo.jpeg';
import { useState, useCallback } from 'react';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: 'node-1',
    position: { x: 400, y: 0 },
    style: { width: '250px' },
    type: 'input',
    data: {
      label: (
        <div className='flex items-center gap-x-4 w-fit'>
          <Logo className='h-8' />
          <h5 className='text-center flex-grow'>On <span className='font-medium italic'>user_registered</span> event</h5>
        </div>
      )
    }
  },
  {
    id: 'node-2',
    style: { width: '250px' },
    position: { x: 0, y: 200 },
    data: {
      label: (
        <div className='flex items-center gap-x-4'>
          <Image src={StripeImg} className='h-8 w-8 border border-gray-200 rounded' />
          <h5 className='text-center flex-grow'>Update Stripe Customer</h5>
        </div>
      )
    }
  },
  {
    id: 'node-3',
    position: { x: 400, y: 200 },
    style: { width: '300px' },
    data: {
      label: (
        <div className='flex items-center gap-x-4'>
          <Image src={SlackLogo} className='h-8 w-8 border border-gray-200 rounded' />
          <h5 className='text-center flex-grow'>Post to #new-users Slack Channel</h5>
        </div>
      )
    },
  },
  {
    id: 'node-4',
    position: { x: 800, y: 200 },
    style: { width: '150px' },
    data: {
      label: (
        <div className='flex items-center gap-x-4'>
          <HandRaisedIcon className='h-8 w-8' />
          <h5 className='text-center flex-grow'>Wait 1 hour</h5>
        </div>
      )
    },
  },
  {
    id: 'node-5',
    position: { x: 800, y: 400 },
    style: { width: '200px' },
    data: {
      label: (
        <div className='flex items-center gap-x-4'>
          <Image src={ResendImg} className='h-8 w-8 border border-gray-200 rounded' />
          <h5 className='text-center flex-grow'>Send welcome email</h5>
        </div>
      )
    },
  },
];

const initialEdges = [
  { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
  { id: 'edge-1-3', source: 'node-1', target: 'node-3' },
  { id: 'edge-1-4', source: 'node-1', target: 'node-4' },
  { id: 'edge-4-5', source: 'node-4', target: 'node-5' },
];

function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);


  return (
    <div className='w-full h-screen'>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background variant='dots' />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Flow;
