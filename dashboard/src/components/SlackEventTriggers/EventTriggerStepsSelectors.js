import Dropdown from '@/components/utils/Dropdown'

export default function EventTriggerStepsSelectors({ eventOptions, slackChannelOptions, onEventSelected, onSlackChannelSelected }) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        <li>
          <div className="relative pb-8 flex items-center">
            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
            <div className="relative flex space-x-3">
              <div>
                <span className='h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-200 text-gray-700 text-sm'>
                  1
                </span>
              </div>
              <div className="flex min-w-0 flex-1 justify-between space-x-4">
                <div>
                  <div className="text-sm text-gray-500 flex items-center">
                    When the
                    <div className='mx-1'>
                      <Dropdown label='event' options={eventOptions} onSelect={onEventSelected} />
                    </div>
                    event is triggered
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="relative pb-8">
            <div className="relative flex space-x-3">
              <div>
                <span className='h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-200 text-gray-700 text-sm'>
                  2
                </span>
              </div>
              <div className="flex min-w-0 flex-1 justify-between space-x-4">
                <div>
                  <div className="text-sm text-gray-500 flex items-center">
                    Send a message to
                    <div className='mx-1'>
                      <Dropdown label='Slack Channel' options={slackChannelOptions} onSelect={onSlackChannelSelected} />
                    </div>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}