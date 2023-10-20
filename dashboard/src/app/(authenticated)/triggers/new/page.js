'use client'

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

const flowKey = 'example-flow';

const getNodeId = () => `randomnode_${+new Date()}`;

// const initialEdges = [];

const SaveRestore = () => {
  const initialNodes = [
    {
      id: '1',
      position: { x: 100, y: 100 },
      data: {
        label: (
          <>
            <div className='flex'>
              INITIAL NODE
            </div>
            <button
              className='absolute left-1/2 transform -translate-x-1/2 text-md rounded-full border border-black bg-white text-black h-8 w-8 flex items-center justify-center cursor-pointer transition-all scale-100 hover:scale-105 focus:scale-95 hover:bg-gray-50'
              onClick={() => addNode({ id: 'node-1', position: { x: 400, y: 0 } })}
            >
              Add
            </button>
          </>
        )
      },
    }
  ];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  const addNode = useCallback(parentNode => {
    debugger;
    const newNode = {
      id: getNodeId(),
      data: { label: 'Added node' },
      position: {
        x: parentNode.position.x,
        y: parentNode.position.y + 100,
        // x: Math.random() * window.innerWidth - 100,
        // y: Math.random() * window.innerHeight,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div className='w-full h-screen'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
      >
        <Background variant='dots' />
        <Controls />
        <Panel position="top-right">
          <button onClick={addNode}>add node</button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <SaveRestore />
  </ReactFlowProvider>
);





// 'use client';

// import { HandRaisedIcon } from '@heroicons/react/24/outline';
// import Image from 'next/image';
// import Logo from '@/components/Logo';
// import ReactFlow, { addEdge, applyNodeChanges, applyEdgeChanges, Background, Controls } from 'reactflow';
// import ResendImg from '@public/resend-logo.png';
// import SlackLogo from '@public/slack-logo.jpeg';
// import StripeImg from '@public/stripe-logo.jpeg';
// import { useState, useCallback } from 'react';
// import 'reactflow/dist/style.css';

// // const initialNodes = [
// //   {
// //     id: 'node-1',
// //     position: { x: 400, y: 0 },
// //     style: { width: '250px' },
// //     type: 'input',
// //     data: {
// //       label: (
// //         <div className='flex items-center gap-x-4 w-fit'>
// //           <Logo className='h-8' />
// //           <h5 className='text-center flex-grow'>On <span className='font-medium italic'>user_registered</span> event</h5>
// //         </div>
// //       )
// //     }
// //   },
// //   {
// //     id: 'node-2',
// //     style: { width: '250px' },
// //     position: { x: 0, y: 200 },
// //     data: {
// //       label: (
// //         <div className='flex items-center gap-x-4'>
// //           <Image src={StripeImg} className='h-8 w-8 border border-gray-200 rounded' />
// //           <h5 className='text-center flex-grow'>Update Stripe Customer</h5>
// //         </div>
// //       )
// //     }
// //   },
// //   {
// //     id: 'node-3',
// //     position: { x: 400, y: 200 },
// //     style: { width: '300px' },
// //     data: {
// //       label: (
// //         <div className='flex items-center gap-x-4'>
// //           <Image src={SlackLogo} className='h-8 w-8 border border-gray-200 rounded' />
// //           <h5 className='text-center flex-grow'>Post to #new-users Slack Channel</h5>
// //         </div>
// //       )
// //     },
// //   },
// //   {
// //     id: 'node-4',
// //     position: { x: 800, y: 200 },
// //     style: { width: '150px' },
// //     data: {
// //       label: (
// //         <div className='flex items-center gap-x-4'>
// //           <HandRaisedIcon className='h-8 w-8' />
// //           <h5 className='text-center flex-grow'>Wait 1 hour</h5>
// //         </div>
// //       )
// //     },
// //   },
// //   {
// //     id: 'node-5',
// //     position: { x: 800, y: 400 },
// //     style: { width: '200px' },
// //     data: {
// //       label: (
// //         <div className='flex items-center gap-x-4'>
// //           <Image src={ResendImg} className='h-8 w-8 border border-gray-200 rounded' />
// //           <h5 className='text-center flex-grow'>Send welcome email</h5>
// //         </div>
// //       )
// //     },
// //   },
// // ];

// // const initialEdges = [
// //   { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
// //   { id: 'edge-1-3', source: 'node-1', target: 'node-3' },
// //   { id: 'edge-1-4', source: 'node-1', target: 'node-4' },
// //   { id: 'edge-4-5', source: 'node-4', target: 'node-5' },
// // ];

// function Flow() {
//   const [nodes, setNodes] = useState([{
//     id: 'node-1',
//     position: { x: 400, y: 0 },
//     style: { width: '250px' },
//     data: {
//       label: (
//         <>
//           <div className='flex items-center gap-x-4 w-fit'>
//             <Logo className='h-8' />
//             <h5 className='text-center flex-grow'>On <span className='font-medium italic'>user_registered</span> event</h5>
//           </div>
//           <button
//             className='absolute left-1/2 transform -translate-x-1/2 text-md rounded-full border border-black bg-white text-black h-8 w-8 flex items-center justify-center cursor-pointer transition-all scale-100 hover:scale-105 focus:scale-95 hover:bg-gray-50'
//             onClick={() => addNode({ id: 'node-1', position: { x: 400, y: 0 } })}
//           >
//             Add
//           </button>
//         </>
//       )
//     }
//   }]);
//   const [edges, setEdges] = useState([]);

//   const addNode = useCallback(parentNode => {
//     const parentNodeIdInt = parseInt(parentNode.id.split('node-')[1]);
//     const newNodeIdInt = parentNodeIdInt + 1;
//     const newNodeId = `node-${newNodeIdInt}`
//     const newNodeConfig = {
//       id: newNodeId,
//       position: { x: 400, y: parentNode.position.y + 100 },
//       style: { width: '250px' },
//       type: 'input'
//     };
//     const newNode = {
//       ...newNodeConfig,
//       data: {
//         label: (
//           <>
//             <div className='flex items-center gap-x-4 w-fit'>
//               <h5 className='text-center flex-grow'>PLACEHOLDER</h5>
//             </div>
//             <button
//               className='absolute left-1/2 transform -translate-x-1/2 text-md rounded-full border border-black bg-white text-black h-8 w-8 flex items-center justify-center cursor-pointer transition-all scale-100 hover:scale-105 focus:scale-95 hover:bg-gray-50'
//               onClick={() => addNode(newNodeConfig)}
//             >
//               Add
//             </button>
//           </>
//         )
//       }
//     }
//     setNodes([...nodes, newNode])
//     setEdges([...edges, { id: `edge-${parentNodeIdInt}-${newNodeIdInt}`, source: parentNode.id, target: newNode.id }])
//   }, []);

//   // const onDrop = useCallback(
//   //   (event) => {
//   //     event.preventDefault();

//   //     const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
//   //     const type = event.dataTransfer.getData('application/reactflow');

//   //     // check if the dropped element is valid
//   //     if (typeof type === 'undefined' || !type) {
//   //       return;
//   //     }

//   //     const position = reactFlowInstance.project({
//   //       x: event.clientX - reactFlowBounds.left,
//   //       y: event.clientY - reactFlowBounds.top,
//   //     });
//   //     const newNode = {
//   //       id: getId(),
//   //       type,
//   //       position,
//   //       data: { label: `${type} node` },
//   //     };

//   //     setNodes((nds) => nds.concat(newNode));
//   //   },
//   //   [reactFlowInstance]
//   // );

//   const onNodesChange = useCallback(
//     (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
//     []
//   );
//   const onEdgesChange = useCallback(
//     (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
//     []
//   );

//   const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);


//   console.log('nodes', nodes)
//   console.log('edges', edges)

//   return (
//     <div className='w-full h-screen'>
//       <ReactFlow
//         nodes={nodes}
//         onNodesChange={onNodesChange}
//         edges={edges}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//       >
//         <Background variant='dots' />
//         <Controls />
//       </ReactFlow>
//     </div>
//   );
// }

// export default Flow;
