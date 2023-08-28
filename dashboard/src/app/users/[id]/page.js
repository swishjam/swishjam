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
import { PaperClipIcon } from '@heroicons/react/20/solid'
import { HomeIcon } from '@heroicons/react/20/solid'

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

const pages = [
  { name: 'Projects', href: '#', current: false },
  { name: 'Project Nero', href: '#', current: true },
]


const UserProfile = ({ params }) => {
  const { id: userId } = params;
  const [userData, setUserData] = useState(null);
  const [recentEvents, setRecentEvents] = useState(null);

  useEffect(() => {
    API.get(`/api/v1/users/${userId}`).then(setUserData);
    API.get(`/api/v1/users/${userId}/events`).then(setRecentEvents);
  }, [userId])

  console.log(userData);
  console.log(recentEvents);
  return (
    userData ? (
      <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
        <div>
        <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </a>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <a
                href={page.href}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={page.current ? 'page' : undefined}
              >
                {page.name}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav> 
        </div> 
        <div className='grid grid-cols-10 gap-4 mt-4'>
          <Card className='col-span-6'>
            <CardHeader>
              <div className='grid grid-cols-2 items-center'>
                <div className='flex items-center'>
                  <Avatar className="h-16 w-16 mr-4">
                    {userData.avatar_url
                      ? <AvatarImage src={userData.avatar_url} alt="Avatar" />
                      : <AvatarFallback className="text-lg">{userData.full_name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                    }
                  </Avatar>
                  <div>
                    <CardTitle className='text-2xl'>
                      {userData.full_name}
                    </CardTitle>
                    <CardDescription className='text-base text-gray-500'>
                      {userData.email}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col items-end justify-end text-base text-gray-500'>
                  <div className='space-y-2'>
                    {userData.organizations && userData.organizations.length > 0 && (
                      <div className='flex items-center'>
                        <UsersIcon className='h-4 w-4 text-gray-500 inline-block mr-2' />
                        <span className='text-base'>{userData.organizations[0].name}</span>
                        {userData.organizations.length > 1 && (
                          <HoverCard className="inline-block">
                            <HoverCardTrigger>
                              <span className="inline-flex cursor-default items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 ml-2">
                                +{userData.organizations.length - 1} others
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <span className='text-gray-500 text-sm'>
                                Also a member of{' '}
                                {userData.organizations.slice(1).map((org, i) => {
                                  return (
                                    <>
                                      <span className='font-medium italic'>{org.name}</span>
                                      {i !== userData.organizations.length - 2 ? ', ' : ''}
                                      {i === userData.organizations.length - 3 ? ' and ' : ''}
                                    </>
                                  )
                                })}
                              </span>.
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </div>
                    )}
                  </div>
                </div>


                <div>
      <div className="mt-4">
        <dl className="grid grid-cols-1 sm:grid-cols-2">
          <div className="px-4 py-6 sm:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Full name</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">Margot Foster</dd>
          </div>
          <div className="px-4 py-6 sm:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Application for</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">Backend Developer</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Email address</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">margotfoster@example.com</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Salary expectation</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">$120,000</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">About</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur
              qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud
              pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
            </dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Attachments</dt>
            <dd className="mt-2 text-sm text-gray-900">
              <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">resume_back_end_developer.pdf</span>
                      <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Download
                    </a>
                  </div>
                </li>
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">coverletter_back_end_developer.pdf</span>
                      <span className="flex-shrink-0 text-gray-400">4.5mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Download
                    </a>
                  </div>
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
            
            
            
            </CardContent>
          </Card>

          <EventFeed
            className="col-span-4"
            title='Recent Events'
            events={recentEvents}
            leftItemHeaderKey='name'
            rightItemKey='occurred_at'
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