'use client'

import { autoLayoutNodesAndEdges } from '@/lib/automation-builder/auto-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { LuArrowLeft } from 'react-icons/lu';
import { NodeTypes, EdgeTypes, CreateNewNode, CreateNewEdge } from '@/components/Automations/Flow/FlowHelpers';
import { useState, useEffect, useCallback } from 'react';

import ReactFlow, {
  ReactFlowProvider,
  Panel,
  Background,
  useNodesState,
  useEdgesState,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AutomationBuilder({ automation: providedAutomation, automationSteps, onSave, title = 'Edit Automation' }) {
  if (!providedAutomation) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <LoadingSpinner size={24} />
      </div>
    )
  }

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [automation, setAutomation] = useState(providedAutomation);

  const onNodeEdit = useCallback((nodeId, curNodes, curEdges) => {
    console.log('on node edit')
    setDialogOpen(true);
  }, [])

  const onNodeDelete = useCallback((nodeId, currentNodes, currentEdges) => {
    const newNodes = currentNodes.filter(n => n.id !== nodeId);
    const newEdges = currentEdges.filter(e => e.source !== nodeId);
    // TODO: figure out how to handle now disconnected nodes
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutNodesAndEdges(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [])

  const onAddNodeInEdge = useCallback(({ nodeType, data, edgeId, currentNodes, currentEdges, numEdgesToAdd = 1 }) => {
    const newPrimaryNode = CreateNewNode(null, nodeType, data, onNodeEdit, onNodeDelete)
    let newNodes = [newPrimaryNode]
    const removedEdge = currentEdges.find(edge => edge.id === edgeId);
    const remainingEdges = currentEdges.filter((edge) => edge.id !== edgeId)
    const previousNodeId = removedEdge.source;
    let newEdges = [
      CreateNewEdge(previousNodeId, newPrimaryNode.id, { onAddNode: onAddNodeInEdge }),
      CreateNewEdge(newPrimaryNode.id, removedEdge.target, { onAddNode: onAddNodeInEdge }),
    ]
    for (let i = 1; i < numEdgesToAdd; i++) {
      const newEndNode = CreateNewNode(null, 'End');
      const newEdge = CreateNewEdge(newPrimaryNode.id, newEndNode.id, { onAddNode: onAddNodeInEdge })
      newEdges.push(newEdge);
      newNodes.push(newEndNode)
    }
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutNodesAndEdges(
      [...currentNodes, ...newNodes],
      [...remainingEdges, ...newEdges]
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [])

  const renderCanvasFromAutomationSteps = async () => {
    const eventsAndCounts = await SwishjamAPI.Events.listUnique();
    const mappedNodesFromAutomationSteps = [];
    const mappedEdgesFromNextAutomationStepConditions = [];

    automationSteps.forEach(step => {
      mappedNodesFromAutomationSteps.push(CreateNewNode(step.id, step.type.split('::')[1], step.config, onNodeEdit, onNodeDelete))
      step.next_automation_step_conditions.forEach(condition => {
        mappedEdgesFromNextAutomationStepConditions.push(CreateNewEdge(step.id, condition.next_automation_step.id, { onAddNode: onAddNodeInEdge, condition }))
      })
    })

    const entryNode = CreateNewNode(null, 'Entry', {
      selectedEvent: automation.entry_point_event_name,
      eventOptions: eventsAndCounts.map(e => e.name).sort(),
      onUpdate: eventName => setAutomation({ ...automation, entry_point_event_name: eventName }),
    })

    const initialNodes = [entryNode, ...mappedNodesFromAutomationSteps, CreateNewNode(null, 'End')];

    let initialEdges = [
      CreateNewEdge(entryNode.id, initialNodes[1].id, { onAddNode: onAddNodeInEdge }),
      ...mappedEdgesFromNextAutomationStepConditions,
    ]
    if (automationSteps.length > 0) {
      initialEdges.push(CreateNewEdge(automationSteps[automationSteps.length - 1].id, initialNodes[initialNodes.length - 1].id, { onAddNode: onAddNodeInEdge }))
    }
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutNodesAndEdges(initialNodes, initialEdges);

    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }

  async function onSubmit() {
    console.log(nodes);
    console.log(edges);
    onSave({ automation, nodes, edges })
  }

  useEffect(() => {
    renderCanvasFromAutomationSteps();
  }, [])

  return (
    <ReactFlowProvider>
      <main className="relative h-screen w-screen overflow-clip">
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
          // panOnScrollMode='vertical'
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
                  <h1 className="text-lg font-medium text-gray-700 mb-0">{title}</h1>
                </div>
                <p className='text-sm font-medium leading-none flex items-center mb-1 mt-6'>Automation Name</p>
                <Input className='w-full' value={automation.name} onChange={e => setAutomation({ ...automation, name: e.target.value })} />
                <Button onClick={onSubmit} className="mt-4 w-full">Save Flow</Button>
              </div>
            </Panel>

            <Background variant="dots" gap={6} size={0.5} />
            <Controls />
          </ReactFlow>
        </div>


      </main>
    </ReactFlowProvider>
  )
}



