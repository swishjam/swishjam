'use client'

import { NodeTypes, EdgeTypes } from '@/lib/automations-helpers';
import TestExecutionModal from './TestExecutionModal';
import ReactFlow, { Background, Controls } from 'reactflow';
import { toast } from 'sonner';
import TopPanel from './TopPanel';
import useAutomationBuilder from '@/hooks/useAutomationBuilder';
import { useEffect, useState } from 'react';
import 'reactflow/dist/style.css';

const stringifySorted = obj => {
  if (Array.isArray(obj)) {
    return JSON.stringify(obj.map(stringifySorted));
  } else if (obj !== null && typeof obj === 'object') {
    return JSON.stringify(
      Object.keys(obj)
        .sort()
        .reduce((result, key) => {
          result[key] = stringifySorted(obj[key]);
          return result;
        }, {})
    );
  }
  return JSON.stringify(obj);
}

export default function AutomationBuilder({
  automationName,
  canvasWidth = '100%',
  canvasHeight = '100vh',
  displayUnsavedChangesIndicator = true,
  includeControls = true,
  includePanel = true,
  onAutomationNameUpdated,
  onSave,
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, validateConfig } = useAutomationBuilder();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [testExecutionModalIsOpen, setTestExecutionModalIsOpen] = useState(false);
  const [stringifiedLastSavedNodesData, setStringifiedLastSavedNodesData] = useState(stringifySorted(nodes.map(n => n.data)));
  const [lastSavedNumEdges, setLastSavedNumEdges] = useState(edges.length);
  const stringifiedNodesData = stringifySorted(nodes.map(n => n.data));

  const tryToSaveChanges = () => {
    const errors = validateConfig();
    if (errors.length > 0) {
      toast.error(errors.join(', '), { duration: 15_000 })
    } else {
      onSave({ nodes, edges }).then(({ error }) => {
        if (!error) {
          setStringifiedLastSavedNodesData(stringifySorted(nodes.map(n => n.data)));
          setLastSavedNumEdges(edges.length);
          setHasUnsavedChanges(false);
        }
      })
    }
  }

  useEffect(() => {
    if (displayUnsavedChangesIndicator) {
      const hasChanges = stringifiedLastSavedNodesData !== stringifiedNodesData || lastSavedNumEdges !== edges.length;
      setHasUnsavedChanges(hasChanges);
    }
  }, [stringifiedNodesData, edges.length]);

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
          onSave={tryToSaveChanges}
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



