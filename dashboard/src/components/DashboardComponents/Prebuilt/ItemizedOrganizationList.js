'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import ItemizedList from '@/components/DashboardComponents/ItemizedList';

export default function ItemizedUsersList() {
  const [recentOrganizations, setRecentOrganizations] = useState();

  useEffect(() => {
    API.get('/api/v1/organizations').then(setRecentOrganizations);
  }, []);

  return (
    <ItemizedList
      title='New Organizations'
      items={recentOrganizations}
      leftItemHeaderKey='name'
      rightItemKey='created_at'
      rightItemKeyFormatter={date => {
        return new Date(date)
          .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
          .replace(`, ${new Date(date).getFullYear()}`, '')
      }}
      fallbackAvatarGenerator={user => (user.full_name || user.email).split(' ').map(name => name[0]).join('').toUpperCase()}
      linkFormatter={user => `/users/${user.id}`}
      noDataMsg='No organizations identified yet.'
    />
  )
}