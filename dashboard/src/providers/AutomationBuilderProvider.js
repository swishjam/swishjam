'use client';

import AutomationBuilderContext from '@/contexts/AutomationBuilderContext';
import { autoLayoutNodesAndEdges, buildNodesAndEdgesFromAutomationSteps, createNewEdge, createNewNode, errorForNode, generateEmptyStateMockedAutomationSteps } from '@/lib/automations-helpers';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/automations-helpers';
import { useState } from 'react';
import { useEdgesState, useNodesState, useReactFlow } from 'reactflow';

const AutomationBuilderProvider = ({ isLoading = false, children, initialAutomationSteps }) => {
  const [selectedEntryPointEventName, setSelectedEntryPointEventName] = useState();

  const { nodes: initialNodes, edges: initialEdges } = buildNodesAndEdgesFromAutomationSteps(initialAutomationSteps);
  const { nodes: autoLayoutedInitialNodes, edges: autoLayoutedInitialEdges } = autoLayoutNodesAndEdges(initialNodes, initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState(autoLayoutedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(autoLayoutedInitialEdges);
  const { setCenter, fitView } = useReactFlow();

  const zoomToNode = (node, options = {}) => {
    setCenter(node.position.x + (NODE_WIDTH / 2), node.position.y + (NODE_HEIGHT / 2), { duration: options.duration || 800, zoom: options.zoom || 1.5 })
  };

  const zoomToNodeId = nodeId => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      zoomToNode(node);
    }
  }

  const zoomToEntryPoint = () => {
    const entryPointNode = nodes.find(node => node.type === 'EntryPoint');
    if (entryPointNode) {
      zoomToNode(entryPointNode);
    }
  }

  const updateCanvasWithAutoLayout = async (nodes, edges) => {
    const { nodes: newNodes, edges: newEdges } = autoLayoutNodesAndEdges(nodes, edges);
    await Promise.all([
      setNodes(newNodes),
      setEdges(newEdges),
    ]);
  }

  const setNodesAndEdgesFromAutomationSteps = async automationSteps => {
    const { nodes: nodesFromAutomationSteps, edges: edgesFromAutomationSteps } = buildNodesAndEdgesFromAutomationSteps(automationSteps);
    await updateCanvasWithAutoLayout(nodesFromAutomationSteps, edgesFromAutomationSteps);
  }

  const addNodeInEdge = async ({ nodeType, data, edgeId, numEdgesToAdd = 1 }) => {
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

    await updateCanvasWithAutoLayout([...nodes, ...newNodes], [...remainingEdges, ...newEdges])
    zoomToNode(newPrimaryNode);
  }

  const deleteNode = async nodeId => {
    const newNodes = nodes.filter(n => n.id !== nodeId);
    const leftoverEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    const removedEdges = edges.filter(e => e.source == nodeId || e.target == nodeId);
    const newEdgeSource = removedEdges.find(edge => edge.target === nodeId).source;
    const newEdgeTarget = removedEdges.find(edge => edge.source === nodeId).target;
    const newEdge = createNewEdge({ source: newEdgeSource, target: newEdgeTarget });
    await updateCanvasWithAutoLayout(newNodes, [...leftoverEdges, newEdge]);
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
        fitView,
        isLoading,
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
        zoomToNodeId,
      }}
    >
      {children}
    </AutomationBuilderContext.Provider>
  );
}

export { AutomationBuilderProvider };
export default AutomationBuilderProvider;