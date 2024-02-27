import TriggerNode from '@/components/Automations/Flow/TriggerNode';
import EndNode from '@/components/Automations/Flow/EndNode';
import SlackNode from '@/components/Automations/Flow/SlackNode';
import { 
  LuBrain, LuMail, LuMegaphone,
  LuWebhook, LuUser, LuSplit,
  LuFilter, LuBuilding, LuAlarmClock
} from 'react-icons/lu';
const SlackIcon = ({className}) => (<img src={'/logos/slack.svg'} className={className} />)

// For Add New Node Popover 
// we need to provide a nodeTypes object to the ReactFlow component.
const NodeTypesList = [
  {
    heading: (<span className='flex items-center'><LuBrain size={18} className='mr-2'/>Logic</span>),
    items: [
      // {
      //   value: "if-else",
      //   label: "If/Else",
      //   icon: LuSplit,
      // },
      {
        value: "filter",
        label: "Filter",
        icon: LuFilter,
      },
      {
        value: "delay",
        label: "Delay",
        icon: LuAlarmClock,
      },
    ]
  },
  {
  heading: (<span className='flex items-center'><LuMegaphone size={18} className='mr-2'/>Messaging</span>),
  items: [
    {
      value: "slack",
      label: "Send Slack Message",
      icon: SlackIcon,
    },
    {
      value: "resend",
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

const NodeWidth = 300;
const NodeHeight = 125;


// For ReactFlow to render the custom nodes,
// we need to provide a nodeTypes object to the ReactFlow component.
const NodeTypes = {
  filter: SlackNode,
  delay: SlackNode,
  trigger: TriggerNode,
  resend: SlackNode,
  slack: SlackNode,
  end: EndNode, 
}

export {
  NodeTypesList,
  NodeTypes,
  NodeWidth,
  NodeHeight
}