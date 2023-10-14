export default function PaginationItem({ onSelect, content, enabled, isActive }) {
  if (isActive) {
    return (
      <a className='inline-flex items-center border-t-2 border-swishjam px-4 pt-4 text-sm font-medium text-swishjam'>
        {content}
      </a>
    )
  } else if (enabled) {
    return (
      <a
        className='cursor-pointer hover:border-gray-300 hover:text-gray-700 inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500'
        onClick={onSelect}
      >
        {content}
      </a>
    )
  } else if (!enabled) {
    return (
      <a className='cursor-not-allowed inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-400'>
        {content}
      </a>
    )
  }
}