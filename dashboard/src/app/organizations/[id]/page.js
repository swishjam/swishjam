'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import { API } from "@/lib/api-client/base";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EventFeed from "@/components/DashboardComponents/EventFeed";
import { UsersIcon, CalendarIcon } from "@heroicons/react/24/outline";

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

const OrganizationProfile = ({ params }) => {
  const { id } = params;

  const [organizationData, setOrganizationData] = useState();

  useEffect(() => {
    API.get(`/api/v1/organizations/${id}`).then(setOrganizationData);
  }, [])

  if (!organizationData) return <LoadingState />

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <Card>
        <CardHeader>
          <div className='grid grid-cols-2 items-center'>
            <div className='flex items-center'>
              <Avatar className="h-20 w-20 mr-4">
                {organizationData.avatar_url
                  ? <AvatarImage src={organizationData.avatar_url} alt="Avatar" />
                  : <AvatarFallback className="text-lg">{organizationData.name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                }
              </Avatar>
              <div>
                <CardTitle className='text-4xl'>
                  {organizationData.name}
                </CardTitle>
                {/* <CardDescription className='text-base text-gray-500'>
                  {userData.email}
                </CardDescription> */}
              </div>
            </div>
            <div className='flex flex-col items-end justify-end text-base text-gray-500'>
              <div className='space-y-2'>
                <div className='flex items-center'>
                  <CalendarIcon className='h-4 w-4 text-gray-500 inline-block mr-2' />
                  <span className='text-base'>{new Date(organizationData.created_at).toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className='grid grid-cols-3 gap-4 mt-4'>
        <Card className='col-span-2'>
          <CardHeader>
            <CardTitle className='text-lg'>
              Top Users
            </CardTitle>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>


        {/* <EventFeed
          title='Recent Events'
          events={recentEvents}
          leftItemHeaderKey='name'
          rightItemKey='created_at'
          rightItemKeyFormatter={date => {
            return new Date(date)
              .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
              .replace(`, ${new Date(date).getFullYear()}`, '')
          }}
        /> */}
      </div>
    </main>
  )
}

export default AuthenticatedView(OrganizationProfile, LoadingState);