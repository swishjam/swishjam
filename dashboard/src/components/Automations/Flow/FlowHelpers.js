import { ButtonEdge } from '@/components/Automations/Flow/Edges/ButtonEdge';
import DelayNode from '@/components/Automations/Flow/Nodes/DelayNode';
import EndNode from '@/components/Automations/Flow/Nodes/EndNode';
import IfElseNode from '@/components/Automations/Flow/Nodes/IfElseNode';
import ResendEmailNode from '@/components/Automations/Flow/Nodes/ResendEmailNode';
import SlackNode from '@/components/Automations/Flow/Nodes/SlackNode';
import TriggerNode from '@/components/Automations/Flow/Nodes/TriggerNode';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 125;

const CreateNewNode = (id, type, data, onEdit, onDelete) => {
  const nid = id || 'new-' + Math.random().toString(36);
  return {
    id: nid,
    position: { x: 0, y: 0 },
    data: { ...data, onEdit, onDelete, width: NODE_WIDTH, height: NODE_HEIGHT },
    draggable: true,
    type
  }
}

const CreateNewEdge = (source, target, data, type = 'buttonedge') => {
  return {
    id: `e${source}-${target}`,
    source,
    target,
    type,
    data
  }
}

// For ReactFlow to render the custom nodes,
// we need to provide a nodeTypes object to the ReactFlow component.
const NodeTypes = {
  Filter: SlackNode,
  Delay: DelayNode,
  SlackMessage: SlackNode,
  ResendEmail: ResendEmailNode,
  IfElse: IfElseNode,
  Entry: TriggerNode,
  End: EndNode,
}

const EdgeTypes = {
  buttonedge: ButtonEdge,
}

export {
  NodeTypes,
  EdgeTypes,
  CreateNewNode,
  CreateNewEdge,
  NODE_WIDTH,
  NODE_HEIGHT
}