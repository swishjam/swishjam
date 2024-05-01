'use client'

import Breadcrumbs from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import PageWithHeader from "@/components/utils/PageWithHeader";
import LiveEventsFeed from "@/components/Dashboards/DataVisualizations/LiveEventsFeed";

export default function UserEventFeed({ params }) {
  const { id: userId } = params;
  const [userData, setUserData] = useState();

  useEffect(() => {
    SwishjamAPI.Users.retrieve(userId).then(setUserData);
  }, [])

  const breadcrumbs = [
    { title: 'Users', url: '/users' },
    {
      title: !userData ? <Skeleton className='h-8 w-12' /> : userData.full_name || userData.email || (userData.user_unique_identifier ? `Un-named User: ${userData.user_unique_identifier}` : `Anonymous User ${userData.id.slice(0, 6)}`),
      url: `/users/${userId}`
    },
    { title: 'Event Feed' }
  ]
  return (
    <PageWithHeader title={<Breadcrumbs paths={breadcrumbs} />}>
      <LiveEventsFeed userId={userId} />
    </PageWithHeader>
  )
}