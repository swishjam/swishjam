'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import ItemizedList from '@/components/Dashboards/DataVisualizations/ItemizedList';

export default function ItemizedUsersList({ loadingStateOnly = false }) {
  const [recentUsers, setRecentUsers] = useState();

  useEffect(() => {
    if (!loadingStateOnly) {
      API.get('/api/v1/users').then(({ users }) => setRecentUsers(users));
    }
  }, [loadingStateOnly]);

  return (
    <ItemizedList
      title='New Users'
      viewMoreUrl={'/users'}
      items={recentUsers}
      leftItemHeaderKey='full_name'
      leftItemSubHeaderKey='email'
      rightItemKey='created_at'
      rightItemKeyFormatter={date => {
        return new Date(date)
          .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
          .replace(`, ${new Date(date).getFullYear()}`, '')
      }}
      fallbackAvatarGenerator={user => (user.full_name || user.email).split(' ').map(name => name[0]).join('').toUpperCase()}
      linkFormatter={user => `/users/${user.id}`}
    />
  )
}