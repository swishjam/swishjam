import { ButtonEdge } from '@/components/Automations/Flow/Edges/ButtonEdge';
import DelayNode from '@/components/Automations/Flow/Nodes/DelayNode';
import EndNode from '@/components/Automations/Flow/Nodes/EndNode';
import IfElseNode from '@/components/Automations/Flow/Nodes/IfElseNode';
import ResendEmailNode from '@/components/Automations/Flow/Nodes/ResendEmailNode';
import SlackNode from '@/components/Automations/Flow/Nodes/SlackNode';
import EntryPointNode from '@/components/Automations/Flow/Nodes/EntryPointNode';
import dagre from 'dagre';
import FilterNode from '@/components/Automations/Flow/Nodes/FilterNode';

export const NODE_WIDTH = 300;
export const NODE_HEIGHT = 125;
const NEW_NODE_ID_PREFIX = 'new-node-';
const NEW_EDGE_ID_PREFIX = 'new-edge-';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const EDGE_LENGTH_HEIGHT_MULTIPLIER = 2;

export const autoLayoutNodesAndEdges = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';

    const parentNode = nodes.find(n => edges.find(e => e.target === node.id && e.source === n.id));
    const parentNodeXCoordinate = (parentNode || { position: { x: 0 } }).position.x

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: parentNodeXCoordinate,
      y: (nodeWithPosition.y - NODE_HEIGHT / 2) * EDGE_LENGTH_HEIGHT_MULTIPLIER,
    };

    return node;
  });

  return { nodes, edges };
}


// TODO: this almost supports if/else statements, but gets wonky after a few nodes
// export const autoLayoutNodesAndEdges = (nodes, edges) => {
//   dagreGraph.setGraph({ rankdir: 'TB' });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   // Group nodes by their y-coordinate (rank)
//   const nodesByRank = nodes.reduce((groups, node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     const rank = Math.round(nodeWithPosition.y);
//     if (!groups[rank]) {
//       groups[rank] = [];
//     }
//     groups[rank].push(node);
//     return groups;
//   }, {});

//   // For each group, distribute the nodes evenly along the x-axis
//   Object.values(nodesByRank).forEach((group) => {
//     group.forEach((node, index) => {
//       const nodeWithPosition = dagreGraph.node(node.id);
//       node.targetPosition = 'top';
//       node.sourcePosition = 'bottom';
//       let startX;
//       if (group.length === 1) {
//         // If there's only one node in the group, set the starting x-coordinate to the parent node's x-coordinate
//         const parentNode = nodes.find(n => edges.find(e => e.target === node.id && e.source === n.id));
//         startX = (parentNode || { position: { x: 0 } }).position.x
//       } else {
//         const totalWidthOfNodesInRow = (NODE_WIDTH + (NODE_X_PADDING / 2)) * group.length;
//         startX = (NODE_WIDTH - totalWidthOfNodesInRow) / 2;
//       }
//       node.position = {
//         x: startX + (NODE_WIDTH + NODE_X_PADDING) * index,
//         y: (nodeWithPosition.y - NODE_HEIGHT / 2) * 2,
//       };
//     });
//   });

//   return { nodes, edges };
// };

export const createNewNode = ({ id, type, data = {} }) => {
  const nid = id || NEW_NODE_ID_PREFIX + Math.random().toString(36);
  return {
    id: nid,
    position: { x: 0, y: 0 },
    data,
    draggable: true,
    type
  }
}

export const createNewEdge = ({ id, source, target, data = {}, type = 'buttonedge' }) => {
  const eid = id || NEW_EDGE_ID_PREFIX + source + target;
  return {
    id: eid,
    source,
    target,
    type,
    data,
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
    case 'Filter':
      return {
        next_automation_step_condition_rules: node.data.next_automation_step_condition_rules,
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
      id: node.id,
      client_id: node.id,
      is_new: node.id.startsWith(NEW_NODE_ID_PREFIX),
      type: `AutomationSteps::${node.type}`,
      config: automationStepConfigForNode(node),
    }
  })
  const next_automation_step_conditions = edges.map(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const edgePayload = {
      id: edge.id,
      client_id: edge.id,
      is_new: edge.id.startsWith(NEW_EDGE_ID_PREFIX),
      automation_step_client_id: edge.source,
      next_automation_step_client_id: edge.target,
    }
    if (sourceNode.type === 'Filter') {
      edgePayload.next_automation_step_condition_rules = sourceNode.data.next_automation_step_condition_rules.map(rule => {
        const ruleType = rule.property.startsWith('user.') ? 'UserProperty' : 'EventProperty';
        return {
          type: `NextAutomationStepConditionRules::${ruleType}`,
          config: rule,
        }
      })
    } else {
      edgePayload.next_automation_step_condition_rules = [{
        type: 'NextAutomationStepConditionRules::AlwaysTrue',
        config: {},
      }]
    }
    return edgePayload;
  })
  return { automation_steps, next_automation_step_conditions }
}

export const formatAutomationStepsWithExecutionStepResults = ({ automationSteps, executedAutomation }) => {
  return automationSteps.map(step => {
    const executedStep = executedAutomation.executed_automation_steps.find(ex => ex.automation_step.id === step.id);
    if (!executedStep) {
      return step;
    }
    return {
      ...step,
      config: {
        ...step.config,
        executionStepResults: {
          started_at: executedStep.started_at,
          completed_at: executedStep.completed_at,
          error_message: executedStep.error_message,
          status: executedStep.status,
          execution_data: executedStep.execution_data,
          is_test_execution: executedAutomation.is_test_execution
        },
      },
      next_automation_step_conditions: step.next_automation_step_conditions.map(condition => {
        const satisfiedCondition = executedStep.satisfied_next_automation_step_conditions.find(satisfied => satisfied.next_automation_step_condition_id === condition.id);
        return { ...condition, satisfied_at: satisfiedCondition?.created_at }
      })
    }
  })
}

// For ReactFlow to render the custom nodes,
// we need to provide a nodeTypes object to the ReactFlow component.
export const NodeTypes = {
  Filter: FilterNode,
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