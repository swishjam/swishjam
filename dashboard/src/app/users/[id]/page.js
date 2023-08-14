'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import { API } from "@/lib/api-client/base";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EventFeed from "@/components/DashboardComponents/EventFeed";

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
    <Card>
      <CardHeader>
        <div className='flex items-center'>
          <Skeleton className='rounded-full h-20 w-20 mr-4' />
          <div>
            <Skeleton className='h-12 w-24' />
            <Skeleton className='h-6 w-48 mt-2' />
          </div>
        </div>
      </CardHeader>
    </Card>
  </main>
)

const UserProfile = ({ params }) => {
  const { id: userId } = params;
  const [userData, setUserData] = useState(null);
  const [recentEvents, setRecentEvents] = useState(null);

  useEffect(() => {
    API.get(`/api/v1/users/${userId}`).then(setUserData);
    API.get(`/api/v1/users/${userId}/events`).then(setRecentEvents);
  }, [userId])

  return (
    userData ? (
      <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
        <Card>
          <CardHeader>
            <div className='flex items-center'>
              <Avatar className="h-20 w-20 mr-4">
                {userData.avatar_url
                  ? <AvatarImage src={userData.avatar_url} alt="Avatar" />
                  : <AvatarFallback className="text-lg">{userData.full_name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                }
              </Avatar>
              <div>
                <CardTitle className='text-4xl'>
                  {userData.full_name}
                </CardTitle>
                <CardDescription className='text-lg text-gray-500'>
                  {userData.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className='grid grid-cols-3 gap-4 mt-4'>
          <Card className='col-span-2'>
            <CardHeader>
              <CardTitle className='text-lg'>
                MRR
              </CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
          

          <EventFeed 
            title='Recent Events' 
            events={recentEvents} 
            leftItemHeaderKey='name'
            rightItemKey='created_at'
            rightItemKeyFormatter={date => {
              return new Date(date)
                .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
                .replace(`, ${new Date(date).getFullYear()}`, '')
            }}
          />
        </div>
      </main>
    ) : <LoadingState />
  )
}

export default AuthenticatedView(UserProfile, LoadingState);