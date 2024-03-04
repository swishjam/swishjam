import { ButtonEdge } from '@/components/Automations/Flow/Edges/ButtonEdge';
import DelayNode from '@/components/Automations/Flow/Nodes/DelayNode';
import EndNode from '@/components/Automations/Flow/Nodes/EndNode';
import IfElseNode from '@/components/Automations/Flow/Nodes/IfElseNode';
import ResendEmailNode from '@/components/Automations/Flow/Nodes/ResendEmailNode';
import SlackNode from '@/components/Automations/Flow/Nodes/SlackNode';
import TriggerNode from '@/components/Automations/Flow/Nodes/TriggerNode';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 125;

// const CreateNewNode = ({ id, type, data = {}, onEditClick, onUpdate, onDelete }) => {
//   const nid = id || 'new-node-' + Math.random().toString(36);
//   return {
//     id: nid,
//     position: { x: 0, y: 0 },
//     data: { ...data, onEditClick, onDelete, onUpdate },
//     draggable: true,
//     type
//   }
// }

// const CreateNewEdge = ({ source, target, data = {}, onAddNode, type = 'buttonedge' }) => {
//   return {
//     id: `edge-${source}-${target}`,
//     source,
//     target,
//     type,
//     data: { ...data, onAddNode },
//   }
// }

// For ReactFlow to render the custom nodes,
// we need to provide a nodeTypes object to the ReactFlow component.
const NodeTypes = {
  Filter: SlackNode,
  Delay: DelayNode,
  SlackMessage: SlackNode,
  ResendEmail: ResendEmailNode,
  IfElse: IfElseNode,
  EntryPoint: TriggerNode,
  Exit: EndNode,
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