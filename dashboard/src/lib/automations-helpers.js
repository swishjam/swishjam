import { ButtonEdge } from '@/components/Automations/Flow/Edges/ButtonEdge';
import DelayNode from '@/components/Automations/Flow/Nodes/DelayNode';
import EndNode from '@/components/Automations/Flow/Nodes/EndNode';
import IfElseNode from '@/components/Automations/Flow/Nodes/IfElseNode';
import ResendEmailNode from '@/components/Automations/Flow/Nodes/ResendEmailNode';
import SlackNode from '@/components/Automations/Flow/Nodes/SlackNode';
import EntryPointNode from '@/components/Automations/Flow/Nodes/EntryPointNode';
import dagre from 'dagre';

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

export const createNewNode = ({ id, type, data = {}, onUpdate, onDelete }) => {
  const nid = id || 'new-node-' + Math.random().toString(36);
  return {
    id: nid,
    position: { x: 0, y: 0 },
    data: { ...data, onDelete, onUpdate },
    draggable: true,
    type
  }
}

export const createNewEdge = ({ source, target, data = {}, onAddNode, type = 'buttonedge' }) => {
  return {
    id: `edge-${source}-${target}`,
    source,
    target,
    type,
    data: { ...data, onAddNode },
  }
}


const automationStepConfigForNode = node => {
  switch (node.type) {
    case 'EntryPoint':
      return {
        event_name: node.data.event_name,
      }
    case 'Exit':
      return {}
    case 'Delay':
      return {
        delay_amount: node.data.delay_amount,
        delay_unit: node.data.delay_unit,
      }
    case 'IfElse':
      return {
        condition: node.data.condition,
      }
    case 'SlackMessage':
      return {
        channel_id: node.data.channel_id,
        channel_name: node.data.channel_name,
        message_header: node.data.message_header,
        message_body: node.data.message_body,
      }
    case 'ResendEmail':
      return {
        email_template_id: node.data.email_template_id,
        to: node.data.to,
        from: node.data.from,
        subject: node.data.subject,
        body: node.data.body,
        cc: node.data.cc,
        bcc: node.data.bcc,
        reply_to: node.data.reply_to,
        send_once_per_user: node.data.send_once_per_user,
        un_resolved_variable_safety_net: node.data.un_resolved_variable_safety_net,
      }
    default:
      throw new Error(`Unknown node type: ${node.type}`)
  }
}

export const reformatNodesAndEdgesToAutomationsPayload = ({ nodes, edges }) => {
  const automation_steps = nodes.map(node => {
    return {
      client_id: node.id,
      type: `AutomationSteps::${node.type}`,
      config: automationStepConfigForNode(node),
    }
  })
  const next_automation_step_conditions = edges.map(edge => {
    return {
      client_id: edge.id,
      automation_step_client_id: edge.source,
      next_automation_step_client_id: edge.target,
      next_automation_step_condition_rules_attributes: [
        {
          type: 'NextAutomationStepConditionRules::AlwaysTrue',
          config: {},
        }
      ]
    }
  })
  return { automation_steps, next_automation_step_conditions }
}

export const NODE_WIDTH = 300;
export const NODE_HEIGHT = 125;

// For ReactFlow to render the custom nodes,
// we need to provide a nodeTypes object to the ReactFlow component.
export const NodeTypes = {
  Filter: SlackNode,
  Delay: DelayNode,
  SlackMessage: SlackNode,
  ResendEmail: ResendEmailNode,
  IfElse: IfElseNode,
  EntryPoint: EntryPointNode,
  Exit: EndNode,
}

export const EdgeTypes = {
  buttonedge: ButtonEdge,
}