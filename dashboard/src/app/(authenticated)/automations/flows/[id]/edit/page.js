'use client'

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { LuArrowLeft } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NodeTypes, EdgeTypes, NodeWidth, NodeHeight,
  CreateNewNode, CreateNewEdge
} from '@/components/Automations/Flow/FlowHelpers';

import ReactFlow, {
  useReactFlow,
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
    if (index === 0) {
      node.position = {
        x: 0, //nodeWithPosition.x,
        // x: nodeWithPosition.x - NodeWidth / 2,
        y: nodeWithPosition.y - NodeHeight,
      };
    } else {
      node.position = {
        x: 0, //nodeWithPosition.x,
        y: nodeWithPosition.y * 1.2 - NodeHeight,
      };
    }

    return node;
  });

  return { nodes, edges };
};

export default function FlowEditor({ params }) {
  const { id: automationId } = params;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [automation, setAutomation] = useState();

  const onNodeEdit = useCallback((nodeId, curNodes, curEdges) => {
    console.log('on node edit')
    setDialogOpen(true);
  }, [])

  const onNodeDelete = useCallback((nodeId, curNodes, curEdges) => {
    console.log('on node delete')
  }, [])

  const onAddNodeInEdge = useCallback(({ nodeType, data, edgeId, currentNodes, currentEdges }) => {
    const newNode = CreateNewNode(null, nodeType, data, onNodeEdit, onNodeDelete)
    const removedEdge = currentEdges.find(edge => edge.id === edgeId);
    const remainingEdges = currentEdges.filter((edge) => edge.id !== edgeId)
    const newEdge1 = CreateNewEdge(removedEdge.source, newNode.id, { onAddNode: onAddNodeInEdge })
    const newEdge2 = CreateNewEdge(newNode.id, removedEdge.target, { onAddNode: onAddNodeInEdge })
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      [...currentNodes, newNode],
      [...remainingEdges, newEdge1, newEdge2]
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [])

  useEffect(() => {
    SwishjamAPI.Automations.retrieve(automationId).then(setAutomation)
    SwishjamAPI.Automations.AutomationSteps.list(automationId).then(steps => {
      const mappedNodesFromAutomationSteps = [];
      const mappedEdgesFromNextAutomationStepConditions = [];
      steps.forEach(step => {
        mappedNodesFromAutomationSteps.push(CreateNewNode(step.id, step.type.split('::')[1], step.config, onNodeEdit, onNodeDelete))
        step.next_automation_step_conditions.forEach(condition => {
          mappedEdgesFromNextAutomationStepConditions.push(CreateNewEdge(step.id, condition.next_automation_step.id, { onAddNode: onAddNodeInEdge, condition }))
        })
      })
      const initialNodes = [
        CreateNewNode('entry-point', 'trigger', {}, onNodeEdit, onNodeDelete),
        ...mappedNodesFromAutomationSteps,
        CreateNewNode('end-node', 'end'),
      ];

      const initialEdges = [
        CreateNewEdge('entry-point', steps[0].id, { onAddNode: onAddNodeInEdge }),
        ...mappedEdgesFromNextAutomationStepConditions,
        // TODO: if a node has no next_automation_step_conditions, create an edge to an end-node
        CreateNewEdge(steps[steps.length - 1].id, 'end-node', { onAddNode: onAddNodeInEdge }),
      ];
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
    })
  }, [automationId])

  async function onSubmit() {
    console.log(nodes);
    console.log(edges);
  }

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
            edgeTypes={EdgeTypes}
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
                  <h1 className="text-lg font-medium text-gray-700 mb-0">Edit Automation</h1>
                </div>
                <p className='text-sm font-medium leading-none flex items-center mb-1 mt-6'>Automation Name</p>
                <Input className='w-full' value={automation?.name} onChange={e => setAutomation({ ...automation, name: e.target.value })} />
                <Button onClick={onSubmit} className="mt-4 w-full">Save Flow</Button>
              </div>
            </Panel>

            <Background variant="dots" gap={6} size={0.5} />
          </ReactFlow>
        </div>


      </main>
    </ReactFlowProvider>
  )
}



