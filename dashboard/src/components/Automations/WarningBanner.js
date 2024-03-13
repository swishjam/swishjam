import { AlertTriangleIcon } from 'lucide-react'

export default function WarningBanner({ children }) {
  return (
    <div className='text-xs flex items-center space-x-2 mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded transition-colors'>
      <AlertTriangleIcon className='h-6 w-6' />
      <div>
        {children}
      </div>
    </div>
  )
}