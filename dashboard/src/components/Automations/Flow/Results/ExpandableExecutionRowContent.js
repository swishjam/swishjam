import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FlaskConicalIcon } from 'lucide-react';
import { prettyDateTime } from '@/lib/utils/timeHelpers';

export default function ExpandableExecutionRowContent({ executedAutomation, user }) {
  return (
    <div className="flex items-center space-x-2 transition-colors w-full justify-between">
      <div>
        <div className="flex items-center flex-auto">
          {user ? (
            <>
              <div className="flex-shrink-0">
                <Avatar className="border border-slate-200">
                  <AvatarImage className='transition-all bg-gray-200 group-hover:bg-gray-400' src={user.gravatarUrl()} />
                  <AvatarFallback className='transition-all bg-gray-200 group-hover:bg-gray-400'>{user.initials()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-4 flex flex-col items-start transition-colors">
                {user.fullName()
                  ? <span className="font-medium text-gray-700">{user.fullName() || user.email()}</span>
                  : <span className='text-gray-700 italic'>{!user.uniqueIdentifier() && !user.email() ? `Anonymous User ${user.id().slice(0, 4)}` : 'Name Unknown'}</span>}
                {user.fullName() && user.email() && (
                  <span className="block text-sm text-gray-500">{user.email()}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarFallback className="transition-all bg-swishjam-light group-hover:bg-swishjam">
                    <FlaskConicalIcon className='h-4 w-4' />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-4 flex flex-col items-start transition-colors">
                <span className="font-medium text-gray-700">
                  Test Execution
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className='flex flex-col items-end space-y-2'>
        <span className={`inline-flex items-center gap-x-1.5 rounded-sm px-1.5 py-0.5 text-xs font-medium ${executedAutomation.completed_at ? 'text-green-700 bg-green-100' : 'text-blue-700 bg-blue-100'}`}>
          <svg className={`h-1.5 w-1.5 ${executedAutomation.completed_at ? 'fill-green-500' : 'fill-blue-500'}`} viewBox="0 0 6 6" aria-hidden="true">
            <circle cx={3} cy={3} r={3} />
          </svg>
          {executedAutomation.completed_at ? 'Completed' : 'Pending'}
        </span>
        <div className='text-gray-600 flex items-center text-xs rounded-sm px-1.5 py-0.5'>
          {prettyDateTime(executedAutomation.started_at)}
        </div>
      </div>
    </div>
  )
}