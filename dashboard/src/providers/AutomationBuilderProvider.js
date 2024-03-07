'use client';

import AutomationBuilderContext from '@/contexts/AutomationBuilderContext';
import { autoLayoutNodesAndEdges, createNewEdge, createNewNode } from '@/lib/automations-helpers';
import { useCallback, useState } from 'react';
import { useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/automations-helpers';

const AutomationBuilderProvider = ({ children }) => {
  const [selectedEntryPointEventName, setSelectedEntryPointEventName] = useState();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setCenter } = useReactFlow();

  const zoomToNode = node => {
    setCenter(node.position.x + (NODE_WIDTH / 2), node.position.y + (NODE_HEIGHT / 2), { duration: 800, zoom: 1 })
  };

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

  return (
    <AutomationBuilderContext.Provider
      value={{
        setSelectedEntryPointEventName,
        selectedEntryPointEventName,
        addNodeInEdge,
        deleteNode,
        updateNode,
        setNodesAndEdgesFromAutomationSteps,
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
      }}
    >
      {children}
    </AutomationBuilderContext.Provider>
  );
}

export { AutomationBuilderProvider };
export default AutomationBuilderProvider;






const initialNodes = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Node' },
    position: { x: 0, y: 50 },
  },
];

let id = 1;
const getId = () => `${id++}`;

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);
  const connectingNodeId = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const onConnect = useCallback(
    (params) => {
      // reset the start node on connections
      connectingNodeId.current = null;
      setEdges((eds) => addEdge(params, eds))
    },
    [],
  );

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectingNodeId.current, target: id }),
        );
      }
    },
    [screenToFlowPosition],
  );

  return (
    <div className="wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={[0.5, 0]}
      />
    </div>
  );
};