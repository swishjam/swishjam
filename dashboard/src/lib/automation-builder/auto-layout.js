import dagre from 'dagre';
import { NODE_WIDTH, NODE_HEIGHT } from '@/components/Automations/Flow/FlowHelpers';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const EDGE_LENGTH_HEIGHT_MULTIPLIER = 1.5;

export const autoLayoutNodesAndEdges = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node, i) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    if (i === 0) {
      node.position = {
        x: 0,
        y: nodeWithPosition.y - NODE_HEIGHT,
      };
    } else {
      node.position = {
        x: 0,
        y: (nodeWithPosition.y - NODE_HEIGHT / 2) * EDGE_LENGTH_HEIGHT_MULTIPLIER,
      };
    }

    return node;
  });

  return { nodes, edges };
};