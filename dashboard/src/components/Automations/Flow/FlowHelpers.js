import TriggerNode from '@/components/Automations/Flow/Nodes/TriggerNode';
import EndNode from '@/components/Automations/Flow/Nodes/EndNode';
import SlackNode from '@/components/Automations/Flow/Nodes/SlackNode';
import { ButtonEdge } from '@/components/Automations/Flow/Edges/ButtonEdge';
import { LuBrain, LuMail, LuMegaphone, LuFilter, LuAlarmClock } from 'react-icons/lu';
import ResendEmailNode from './Nodes/ResendEmailNode';
import DelayNode from './Nodes/DelayNode';
import dagre from 'dagre';
const SlackIcon = ({ className }) => (<img src={'/logos/slack.svg'} className={className} />)

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const NodeWidth = 300;
const NodeHeight = 125;

// For Add New Node Popover 
// we need to provide a nodeTypes object to the ReactFlow component.
const NodeTypesList = [
  {
    heading: (<span className='flex items-center'><LuBrain size={18} className='mr-2' />Logic</span>),
    items: [
      // {
      //   value: "if-else",
      //   label: "If/Else",
      //   icon: LuSplit,
      // },
      {
        value: "Filter",
        label: "Filter",
        icon: LuFilter,
      },
      {
        value: "Delay",
        label: "Delay",
        icon: LuAlarmClock,
      },
    ]
  },
  {
    heading: (<span className='flex items-center'><LuMegaphone size={18} className='mr-2' />Messaging</span>),
    items: [
      {
        value: "SlackMessage",
        label: "Send Slack Message",
        icon: SlackIcon,
      },
      {
        value: "ResendEmail",
        label: "Send Email w/Resend",
        icon: LuMail,
      },
      // {
      //   value: "webhook",
      //   label: "Send Webhook",
      //   icon: LuWebhook,
      // },
      // {
      //   value: "update-user",
      //   label: "Update User Profile",
      //   icon: LuUser,
      // },
      // {
      //   value: "update-org",
      //   label: "Update Organization Profile",
      //   icon: LuBuilding,
      // },
    ]
  },
]

const LayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NodeWidth, height: NodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node, index) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    if (index === 0) {
      node.position = {
        x: 0, //nodeWithPosition.x,
        // x: nodeWithPosition.x - NodeWidth / 2,
        y: nodeWithPosition.y - NodeHeight,
      };
    } else {
      node.position = {
        x: 0, //nodeWithPosition.x,
        y: nodeWithPosition.y * 1.2 - NodeHeight,
      };
    }

    return node;
  });

  return { nodes, edges };
};


const CreateNewNode = (id, type, data, onEdit, onDelete) => {
  let nid = id || 'new-' + Math.random().toString(36);
  return {
    id: nid,
    position: { x: 0, y: 0 },
    data: { ...data, onEdit, onDelete, width: NodeWidth, height: NodeHeight },
    draggable: false,
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
  trigger: TriggerNode,
  end: EndNode,
}

const EdgeTypes = {
  buttonedge: ButtonEdge,
}

export {
  NodeTypesList,
  NodeTypes,
  EdgeTypes,
  CreateNewNode,
  CreateNewEdge,
  LayoutedElements, 
  NodeWidth,
  NodeHeight
}