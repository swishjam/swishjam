'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import LineChartWithValue from "../LineChartWithValue";
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


export default function ActiveUsersLineChart({ loadingStateOnly, scopedOrganizationId, includeSettingsDropdown = true }) {
  // const [grouping, setGrouping] = useState(SwishjamMemory.get('activeUsersGroupingPreference') || 'weekly');
  const [grouping, setGrouping] = useState('weekly');
  const [activeUserData, setActiveUserData] = useState();
  const apiEndpoint = scopedOrganizationId ? `/api/v1/organizations/${scopedOrganizationId}/users/active` : '/api/v1/users/active';

  useEffect(() => {
    if (loadingStateOnly) return;
    API.get(apiEndpoint, { type: grouping }).then(({ current_value, timeseries }) => {
      setActiveUserData({ currentValue: current_value, timeseries })
    })
  }, [grouping, loadingStateOnly, scopedOrganizationId]);

  return (
    <LineChartWithValue
      title={
        <GroupingDropdown 
          currentGrouping={grouping} 
          onSelection={newGrouping => {
            setActiveUserData();
            // SwishjamMemory.set('activeUsersGroupingPreference', newGrouping);
            setGrouping(newGrouping)
          }}
        />
      }
      value={activeUserData?.currentValue}
      timeseries={activeUserData?.timeseries}
      valueFormatter={n => n.toLocaleString('en-US')}
      dateFormatter={date => date}
      includeSettingsDropdown={includeSettingsDropdown}
    />
  )
}