'use client'

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DottedUnderline from "@/components/utils/DottedUnderline";
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
import { ArrowLeftIcon, UserIcon } from "lucide-react";
import FilterGroupsDisplay from "@/components/QueryBuilder/FilterGroupsDisplay";

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
    userSegment.query_filter_groups.forEach(filterGroup => {
      filterGroup.query_filters.forEach(filter => {
        if (filter.type === 'QueryFilters::UserProperty') {
          tableHeaders.push(humanizeVariable(filter.config.property_name))
        } else if (filter.type === 'QueryFilters::EventCountForUserOverTimePeriod') {
          tableHeaders.push(
            <>
              # of <DottedUnderline className='text-zinc-500 hover:text-zinc-700'>{filter.config.event_name}</DottedUnderline> events last <DottedUnderline className='text-zinc-500 hover:text-zinc-700'>{filter.config.num_lookback_days} days</DottedUnderline>
            </>
          )
        }
      })
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
      <div className="my-8">
        <Link href='/users/segments' className='text-gray-400 hover:underline'>
          <h4 className='text-xs flex items-center'>
            <ArrowLeftIcon className='h-4 w-4 inline-block mr-1' />
            Back to all segments
          </h4>
        </Link>
        <h1 className="text-lg font-medium text-gray-700">
          Segment Details
        </h1>
      </div>
      <div className='bg-white rounded-md border border-gray-200 p-8'>
        <div className='mb-4'>
          <div className='grid grid-cols-4 items-start space-x-4'>
            <div className='col-span-3'>
              <h1 className="text-lg font-medium text-gray-700 mb-1">
                {userSegment?.name ? <DottedUnderline className='text-lg'>{userSegment.name}</DottedUnderline> : <Skeleton className='h-8 w-48' />}
              </h1>
              <h2 className="text-xs text-gray-500">
                {userSegment?.description || <Skeleton className='h-8 w-72' />}
              </h2>
            </div>
            <div className='flex justify-end'>
              {totalNumUsersInSegment === undefined && totalUserCounts === undefined && <Skeleton className='h-8 w-20' />}
              {totalNumUsersInSegment !== undefined && totalUserCounts !== undefined && (
                <Tooltipable
                  content={
                    <h4 className='text-xs text-gray-500'>
                      {totalNumUsersInSegment} user currently falls into this segment, which {totalNumUsersInSegment === 1 ? '' : 's'} is {(totalNumUsersInSegment / totalUserCounts.total_num_users * 100).toFixed(2)}% of all users, and {(totalNumUsersInSegment / totalUserCounts.total_num_identified_users * 100).toFixed(2)}% of identified users.
                    </h4>
                  }
                >
                  <div className="rounded-md bg-blue-50 ring-blue-600/20 text-blue-600 text-sm font-semibold cursor-default w-fit px-4 py-2">
                    <UserIcon className='h-4 w-4 inline-block mr-1' />
                    <DottedUnderline className='font-normal text-blue-600 hover:text-blue-700'>
                      {totalNumUsersInSegment} user{totalNumUsersInSegment === 1 ? '' : 's'}
                    </DottedUnderline>
                  </div>
                </Tooltipable>
              )}
            </div>
          </div>
        </div>
        <div className='text-gray-700'>
          <FilterGroupsDisplay filterGroups={userSegment?.query_filter_groups} />
        </div>
      </div>
      <div className='mt-8 bg-white rounded border border-gray-200 p-4'>
        {userProfilesCollectionForSegment === undefined || userSegment === undefined
          ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className='h-12 w-full my-1' />)
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
                      ...[].concat(...userSegment.query_filter_groups.map(filterGroup => {
                        return filterGroup.query_filters.map(filter => {
                          if (filter.type === 'QueryFilters::UserProperty') {
                            return user.metadata()[filter.config.property_name] || '-'
                          } else {
                            return user.attributes()[`${filter.config.event_name.replace(/\s/g, '_')}_count_for_user`]
                          }
                        })
                      })),
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