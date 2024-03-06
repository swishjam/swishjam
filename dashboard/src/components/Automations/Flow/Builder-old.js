'use client'

import AutomationBuilderProvider from '@/providers/AutomationBuilderProvider';
import { autoLayoutNodesAndEdges } from '@/lib/automations-helpers';
import { Button } from '@/components/ui/button';
import CommonQueriesProvider from '@/providers/CommonQueriesProvider';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LuArrowLeft } from 'react-icons/lu';
import { NodeTypes, EdgeTypes, createNewEdge, createNewNode } from '@/lib/automations-helpers';
import { TestTube2Icon } from 'lucide-react';
import TestExecutionModal from './TestExecutionModal';
import { useEffect, useCallback, useState } from 'react';

import ReactFlow, { Panel, Background, useNodesState, useEdgesState, Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import TopPanel from './TopPanel';
import SidePanel from './SidePanel';
import useAutomationBuilder from '@/hooks/useAutomationBuilder';

export default function AutomationBuilder({
  automationName,
  automationSteps,
  canvasWidth = 'w-full',
  canvasHeight = 'h-screen',
  isLoading = false,
  includeControls = true,
  includePanel = true,
  onAutomationNameUpdated,
  onSave,
  title = 'Edit Automation'
}) {
  if (!automationSteps) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <LoadingSpinner size={10} />
      </div>
    )
  }

  const { buildNodesAndEdgesFromAutomationSteps } = useAutomationBuilder();
  const { nodes: initialNodes, edges: initialEdges } = buildNodesAndEdgesFromAutomationSteps(automationSteps);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [testExecutionModalIsOpen, setTestExecutionModalIsOpen] = useState(false);

  const onNodeDelete = useCallback((nodeId, currentNodes, currentEdges) => {
    const leftoverNodes = currentNodes.filter(n => n.id !== nodeId);
    const leftoverEdges = currentEdges.filter(e => e.source !== nodeId && e.target !== nodeId);
    const removedEdges = currentEdges.filter(e => e.source == nodeId || e.target == nodeId);

    let newEdgeTarget = null;
    let newEdgeSource = null;
    removedEdges.forEach(edge => {
      if (edge.target === nodeId) {
        newEdgeSource = edge.source;
      }
      if (edge.source === nodeId) {
        newEdgeTarget = edge.target;
      }
    })
    const newEdge = createNewEdge({ source: newEdgeSource, target: newEdgeTarget, onAddNode: onAddNodeInEdge });
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutNodesAndEdges(leftoverNodes, [...leftoverEdges, newEdge]);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [])

  const updateNode = useCallback(({ id, data, currentNodes }) => {
    const node = currentNodes.find(n => n.id === id);
    const updatedNode = { ...node, data }
    const updatedNodes = currentNodes.map(n => n.id === id ? updatedNode : n);
    setNodes(updatedNodes);
  }, [])

  const onAddNodeInEdge = useCallback(({ nodeType, data, edgeId, currentNodes, currentEdges, numEdgesToAdd = 1 }) => {
    const newPrimaryNode = createNewNode({
      type: nodeType,
      onUpdate: updateNode,
      onDelete: onNodeDelete,
      data,
    })
    let newNodes = [newPrimaryNode]
    const removedEdge = currentEdges.find(edge => edge.id === edgeId);
    const remainingEdges = currentEdges.filter((edge) => edge.id !== edgeId)
    const previousNodeId = removedEdge.source;
    let newEdges = [
      createNewEdge({ source: previousNodeId, target: newPrimaryNode.id, onAddNode: onAddNodeInEdge }),
      createNewEdge({ source: newPrimaryNode.id, target: removedEdge.target, onAddNode: onAddNodeInEdge }),
    ]
    for (let i = 1; i < numEdgesToAdd; i++) {
      const newEndNode = createNewNode({ type: 'Exit' });
      const newEdge = createNewEdge({ source: newPrimaryNode.id, target: newEndNode.id, onAddNode: onAddNodeInEdge })
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

  // const buildNodesAndEdgesFromAutomationSteps = automationSteps => {
  //   let initialNodes = [];
  //   let initialEdges = [];

  //   if (automationSteps.length === 0) {
  //     const entryNode = createNewNode({ type: 'EntryPoint', onUpdate: updateNode })
  //     const exitNode = createNewNode({ type: 'Exit' })
  //     initialNodes = [entryNode, exitNode];
  //     initialEdges = [createNewEdge({ source: entryNode.id, target: exitNode.id, onAddNode: onAddNodeInEdge })]
  //   } else {
  //     automationSteps.forEach(step => {
  //       const node = createNewNode({
  //         id: step.id,
  //         type: step.type.split('::')[1],
  //         data: step.config,
  //         onUpdate: updateNode,
  //         onDelete: onNodeDelete,
  //       })
  //       initialNodes.push(node)
  //       step.next_automation_step_conditions.forEach(condition => {
  //         const edge = createNewEdge({ source: step.id, target: condition.next_automation_step.id, onAddNode: onAddNodeInEdge, data: { ...condition } })
  //         initialEdges.push(edge)
  //       })
  //     })
  //   }
  //   return autoLayoutNodesAndEdges(initialNodes, initialEdges);
  // }

  // const renderCanvasFromAutomationSteps = async () => {
  //   let initialNodes = [];
  //   let initialEdges = [];

  //   if (automationSteps.length === 0) {
  //     const entryNode = createNewNode({ type: 'EntryPoint', onUpdate: updateNode })
  //     const exitNode = createNewNode({ type: 'Exit' })
  //     initialNodes = [entryNode, exitNode];
  //     initialEdges = [createNewEdge({ source: entryNode.id, target: exitNode.id, onAddNode: onAddNodeInEdge })]
  //   } else {
  //     automationSteps.forEach(step => {
  //       const node = createNewNode({
  //         id: step.id,
  //         type: step.type.split('::')[1],
  //         data: step.config,
  //         onUpdate: updateNode,
  //         onDelete: onNodeDelete,
  //       })
  //       initialNodes.push(node)
  //       step.next_automation_step_conditions.forEach(condition => {
  //         const edge = createNewEdge({ source: step.id, target: condition.next_automation_step.id, onAddNode: onAddNodeInEdge, data: { ...condition } })
  //         initialEdges.push(edge)
  //       })
  //     })
  //   }
  //   const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutNodesAndEdges(initialNodes, initialEdges);

  //   setNodes(layoutedNodes)
  //   setEdges(layoutedEdges)
  // }

  const onSubmit = async () => {
    onSave({ nodes, edges })
  }

  // useEffect(() => {
  //   renderCanvasFromAutomationSteps();
  // }, [])

  return (
    <CommonQueriesProvider>
      <AutomationBuilderProvider>
        <TestExecutionModal
          edges={edges}
          useSelectedEntryPointEventName={true}
          isOpen={testExecutionModalIsOpen}
          nodes={nodes}
          onClose={() => setTestExecutionModalIsOpen(false)}
        />
        <main className={`relative ${canvasWidth} ${canvasHeight} overflow-hidden`}>
          <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={NodeTypes}
              edgeTypes={EdgeTypes}
              snapToGrid={true}
              // defaultViewport={{ x: 600, y: 100, zoom: 1 }}
              fitView={true}
              fitViewOptions={{ padding: 1 }}
              elementsSelectable={false}
              panOnScroll={true}
            // panOnScrollMode='vertical'
            >
              {includePanel && (
                <TopPanel
                  automationName={automationName}
                  isLoading={isLoading}
                  onAutomationNameUpdated={onAutomationNameUpdated}
                  onTestExecutionClick={() => setTestExecutionModalIsOpen(true)}
                  onSave={onSubmit}
                />
              )}

              <Background variant="dots" gap={6} size={0.5} />
              {includeControls && <Controls className="rounded-md border-gray-200 border bg-white shadow-sm overflow-hidden" showInteractive={false} />}
            </ReactFlow>
          </div>

        </main>
      </AutomationBuilderProvider>
    </CommonQueriesProvider>
  )
}



