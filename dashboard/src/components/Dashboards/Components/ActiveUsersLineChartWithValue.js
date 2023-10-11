'use client';

import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
// import { SwishjamMemory } from '@/lib/swishjam-memory';

const GroupingDropdown = ({ currentGrouping, onSelection }) => (
  <DropdownMenu>
    <DropdownMenuTrigger className='underline decoration-dotted cursor-pointer transition-all hover:text-gray-400'>
      {currentGrouping[0].toUpperCase()}{currentGrouping.slice(1)}
    </DropdownMenuTrigger>
    {' '} Active Users
    <DropdownMenuContent>
      <DropdownMenuLabel className='flex items-center'>
        <CalendarDaysIcon className='inline-block w-5 h-5 mr-2' />
        Active Users Grouping
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {['daily', 'weekly', 'monthly'].map(groupOption => (
        <DropdownMenuItem
          key={groupOption}
          className={`cursor-pointer ${currentGrouping === groupOption ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
          onClick={() => {
            if (currentGrouping === groupOption) return;
            onSelection(groupOption);
          }}
        >
          {currentGrouping === groupOption && <CheckCircleIcon className='h-4 w-4 absolute' />}
          <span className='mx-6'>{groupOption[0].toUpperCase()}{groupOption.slice(1)}</span>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)


export default function ActiveUsersLineChart({ data, selectedGrouping, onGroupingChange, includeSettingsDropdown = true }) {
  return (
    <LineChartWithValue
      title={<div><GroupingDropdown currentGrouping={selectedGrouping} onSelection={onGroupingChange} /></div>}
      value={data?.value}
      timeseries={data?.timeseries}
      groupedBy={data?.groupedBy}
      valueFormatter={n => n.toLocaleString('en-US')}
      includeSettingsDropdown={includeSettingsDropdown}
    />
  )
}