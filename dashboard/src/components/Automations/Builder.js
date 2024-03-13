'use client'

import LoadingSpinner from '@/components/LoadingSpinner';
import { NodeTypes, EdgeTypes } from '@/lib/automations-helpers';
import TestExecutionModal from './TestExecutionModal';
import ReactFlow, { Background, Controls } from 'reactflow';
import { toast } from 'sonner';
import TopPanel from './TopPanel';
import useAutomationBuilder from '@/hooks/useAutomationBuilder';
import { useEffect, useState } from 'react';
import 'reactflow/dist/style.css';

export default function AutomationBuilder({
  automationName,
  automationSteps,
  canvasWidth = '100%',
  canvasHeight = '100vh',
  includeControls = true,
  includePanel = true,
  onAutomationNameUpdated,
  onSave,
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, setNodesAndEdgesFromAutomationSteps, validateConfig, fitView } = useAutomationBuilder();
  const [testExecutionModalIsOpen, setTestExecutionModalIsOpen] = useState(false);

  useEffect(() => {
    if (automationSteps) {
      setNodesAndEdgesFromAutomationSteps(automationSteps);
      fitView();
    }
  }, automationSteps)

  if (!automationSteps) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <LoadingSpinner size={10} />
      </div>
    )
  }

  return (
    <>
      <TestExecutionModal
        edges={edges}
        useSelectedEntryPointEventName={true}
        isOpen={testExecutionModalIsOpen}
        nodes={nodes}
        onClose={() => setTestExecutionModalIsOpen(false)}
      />
      {includePanel && (
        <TopPanel
          automationName={automationName}
          height='75px'
          onAutomationNameSave={onAutomationNameUpdated}
          onTestExecutionClick={() => setTestExecutionModalIsOpen(true)}
          onSave={() => {
            const errors = validateConfig();
            if (errors.length > 0) {
              toast.error(errors.join(', '), { duration: 15_000 })
            } else {
              onSave({ nodes, edges })
            }
          }}
        />
      )}
      <main className='relative overflow-hidden' style={{ width: canvasWidth, height: `calc(${canvasHeight} - ${includePanel ? '75px' : '0px'})` }}>
        <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={NodeTypes}
            edgeTypes={EdgeTypes}
            snapToGrid={true}
            fitView={true}
            // fitViewOptions={{ padding: 1, minZoom: 1, maxZoom: 1 }}
            fitViewOptions={{ minZoom: 1, maxZoom: 1 }}
            elementsSelectable={false}
            panOnScroll={true}
          >
            <Background variant="dots" gap={6} size={0.5} />
            {includeControls && (
              <Controls
                className="rounded-md border-gray-200 border bg-white shadow-sm overflow-hidden"
                showInteractive={false}
              />
            )}
          </ReactFlow>
        </div>
      </main>
    </>
  )
}



