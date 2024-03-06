'use client'

import { autoLayoutNodesAndEdges } from '@/lib/automations-helpers';
import AutomationBuilderProvider from '@/providers/AutomationBuilderProvider';
import { Button } from '@/components/ui/button';
import CommonQueriesProvider from '@/providers/CommonQueriesProvider';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LuArrowLeft } from 'react-icons/lu';
import { NodeTypes, EdgeTypes, createNewEdge, createNewNode } from '@/lib/automations-helpers';
import { TestTube2Icon } from 'lucide-react';
import TestRunnerModal from './TestRunnerModal';
import { useEffect, useCallback, useState } from 'react';

import ReactFlow, {
  ReactFlowProvider,
  Panel,
  Background,
  useNodesState,
  useEdgesState,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function AutomationBuilder({
  automationName,
  automationSteps,
  canvasWidth = 'w-screen',
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

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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

  const renderCanvasFromAutomationSteps = async () => {
    let initialNodes = [];
    let initialEdges = [];

    if (automationSteps.length === 0) {
      const entryNode = createNewNode({ type: 'EntryPoint', onUpdate: updateNode })
      const exitNode = createNewNode({ type: 'Exit' })
      initialNodes = [entryNode, exitNode];
      initialEdges = [createNewEdge({ source: entryNode.id, target: exitNode.id, onAddNode: onAddNodeInEdge })]
    } else {
      automationSteps.forEach(step => {
        const node = createNewNode({
          id: step.id,
          type: step.type.split('::')[1],
          data: step.config,
          onUpdate: updateNode,
          onDelete: onNodeDelete,
        })
        initialNodes.push(node)
        step.next_automation_step_conditions.forEach(condition => {
          const edge = createNewEdge({ source: step.id, target: condition.next_automation_step.id, onAddNode: onAddNodeInEdge, data: { ...condition } })
          initialEdges.push(edge)
        })
      })
    }
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutNodesAndEdges(initialNodes, initialEdges);

    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }

  const onSubmit = async () => {
    onSave({ nodes, edges })
  }

  useEffect(() => {
    renderCanvasFromAutomationSteps();
  }, [])

  return (
    <CommonQueriesProvider>
      <AutomationBuilderProvider>
        <TestRunnerModal
          edges={edges}
          useSelectedEntryPointEventName={true}
          isOpen={testExecutionModalIsOpen}
          nodes={nodes}
          onClose={() => setTestExecutionModalIsOpen(false)}
        />
        <ReactFlowProvider>
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
                defaultViewport={{ x: 600, y: 100, zoom: 1 }}
                elementsSelectable={false}
                panOnScroll={true}
                //panOnScrollMode='vertical'
              >
                {includePanel && (
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
                        <p className='text-sm font-medium leading-none flex items-center mb-1 mt-6'>Automation Name</p>
                        <Input className='w-full' value={automationName} onChange={e => onAutomationNameUpdated(e.target.value)} />
                        <Button className="mt-4 w-full" disabled={isLoading} onClick={onSubmit} variant='swishjam'>
                          {isLoading ? <LoadingSpinner color='white' size={6} /> : 'Save Flow'}
                        </Button>
                        <Button
                          className="mt-2 w-full flex items-center space-x-2"
                          disabled={isLoading}
                          onClick={() => setTestExecutionModalIsOpen(true)}
                          variant='outline'
                        >
                          {isLoading
                            ? <LoadingSpinner size={6} />
                            : (
                              <>
                                <TestTube2Icon className='h-4 w-4' />
                                <span>Run Test Automation</span>
                              </>
                            )}
                        </Button>
                      </div>
                    </div>
                  </Panel>
                )}

                <Background variant="dots" gap={6} size={0.5} />
                {includeControls && <Controls className="rounded-md border-gray-200 border bg-white shadow-sm overflow-hidden" showInteractive={false} />}
              </ReactFlow>
            </div>

          </main>
        </ReactFlowProvider>
      </AutomationBuilderProvider>
    </CommonQueriesProvider>
  )
}



