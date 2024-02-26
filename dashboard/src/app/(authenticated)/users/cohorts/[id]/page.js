'use client'

import { Button } from "@/components/ui/button";
import DottedUnderline from "@/components/utils/DottedUnderline";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltipable } from "@/components/ui/tooltip";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import UserProfilesCollection from "@/lib/collections/user-profiles";
import Link from "next/link";
import { ArrowLeftIcon, UserIcon, UserX2Icon } from "lucide-react";
import FilterGroupsDisplay from "@/components/QueryBuilder/FilterGroupsDisplay";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import UsersTablePreview from "@/components/QueryBuilder/UsersTablePreview";

export default function UserSegmentDetailsPage({ params }) {
  const { id } = params;
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [lastPageNum, setLastPageNum] = useState();
  const [totalNumUsersInSegment, setTotalNumUsersInSegment] = useState();
  const [totalUserCounts, setTotalUserCounts] = useState();
  const [userSegment, setUserSegment] = useState()
  const [userProfilesCollectionForSegment, setUserProfilesCollectionForSegment] = useState();

  const getUsersForSegment = async page => {
    const { users, total_pages, total_num_records } = await SwishjamAPI.Users.list({ page, userSegmentIds: [id] })
    setUserProfilesCollectionForSegment(new UserProfilesCollection(users))
    setLastPageNum(total_pages)
    setTotalNumUsersInSegment(total_num_records)
  }

  useEffect(() => {
    SwishjamAPI.UserSegments.retrieve(id).then(({ user_segment }) => setUserSegment(user_segment))
    SwishjamAPI.Users.count().then(setTotalUserCounts)
  }, [id])

  useEffect(() => {
    getUsersForSegment(currentPageNum);
  }, [currentPageNum])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className="my-8 grid grid-cols-2">
        <div>
          <Link href='/users/cohorts' className='text-gray-400 hover:underline'>
            <h4 className='text-xs flex items-center'>
              <ArrowLeftIcon className='h-4 w-4 inline-block mr-1' />
              Back to all cohorts
            </h4>
          </Link>
          <h1 className="text-lg font-medium text-gray-700">
            Cohort Details
          </h1>
        </div>
        <div className='flex justify-end'>
          <Link href={`/users/cohorts/${id}/edit`}>
            <Button variant='swishjam' className='flex items-center space-x-2'>
              <PencilSquareIcon className='h-4 w-4 mr-2' />
              Edit Cohort
            </Button>
          </Link>
        </div>
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
                      {totalNumUsersInSegment} user currently falls into this cohort, which {totalNumUsersInSegment === 1 ? '' : 's'} is {(totalNumUsersInSegment / totalUserCounts.total_num_users * 100).toFixed(2)}% of all users, and {(totalNumUsersInSegment / totalUserCounts.total_num_identified_users * 100).toFixed(2)}% of identified users.
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
            <UsersTablePreview
              userProfilesCollection={userProfilesCollectionForSegment}
              queryFilterGroups={userSegment?.query_filter_groups}
              currentPageNum={currentPageNum}
              lastPageNum={lastPageNum}
              onNewPage={setCurrentPageNum}
            />
          )}
      </div>
    </main>
  )
}