import { ButtonEdge } from '@/components/Automations/Flow/Edges/ButtonEdge';
import DelayNode from '@/components/Automations/Flow/Nodes/DelayNode';
import EndNode from '@/components/Automations/Flow/Nodes/EndNode';
import IfElseNode from '@/components/Automations/Flow/Nodes/IfElseNode';
import ResendEmailNode from '@/components/Automations/Flow/Nodes/ResendEmailNode';
import SlackNode from '@/components/Automations/Flow/Nodes/SlackNode';
import TriggerNode from '@/components/Automations/Flow/Nodes/EntryPointNode';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 125;

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