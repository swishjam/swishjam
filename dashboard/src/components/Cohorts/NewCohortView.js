'use client'

import QueryBuilder from "@/components/QueryBuilder/QueryBuilder";
import UsersTablePreview from "@/components/QueryBuilder/UsersTablePreview";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "../ui/skeleton";
import OrganizationsTablePreview from "../QueryBuilder/OrganizationsTablePreview";
import Collection from "@/lib/models/collection";
import OrganizationProfile from "@/lib/models/organization";
import UserProfile from "@/lib/models/user-profile";

export default function NewCohortView({ profileType }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingPreviewData, setIsFetchingPreviewData] = useState(false)
  const [previewedProfiles, setPreviewedProfiles] = useState()
  const [currentPreviewedProfilesPageNum, setCurrentPreviewedProfilesPageNum] = useState()
  const [previewedProfilesTotalPages, setPreviewedProfilesTotalPages] = useState()
  const [previewedQueryFilterGroups, setPreviewedQueryFilterGroups] = useState()
  const [totalNumProfilesInPreview, setTotalNumProfilesInPreview] = useState()

  const saveCohort = ({ name, description, queryFilterGroups }) => {
    setIsLoading(true)
    SwishjamAPI.Cohorts.create({ type: profileType === 'user' ? 'Cohorts::UserCohort' : 'Cohorts::OrganizationCohort', name, description, queryFilterGroups }).then(({ cohort, error }) => {
      if (error) {
        setIsLoading(false)
        toast.error('Failed to create cohort', {
          description: error,
          duration: 10_000,
        })
      } else {
        router.push(`/cohorts/${cohort.id}`)
      }
    })
  }

  const previewCohort = (queryFilterGroups, page = 1) => {
    setIsFetchingPreviewData(true)
    setCurrentPreviewedProfilesPageNum(page)
    SwishjamAPI.Cohorts.preview({ profileType, queryFilterGroups, page, limit: 10 }).then(({ error, profiles, total_pages, total_num_records }) => {
      setIsFetchingPreviewData(false)
      if (error) {
        toast.error('Failed to preview cohort', {
          description: error,
          duration: 10_000,
        })
      } else {
        setPreviewedQueryFilterGroups(queryFilterGroups)
        setPreviewedProfiles(profiles)
        setPreviewedProfilesTotalPages(total_pages)
        setTotalNumProfilesInPreview(total_num_records)
        setIsLoading(false)
      }
    })
  }

  return (
    <>
      <QueryBuilder
        defaultQueryFilterGroups={[{ sequence_index: 0, previous_query_filter_group_relationship_operator: null, query_filters: [{ sequence_index: 0, previous_query_filter_group_relationship_operator: null, config: {} }] }]}
        isLoading={isLoading}
        onSave={saveCohort}
        onPreview={previewCohort}
        profileType={profileType}
      />
      {(previewedProfiles || isFetchingPreviewData) && (
        <div className='relative bg-white rounded-md border border-gray-200 p-8 mt-8'>
          <h2 className='text-md font-medium text-gray-700 mb-2 flex items-center'>
            {isFetchingPreviewData ? <Skeleton className='h-6 w-8 inline-block bg-gray-200 mr-2' /> : totalNumProfilesInPreview} {profileType}s would fall into this cohort.
          </h2>
          <Button className='absolute top-2 right-2' variant='ghost' onClick={() => setPreviewedProfiles()}>
            <XIcon className='h-4 w-4 text-gray-500' />
          </Button>
          {profileType === 'user'
            ? (
              <UsersTablePreview
                currentPageNum={currentPreviewedProfilesPageNum}
                lastPageNum={previewedProfilesTotalPages}
                onNewPage={page => previewCohort(previewedQueryFilterGroups, page)}
                queryFilterGroups={previewedQueryFilterGroups}
                userProfilesCollection={isFetchingPreviewData ? null : new Collection(UserProfile, previewedProfiles)}
              />
            ) : (
              <OrganizationsTablePreview
                currentPageNum={currentPreviewedProfilesPageNum}
                lastPageNum={previewedProfilesTotalPages}
                onNewPage={page => previewCohort(previewedQueryFilterGroups, page)}
                queryFilterGroups={previewedQueryFilterGroups}
                organizationProfilesCollection={isFetchingPreviewData ? null : new Collection(OrganizationProfile, previewedProfiles)}
              />
            )}
        </div>
      )}
    </>
  )
}