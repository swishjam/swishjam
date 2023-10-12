'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-client/base';
import ItemizedList from '@/components/Dashboards/Components/ItemizedList';

export default function ItemizedUsersList({ loadingStateOnly = false }) {
  const [recentOrganizations, setRecentOrganizations] = useState();

  useEffect(() => {
    if (!loadingStateOnly) {
      API.get('/api/v1/organizations').then(({ organizations }) => setRecentOrganizations(organizations));
    }
  }, [loadingStateOnly]);

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
      fallbackAvatarGenerator={org => org.name.split(' ').map(name => name[0]).join('').toUpperCase()}
      linkFormatter={org => `/organizations/${org.id}`}
      noDataMsg='No organizations identified yet.'
    />
  )
}