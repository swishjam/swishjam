import FakeReactionButton from './FakeReactionButton';
import Image from 'next/image'
import SwishjamLogo from '@public/logos/swishjam.png'

export default function SlackMessagePreview({ header, body, className }) {
  return (
    <div className={`border border-gray-200 rounded-md p-4 flex gap-x-4 hover:bg-gray-100 ${className}`}>
      <div className='flex-shrink-0'>
        <Image src={SwishjamLogo} className='h-12 w-20' />
      </div>
      <div className='flex-grow'>
        <div className='flex items-end'>
          <span className='font-medium text-sm'>
            Swishjam
          </span>
          <span className='ml-1 bg-gray-200 text-gray-700 rounded px-1 py-0.5' style={{ fontSize: '0.6rem ' }}>
            APP
          </span>
          <span className='ml-1 text-gray-700 text-xs'>
            {new Date().toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <div>
          <h2 className='text-md font-medium'>{header}</h2>
          <div className='mt-1 text-sm'>
            📅 10/2/2023 
            <p className='font-medium mt-6'>📣 Marketing Site:</p> 
            <p>↔️ Sessions: 500 (+0.0% vs yesterday)</p> 
            <p>📉 Unique Visitors: 340 (+5.0% vs yesterday) </p> 
            <p>📈 Page Views: 456 (+2.0% vs yesterday) </p> 
            <p className='font-medium mt-6'>🧑‍💻 Product Usage:</p> 
            <p>↔️ Daily Active Users: 500 (+0.0% vs yesterday)</p> 
            <p>📉 Sessions: 340 (+5.0% vs yesterday) </p> 
            <p>📈 New Users: 456 (+2.0% vs yesterday) </p> 
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