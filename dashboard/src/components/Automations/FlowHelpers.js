import { ButtonEdge } from '@/components/Automations/Edges/ButtonEdge';
import DelayNode from '@/components/Automations/Nodes/DelayNode';
import EndNode from '@/components/Automations/Nodes/EndNode';
import IfElseNode from '@/components/Automations/Nodes/IfElseNode';
import ResendEmailNode from '@/components/Automations/Nodes/ResendEmailNode';
import SlackNode from '@/components/Automations/Nodes/SlackNode';
import TriggerNode from '@/components/Automations/Nodes/EntryPointNode';
import FilterNode from '@/components/Automations/Nodes/FilterNode';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 125;

// For ReactFlow to render the custom nodes,
// we need to provide a nodeTypes object to the ReactFlow component.
const NodeTypes = {
  Filter: FilterNode,
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