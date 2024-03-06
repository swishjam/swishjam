'use client'

import LoadingSpinner from '@/components/LoadingSpinner';
import { NodeTypes, EdgeTypes } from '@/lib/automations-helpers';
import TestExecutionModal from './TestExecutionModal';
import { useEffect, useState } from 'react';

import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import TopPanel from './TopPanel';
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
}) {
  if (!automationSteps) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <LoadingSpinner size={10} />
      </div>
    )
  }

  const { nodes, edges, onNodesChange, onEdgesChange, setNodesAndEdgesFromAutomationSteps } = useAutomationBuilder();
  const [testExecutionModalIsOpen, setTestExecutionModalIsOpen] = useState(false);

  useEffect(() => {
    setNodesAndEdgesFromAutomationSteps(automationSteps);
  }, [automationSteps])

  return (
    <>
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
                onSave={() => onSave({ nodes, edges })}
              />
            )}

            <Background variant="dots" gap={6} size={0.5} />
            {includeControls && <Controls className="rounded-md border-gray-200 border bg-white shadow-sm overflow-hidden" showInteractive={false} />}
          </ReactFlow>
        </div>

      </main>
    </>
  )
}



