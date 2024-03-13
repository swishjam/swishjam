'use client';

import AutomationBuilderContext from '@/contexts/AutomationBuilderContext';
import { autoLayoutNodesAndEdges, createNewEdge, createNewNode, errorForNode } from '@/lib/automations-helpers';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/automations-helpers';
import { useState } from 'react';
import { useEdgesState, useNodesState, useReactFlow } from 'reactflow';

const AutomationBuilderProvider = ({ children }) => {
  const [selectedEntryPointEventName, setSelectedEntryPointEventName] = useState();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setCenter } = useReactFlow();

  const zoomToNode = node => {
    setCenter(node.position.x + (NODE_WIDTH / 2), node.position.y + (NODE_HEIGHT / 2), { duration: 800, zoom: 1 })
  };

  const zoomToEntryPoint = () => {
    const entryPointNode = nodes.find(node => node.type === 'EntryPoint');
    if (entryPointNode) {
      zoomToNode(entryPointNode);
    }
  }

  const updateCanvasWithAutoLayout = (nodes, edges) => {
    const { nodes: newNodes, edges: newEdges } = autoLayoutNodesAndEdges(nodes, edges);
    setNodes(newNodes);
    setEdges(newEdges);
  }

  const setNodesAndEdgesFromAutomationSteps = automationSteps => {
    let initialNodes = [];
    let initialEdges = [];

    if (automationSteps.length === 0) {
      const entryNode = createNewNode({ type: 'EntryPoint' })
      const exitNode = createNewNode({ type: 'Exit' })
      initialNodes = [entryNode, exitNode];
      initialEdges = [createNewEdge({ source: entryNode.id, target: exitNode.id })]
    } else {
      automationSteps.forEach(step => {
        const node = createNewNode({ id: step.id, type: step.type.split('::')[1], data: step.config })
        initialNodes.push(node)
        step.next_automation_step_conditions.forEach(condition => {
          const edge = createNewEdge({ id: condition.id, source: step.id, target: condition.next_automation_step.id, data: { ...condition } })
          initialEdges.push(edge)
        })
      })
    }
    updateCanvasWithAutoLayout(initialNodes, initialEdges);
  }

  const addNodeInEdge = ({ nodeType, data, edgeId, numEdgesToAdd = 1 }) => {
    const newPrimaryNode = createNewNode({ type: nodeType, data })
    let newNodes = [newPrimaryNode]

    const removedEdge = edges.find(edge => edge.id === edgeId);
    const previousNodeId = removedEdge.source;
    let newEdges = [
      createNewEdge({ source: previousNodeId, target: newPrimaryNode.id }),
      createNewEdge({ source: newPrimaryNode.id, target: removedEdge.target }),
    ]

    for (let i = 1; i < numEdgesToAdd; i++) {
      const newEndNode = createNewNode({ type: 'Exit' });
      const newEdge = createNewEdge({ source: newPrimaryNode.id, target: newEndNode.id })
      newNodes.push(newEndNode);
      newEdges.push(newEdge);
    }
    const remainingEdges = edges.filter(edge => edge.id !== edgeId)

    updateCanvasWithAutoLayout([...nodes, ...newNodes], [...remainingEdges, ...newEdges])
    zoomToNode(newPrimaryNode);
  }

  const deleteNode = nodeId => {
    const newNodes = nodes.filter(n => n.id !== nodeId);
    const leftoverEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    const removedEdges = edges.filter(e => e.source == nodeId || e.target == nodeId);
    const newEdgeSource = removedEdges.find(edge => edge.target === nodeId).source;
    const newEdgeTarget = removedEdges.find(edge => edge.source === nodeId).target;
    const newEdge = createNewEdge({ source: newEdgeSource, target: newEdgeTarget });
    updateCanvasWithAutoLayout(newNodes, [...leftoverEdges, newEdge]);
  }

  const updateNode = (nodeId, data) => {
    const newNodes = nodes.map(node => {
      if (node.id === nodeId) {
        node.data = data;
      }
      return node;
    });
    setNodes(newNodes)
  }

  const validateConfig = ({ zoomOnFirstError = true } = {}) => {
    let errors = [];
    let zoomed = false;
    nodes.forEach(node => {
      const error = errorForNode(node);
      if (error) {
        errors.push(error);
        if (zoomOnFirstError && !zoomed) {
          zoomToNode(node);
          zoomed = true;
        }
      }
    })
    return errors;
  }

  return (
    <AutomationBuilderContext.Provider
      value={{
        addNodeInEdge,
        deleteNode,
        edges,
        onNodesChange,
        onEdgesChange,
        nodes,
        setNodesAndEdgesFromAutomationSteps,
        setSelectedEntryPointEventName,
        selectedEntryPointEventName,
        updateNode,
        validateConfig,
        zoomToEntryPoint,
        zoomToNode,
      }}
    >
      {children}
    </AutomationBuilderContext.Provider>
  );
}

export { AutomationBuilderProvider };
export default AutomationBuilderProvider;