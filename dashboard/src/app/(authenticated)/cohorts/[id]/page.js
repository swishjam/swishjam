'use client'

import { ArrowLeftIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Collection from "@/lib/models/collection";
import DottedUnderline from "@/components/utils/DottedUnderline";
import FilterGroupsDisplay from "@/components/QueryBuilder/FilterGroupsDisplay";
import Link from "next/link";
import OrganizationProfile from "@/lib/models/organization";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { Tooltipable } from "@/components/ui/tooltip";
import UserProfilesCollection from "@/lib/collections/user-profiles";
import UsersTablePreview from "@/components/QueryBuilder/UsersTablePreview";
import { useEffect, useState } from "react";
import OrganizationsTablePreview from "@/components/QueryBuilder/OrganizationsTablePreview";

export default function CohortDetailsPage({ params }) {
  const { id } = params;
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [lastPageNum, setLastPageNum] = useState();
  const [totalNumProfilesInCohort, setTotalNumProfilesInCohort] = useState();
  const [totalProfilesCounts, setTotalProfilesCounts] = useState();
  const [cohort, setCohort] = useState()
  const [profilesCollectionForCohort, setProfilesCollectionForCohort] = useState();

  const getUsersForCohort = async page => {
    setProfilesCollectionForCohort()
    const { users, total_pages, total_num_records } = await SwishjamAPI.Users.list({ limit: 10, page, cohortIds: [id] })
    setProfilesCollectionForCohort(new UserProfilesCollection(users))
    setLastPageNum(total_pages)
    setTotalNumProfilesInCohort(total_num_records)
  }

  const getOrganizationsForCohort = async page => {
    setProfilesCollectionForCohort()
    const { organizations, total_pages, total_num_records } = await SwishjamAPI.Organizations.list({ limit: 10, page, cohortIds: [id] })
    setProfilesCollectionForCohort(new Collection(OrganizationProfile, organizations))
    setLastPageNum(total_pages)
    setTotalNumProfilesInCohort(total_num_records)
  }

  useEffect(() => {
    SwishjamAPI.Cohorts.retrieve(id).then(({ cohort }) => {
      setCohort(cohort)
      if (cohort.type === 'Cohorts::OrganizationCohort') {
        // count
        SwishjamAPI.Organizations.count().then(res => setTotalProfilesCounts(res.count))
      } else {
        // total_num_users, total_num_identified_users
        SwishjamAPI.Users.count().then(setTotalProfilesCounts)
      }
    })
  }, [id])

  useEffect(() => {
    if (cohort) {
      if (cohort.type === 'Cohorts::OrganizationCohort') {
        getOrganizationsForCohort(currentPageNum);
      } else {
        getUsersForCohort(currentPageNum);
      }
    }
  }, [currentPageNum, cohort?.type])

  const humanizedProfileType = cohort?.type === 'Cohorts::OrganizationCohort' ? 'organization' : 'user';

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className="my-8 grid grid-cols-2">
        <div>
          <Link href={`/cohorts/${humanizedProfileType}s`} className='text-gray-400 hover:underline'>
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
          <Link href={`/cohorts/${id}/edit`}>
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
                {cohort?.name ? <DottedUnderline className='text-lg'>{cohort.name}</DottedUnderline> : <Skeleton className='h-8 w-48' />}
              </h1>
              <h2 className="text-xs text-gray-500">
                {cohort ? cohort.description : <Skeleton className='h-8 w-72' />}
              </h2>
            </div>
            <div className='flex justify-end'>
              {totalNumProfilesInCohort === undefined && totalProfilesCounts === undefined && <Skeleton className='h-8 w-20' />}
              {totalNumProfilesInCohort !== undefined && totalProfilesCounts !== undefined && (
                <Tooltipable
                  content={
                    <h4 className='text-xs text-gray-500'>
                      {totalNumProfilesInCohort} {humanizedProfileType}{totalNumProfilesInCohort === 1 ? '' : 's'} currently falls into this cohort, which is {(totalNumProfilesInCohort / (typeof totalProfilesCounts === 'number' ? totalProfilesCounts : totalProfilesCounts.total_num_users) * 100).toFixed(2)}% of all {humanizedProfileType}s{typeof totalProfilesCounts === 'object' && <>, and {(totalNumProfilesInCohort / totalProfilesCounts.total_num_identified_users * 100).toFixed(2)}% of identified users</>}.
                    </h4>
                  }
                >
                  <div className="rounded-md bg-blue-50 ring-blue-600/20 text-blue-600 text-sm font-semibold cursor-default w-fit px-4 py-2">
                    <UserIcon className='h-4 w-4 inline-block mr-1' />
                    <DottedUnderline className='font-normal text-blue-600 hover:text-blue-700'>
                      {totalNumProfilesInCohort} {humanizedProfileType}{totalNumProfilesInCohort === 1 ? '' : 's'}
                    </DottedUnderline>
                  </div>
                </Tooltipable>
              )}
            </div>
          </div>
        </div>
        <div className='text-gray-700'>
          <FilterGroupsDisplay filterGroups={cohort?.query_filter_groups} />
        </div>
      </div>
      <div className='mt-8 bg-white rounded border border-gray-200 p-4'>
        {cohort?.type ?
          cohort.type === 'Cohorts::UserCohort'
            ? (
              <UsersTablePreview
                userProfilesCollection={profilesCollectionForCohort}
                queryFilterGroups={cohort?.query_filter_groups}
                currentPageNum={currentPageNum}
                lastPageNum={lastPageNum}
                onNewPage={setCurrentPageNum}
              />
            ) : (
              <OrganizationsTablePreview
                organizationProfilesCollection={profilesCollectionForCohort}
                queryFilterGroups={cohort?.query_filter_groups}
                currentPageNum={currentPageNum}
                lastPageNum={lastPageNum}
                onNewPage={setCurrentPageNum}
              />
            )
          : <Skeleton className='h-96' />
        }
      </div>
    </main>
  )
}