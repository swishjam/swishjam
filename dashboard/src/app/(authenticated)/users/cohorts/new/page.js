'use client'

import QueryBuilder from "@/components/QueryBuilder/QueryBuilder";
import UsersTablePreview from "@/components/QueryBuilder/UsersTablePreview";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserProfilesCollection from "@/lib/collections/user-profiles";
import { toast } from "sonner";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewUserSegmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [previewedUsers, setPreviewedUsers] = useState()
  const [currentPreviewedUsersPageNum, setCurrentPreviewedUsersPageNum] = useState()
  const [previewedUsersTotalPages, setPreviewedUsersTotalPages] = useState()
  const [previewedQueryFilterGroups, setPreviewedQueryFilterGroups] = useState()
  const [totalNumUsersInPreview, setTotalNumUsersInPreview] = useState()

  const saveSegment = ({ name, description, queryFilterGroups }) => {
    setIsLoading(true)
    SwishjamAPI.UserSegments.create({ name, description, queryFilterGroups }).then(({ user_segment, error }) => {
      if (error) {
        setIsLoading(false)
        toast.error('Failed to create user cohort', {
          description: error,
          duration: 10_000,
        })
      } else {
        router.push(`/users/cohorts/${user_segment.id}`)
      }
    })
  }

  const previewSegment = (queryFilterGroups, page = 1) => {
    setIsLoading(true)
    setCurrentPreviewedUsersPageNum(page)
    SwishjamAPI.UserSegments.preview({ queryFilterGroups, page }).then(({ error, users, total_pages, total_num_records }) => {
      setIsLoading(false)
      if (error) {
        toast.error('Failed to preview user cohort', {
          description: error,
          duration: 10_000,
        })
      } else {
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
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">New User Cohort</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <QueryBuilder
        defaultQueryFilterGroups={[{ sequence_index: 0, previous_query_filter_group_relationship_operator: null, query_filters: [{ sequence_index: 0, previous_query_filter_group_relationship_operator: null, config: {} }] }]}
        isLoading={isLoading}
        onSave={saveSegment}
        onPreview={previewSegment}
      />
      {previewedUsers && (
        <div className='relative bg-white rounded-md border border-gray-200 p-8 mt-8'>
          <h2 className='text-md font-medium text-gray-700 mb-2'>{totalNumUsersInPreview} users would fall into this cohort.</h2>
          <Button className='absolute top-2 right-2' variant='ghost' onClick={() => setPreviewedUsers()}>
            <XIcon className='h-4 w-4 text-gray-500' />
          </Button>
          <UsersTablePreview
            currentPageNum={currentPreviewedUsersPageNum}
            lastPageNum={previewedUsersTotalPages}
            onNewPage={page => previewSegment(previewedQueryFilterGroups, page)}
            queryFilterGroups={previewedQueryFilterGroups}
            userProfilesCollection={new UserProfilesCollection(previewedUsers)}
          />
        </div>
      )}
    </main>
  )
}