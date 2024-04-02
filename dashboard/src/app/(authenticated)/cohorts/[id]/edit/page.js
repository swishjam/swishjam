'use client'

import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NameAndDescriptionModal from "@/components/QueryBuilder/NameAndDescriptionModal";
import QueryBuilder from "@/components/QueryBuilder/QueryBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserProfilesCollection from "@/lib/collections/user-profiles";
import UsersTablePreview from "@/components/QueryBuilder/UsersTablePreview";
import { XIcon } from "lucide-react";

export default function EditCohortPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingPreviewData, setIsFetchingPreviewData] = useState(false)
  const [nameAndDescriptionModalIsOpen, setNameAndDescriptionModalIsOpen] = useState(false)
  const [cohort, setCohort] = useState()

  const [previewedUsers, setPreviewedUsers] = useState()
  const [currentPreviewedUsersPageNum, setCurrentPreviewedUsersPageNum] = useState()
  const [previewedUsersTotalPages, setPreviewedUsersTotalPages] = useState()
  const [previewedQueryFilterGroups, setPreviewedQueryFilterGroups] = useState()
  const [totalNumUsersInPreview, setTotalNumUsersInPreview] = useState()

  useEffect(() => {
    SwishjamAPI.Cohorts.retrieve(id).then(({ cohort }) => setCohort(cohort))
  }, [id])

  const updateCohort = queryFilterGroups => {
    setIsLoading(true)
    SwishjamAPI.Cohorts.update(id, { name: cohort.name, description: cohort.description, queryFilterGroups }).then(({ cohort, error }) => {
      if (error) {
        setIsLoading(false)
        toast.error('Failed to update cohort', {
          description: error,
          duration: 10_000,
        })
      } else {
        toast.success('Cohort updated successfully.')
        router.push(`/cohorts/${cohort.id}`)
      }
    })
  }

  const previewCohort = (queryFilterGroups, page = 1) => {
    setIsFetchingPreviewData(true)
    setCurrentPreviewedUsersPageNum(page)
    SwishjamAPI.Cohorts.preview({ queryFilterGroups, page, limit: 10 }).then(({ error, users, total_pages, total_num_records }) => {
      setIsFetchingPreviewData(false)
      if (error) {
        toast.error('Failed to preview user cohort', {
          description: error,
          duration: 10_000,
        })
      } else {
        setIsLoading(false)
        setPreviewedQueryFilterGroups(queryFilterGroups)
        setPreviewedUsers(users)
        setPreviewedUsersTotalPages(total_pages)
        setTotalNumUsersInPreview(total_num_records)
        setIsLoading(false)
      }
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      {cohort && (
        <NameAndDescriptionModal
          defaultDescription={cohort.description}
          defaultName={cohort.name}
          isOpen={nameAndDescriptionModalIsOpen}
          onClose={() => setNameAndDescriptionModalIsOpen(false)}
          onSave={({ name, description }) => {
            setCohort({ ...cohort, name, description })
            setNameAndDescriptionModalIsOpen(false)
          }}
          saveText='Update Cohort'
        />
      )}
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <Link href='/users/cohorts' className="flex items-center space-x-1 mb-1 text-xs font-medium text-gray-500 hover:text-swishjam transition duration-300 hover:underline">
            <ArrowLeftIcon className='w-3 h-3' /> All Cohorts
          </Link>
          <div>
            <div>
              <h1 className="text-lg font-medium text-gray-700 mb-0 flex items-center">
                {cohort?.name || <Skeleton className='h-8 w-16 mx-1 inline-block bg-gray-200' />}
                <div
                  className='group px-2 py-1 cursor-pointer ml-1 rounded-md transition-colors hover:bg-gray-200'
                  onClick={() => setNameAndDescriptionModalIsOpen(true)}
                >
                  <PencilIcon className='w-4 h-4 text-gray-700' />
                </div>
              </h1>
              {cohort
                ? <h2 className='text-sm text-gray-500'>{cohort.description}</h2>
                : <Skeleton className='h-6 w-72 mt-1 bg-gray-200' />
              }
            </div>
          </div>
        </div>

      </div>
      {cohort ? (
        <QueryBuilder
          defaultCohortName={cohort.name}
          defaultCohortDescription={cohort.description}
          defaultQueryFilterGroups={cohort.query_filter_groups}
          isLoading={isLoading || isFetchingPreviewData}
          onPreview={previewCohort}
          onSave={({ queryFilterGroups }) => updateCohort(queryFilterGroups)}
          profileType={cohort.type === 'Cohorts::UserCohort' ? 'user' : 'organization'}
          saveButtonText='Update Cohort'
        />
      ) : (
        <>
          <Skeleton className='rounded-md w-full h-40 bg-gray-200' />
          <Skeleton className='rounded-md w-full h-40 bg-gray-200 mt-4' />
        </>
      )}
      {previewedUsers && (
        <div className='relative bg-white rounded-md border border-gray-200 p-8 mt-8'>
          <h2 className='text-md font-medium text-gray-700 mb-2'>{totalNumUsersInPreview} users would fall into this cohort.</h2>
          <Button className='absolute top-2 right-2' variant='ghost' onClick={() => setPreviewedUsers()}>
            <XIcon className='h-4 w-4 text-gray-500' />
          </Button>
          <UsersTablePreview
            currentPageNum={currentPreviewedUsersPageNum}
            lastPageNum={previewedUsersTotalPages}
            onNewPage={page => previewCohort(previewedQueryFilterGroups, page)}
            queryFilterGroups={previewedQueryFilterGroups}
            userProfilesCollection={isFetchingPreviewData ? null : new UserProfilesCollection(previewedUsers)}
          />
        </div>
      )}
    </main>
  )
}