import FakeReactionButton from './FakeReactionButton';
import Logo from '@/components/Logo'

export default function SlackMessagePreview({ header, body, className }) {
  return (
    <div className={`border border-gray-200 bg-white rounded-md p-4 flex gap-x-4 ${className}`}>
      <div className='flex-shrink-0'>
        <div className='border rounded-sm h-12 w-12 p-2'>
          <Logo className="h-8 mx-auto text-center ml-1" />
        </div> 
      </div>
      <div className='flex-grow'>
        <div className='flex items-end'>
          <span className='font-medium text-sm cursor-pointer hover:underline'>
            Swishjam
          </span>
          <span className='ml-1 bg-gray-200 text-gray-700 rounded px-1 py-0.5' style={{ fontSize: '0.6rem ' }}>
            APP
          </span>
          <span className='ml-1 text-gray-700 text-xs cursor-pointer hover:underline'>
            {new Date().toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <div>
          <h2 className='text-md font-medium break-word mt-1'>{header}</h2>
          <div className='mt-1 text-sm break-word'>
            {body}
          </div>
        </div>
        <div className='flex items-center gap-x-2 mt-2'>
          <FakeReactionButton emoji={<>👍🏼</>} />
          <FakeReactionButton emoji={<>🔥</>} />
        </div>
      </div>
    </div>
  )
}