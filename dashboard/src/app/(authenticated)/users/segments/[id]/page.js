'use client'

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DottedUnderline from "@/components/utils/DottedUnderline";
import FiltersDisplayFeed from "@/components/UserSegments/FiltersDisplayFeed";
import { humanizeVariable } from "@/lib/utils/misc";
import Pagination from "@/components/Pagination/Pagination";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { Skeleton } from "@/components/ui/skeleton";
import Table from "@/components/utils/Table";
import { Tooltipable } from "@/components/ui/tooltip";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import UserProfilesCollection from "@/lib/collections/user-profiles";
import Link from "next/link";

export default function UserSegmentDetailsPage({ params }) {
  const { id } = params;
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [lastPageNum, setLastPageNum] = useState();
  const [totalNumUsersInSegment, setTotalNumUsersInSegment] = useState();
  const [totalUserCounts, setTotalUserCounts] = useState();
  const [userSegment, setUserSegment] = useState()
  const [userProfilesCollectionForSegment, setUserProfilesCollectionForSegment] = useState();

  let tableHeaders;
  if (userSegment) {
    tableHeaders = ['User']
    userSegment.user_segment_filters.forEach(filter => {
      if (filter.config.object_type === 'user') {
        tableHeaders.push(humanizeVariable(filter.config.user_property_name))
      } else {
        tableHeaders.push(
          <>
            # of <DottedUnderline className='text-zinc-500 hover:text-zinc-700'>{filter.config.event_name}</DottedUnderline> events last <DottedUnderline className='text-zinc-500 hover:text-zinc-700'>{filter.config.num_lookback_days} days</DottedUnderline>
          </>
        )
      }
    })
    tableHeaders.push('Created At')
  }

  const getUsersForSegment = async page => {
    const { users, total_pages, total_num_records } = await SwishjamAPI.Users.list({ page, userSegmentIds: [id] })
    setUserProfilesCollectionForSegment(new UserProfilesCollection(users))
    setLastPageNum(total_pages)
    setTotalNumUsersInSegment(total_num_records)
  }

  useEffect(() => {
    SwishjamAPI.UserSegments.retrieve(id).then(({ user_segment }) => setUserSegment(user_segment))
    SwishjamAPI.Users.count().then(setTotalUserCounts)
    getUsersForSegment();
  }, [id])

  useEffect(() => {
    getUsersForSegment(currentPageNum);
  }, [currentPageNum])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">
            Segment Details
          </h1>
        </div>
      </div>
      <div className='bg-white rounded-md border border-gray-200 p-8'>
        <div className='mb-4'>
          <h1 className="text-lg font-medium text-gray-700 mb-1">
            {userSegment?.name ? <DottedUnderline className='text-lg'>{userSegment.name}</DottedUnderline> : <Skeleton className='h-8 w-12' />}
          </h1>
          <h2 className="text-xs text-gray-500">
            {userSegment?.description || <Skeleton className='h-6 w-24' />}
          </h2>
        </div>
        <div className='text-gray-700'>
          <FiltersDisplayFeed filters={userSegment?.user_segment_filters} />
        </div>
        <div className='mt-6'>
          {totalNumUsersInSegment === undefined && <Skeleton className='h-6 w-18' />}
          {totalNumUsersInSegment !== undefined && (
            <h2 className="text-sm text-gray-700 font-semibold cursor-default w-fit">
              <Tooltipable
                content={
                  <h4 className='text-xs text-gray-500'>
                    {totalNumUsersInSegment} users is {(totalNumUsersInSegment / totalUserCounts.total_count * 100).toFixed(2)}% of all users, and {(totalNumUsersInSegment / totalUserCounts.identified_count * 100).toFixed(2)}% of identified users.
                  </h4>
                }
              >
                <div className="inline-block">
                  <DottedUnderline>{totalNumUsersInSegment !== undefined ? totalNumUsersInSegment : <Skeleton className='h-6 w-8' />} users</DottedUnderline>
                </div>
              </Tooltipable>
              {' '}currently fall into this segment.
            </h2>
          )}
        </div>
      </div>
      <div className='mt-8 bg-white rounded border border-gray-200 p-4'>
        {userProfilesCollectionForSegment === undefined
          ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className='h-12 w-ful my-1' />)
          : (
            userProfilesCollectionForSegment.models().length === 0
              ? <p className='text-sm text-gray-700'>No users match this segment.</p>
              : (
                <>
                  <Table
                    headers={tableHeaders}
                    rows={userProfilesCollectionForSegment.models().map(user => ([
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Avatar className="border border-slate-200">
                            <AvatarImage src={user.gravatarUrl()} />
                            <AvatarFallback>{user.initials()}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-4">
                          <Link href={`/users/${user.id()}`} className='hover:underline'>
                            <span className="block font-medium text-gray-900">{user.fullName() || user.email()}</span>
                            {user.fullName() && user.email() ? <span className="text-gray-500">{user.email()}</span> : null}
                          </Link>
                        </div>
                      </div>,
                      ...userSegment.user_segment_filters.map(filter => {
                        if (filter.config.object_type === 'user') {
                          return user.metadata()[filter.config.user_property_name] || 'N/A'
                        } else {
                          return user.attributes()[`${filter.config.event_name.replace(/\s/g, '_')}_count_for_user`]
                        }
                      }),
                      <span className='text-sm text-gray-700'>{prettyDateTime(user.createdAt())}</span>,
                    ]))}
                  />
                  {userProfilesCollectionForSegment.models().length > 0 && (
                    <Pagination
                      currentPage={currentPageNum}
                      lastPageNum={lastPageNum}
                      onNewPageSelected={setCurrentPageNum}
                    />
                  )}
                </>
              )
          )}
      </div>
    </main>
  )
}