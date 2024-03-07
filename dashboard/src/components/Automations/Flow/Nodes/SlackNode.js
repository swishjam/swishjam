'use client'

import { memo } from 'react';
import { LuMegaphone } from "react-icons/lu";
const SlackIcon = ({ className }) => (<img src={'/logos/slack.svg'} className={className} />)

import CustomNode from './CustomNode';
import ConfigureSlackAutomationStep from '../StepConfigurations/SlackMessage';

export default memo(({ id, data }) => {
  return (
    <CustomNode
      id={id}
      EditComponent={ConfigureSlackAutomationStep}
      data={data}
      icon={< SlackIcon className="h-5 w-5" />}
      requiredData={['message_header', 'channel_id', 'channel_name', 'message_body']}
      title="Send Slack Message"
      dialogFullWidth={true} 
    >
      <h2 className="text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto mt-5 w-full truncate text-ellipsis">
        {data?.message_header}
      </h2>

      <div className="flex items-center gap-x-1.5">
        <LuMegaphone className="h-5 w-5" />
        <h2 className="truncate text-ellipsis w-full min-w-0 text-xs font-semibold leading-6 text-gray-600">
          #{data?.channel_name} {data?.message_body}
        </h2>
      </div>
    </CustomNode >
  )
});
