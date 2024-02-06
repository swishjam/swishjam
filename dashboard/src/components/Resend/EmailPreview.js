export default function EmailPreview({ to, from, cc, bcc, subject, body, className }) {
  return (
    <div className={`text-sm shadow-sm border border-gray-200 bg-white rounded-md p-4 ${className}`}>
      <div className='flex gap-x-2 py-2 px-1'>
        <span className='text-gray-400'>To</span>
        <span className='text-gray-900'>{to}</span>
      </div>
      {cc.props.content && cc.props.content !== '' && (
        <div className='flex gap-x-2 py-2 px-1'>
          <span className='text-gray-400'>CC</span>
          <span className='text-gray-900'>{cc}</span>
        </div>
      )}
      {bcc.props.content && bcc.props.content !== '' && (
        <div className='flex gap-x-2 py-2 px-1'>
          <span className='text-gray-400'>BCC</span>
          <span className='text-gray-900'>{bcc}</span>
        </div>
      )}
      <div className='flex gap-x-2 border-t border-gray-200 py-2 px-1'>
        <span className='text-gray-400'>From</span>
        <span className='text-gray-900'>{from}</span>
      </div>
      <div className='flex gap-x-2 border-t border-gray-200 py-2 px-1'>
        <span className='text-gray-400'>Subject</span>
        <span className='text-gray-900'>{subject}</span>
      </div>
      <div className='text-gray-900 border-t border-gray-200 py-4 px-1'>
        {(!body.props.content || body.props.content === '') && <span className='text-gray-400 italic'>No content</span>}
        {body}
      </div>
    </div>
  )
}