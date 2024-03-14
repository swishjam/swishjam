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
import useUnsavedChanges from '@/hooks/useUnsavedChanges';

export default function AutomationBuilder({
  automationName,
  automationSteps,
  canvasWidth = '100%',
  canvasHeight = '100vh',
  displayUnsavedChangesIndicator = true,
  includeControls = true,
  includePanel = true,
  onAutomationNameUpdated,
  onSave,
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, validateConfig } = useAutomationBuilder();
  const { hasUnsavedChanges, guardFromUnsavedChanges } = useUnsavedChanges();
  const [testExecutionModalIsOpen, setTestExecutionModalIsOpen] = useState(false);
  const [initialNodes] = useState(nodes);
  const [initialEdges] = useState(edges);

  if (displayUnsavedChangesIndicator) {
    guardFromUnsavedChanges(
      [...initialNodes.map(n => n.data), ...initialEdges.map(e => e.data)],
      [...nodes.map(n => n.data), ...edges.map(e => e.data)]
    );
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
          canSave={hasUnsavedChanges}
          displayUnsavedChangesIndicator={displayUnsavedChangesIndicator}
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
            // fitViewOptions={{ duration: 800 }}
            elementsSelectable={false}
            panOnScroll={true}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant="dots" gap={6} size={0.5} />
            {includeControls && (
              <Controls
                className="rounded-md border-gray-200 border bg-white shadow-sm overflow-hidden"
                fitViewOptions={{ duration: 800 }}
                showInteractive={false}
              />
            )}
          </ReactFlow>
        </div>
      </main>
    </>
  )
}



