'use client'

import NameAndDescriptionModal from "@/components/QueryBuilder/NameAndDescriptionModal";
import QueryBuilder from "@/components/QueryBuilder/QueryBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditUserSegmentPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false)
  const [nameAndDescriptionModalIsOpen, setNameAndDescriptionModalIsOpen] = useState(false)
  const [userSegment, setUserSegment] = useState()

  useEffect(() => {
    SwishjamAPI.UserSegments.retrieve(id).then(({ user_segment }) => setUserSegment(user_segment))
  }, [id])

  const updateSegment = queryFilterGroups => {
    setIsLoading(true)
    SwishjamAPI.UserSegments.update(id, { name: userSegment.name, description: userSegment.description, queryFilterGroups }).then(({ user_segment, error }) => {
      if (error) {
        setIsLoading(false)
        toast.error('Failed to update user segment', {
          description: error,
          duration: 10_000,
        })
      } else {
        toast.success('User segment updated successfully.')
        router.push(`/users/segments/${user_segment.id}`)
      }
    })
  }

  const previewSegment = queryFilterGroups => {
    setIsLoading(true)
    SwishjamAPI.UserSegments.preview({ queryFilterGroups }).then(({ user_segment, error }) => {
      setIsLoading(false)
      if (error) {
        toast.error('Failed to preview user segment', {
          description: error,
          duration: 10_000,
        })
      } else {
        setIsLoading(false)
        toast.success('User segment previewed successfully.')
      }
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      {userSegment && (
        <NameAndDescriptionModal
          defaultDescription={userSegment.description}
          defaultName={userSegment.name}
          isOpen={nameAndDescriptionModalIsOpen}
          onClose={() => setNameAndDescriptionModalIsOpen(false)}
          onSave={({ name, description }) => {
            setUserSegment({ ...userSegment, name, description })
            setNameAndDescriptionModalIsOpen(false)
          }}
          saveText='Update Segment'
        />
      )}
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <Link href='/users/segments' className="flex items-center space-x-1 mb-1 text-xs font-medium text-gray-500 hover:text-swishjam transition duration-300 hover:underline">
            <ArrowLeftIcon className='w-3 h-3' /> All Segments
          </Link>
          <div>
            <div>
              <h1 className="text-lg font-medium text-gray-700 mb-0 flex items-center">
                {userSegment?.name || <Skeleton className='h-8 w-16 mx-1 inline-block bg-gray-200' />}
                <div
                  className='group px-2 py-1 cursor-pointer ml-1 rounded-md transition-colors hover:bg-gray-200'
                  onClick={() => setNameAndDescriptionModalIsOpen(true)}
                >
                  <PencilIcon className='w-4 h-4 text-gray-700' />
                </div>
              </h1>
              {userSegment
                ? <h2 className='text-sm text-gray-500'>{userSegment.description}</h2>
                : <Skeleton className='h-6 w-72 mt-1 bg-gray-200' />
              }
            </div>
          </div>
        </div>

      </div>
      {userSegment ? (
        <QueryBuilder
          defaultSegmentName={userSegment.name}
          defaultSegmentDescription={userSegment.description}
          defaultQueryFilterGroups={userSegment.query_filter_groups}
          isLoading={isLoading}
          onPreview={previewSegment}
          onSave={({ queryFilterGroups }) => updateSegment(queryFilterGroups)}
          saveButtonText='Update Segment'
        />
      ) : (
        <>
          <Skeleton className='rounded-md w-full h-40 bg-gray-200' />
          <Skeleton className='rounded-md w-full h-40 bg-gray-200 mt-4' />
        </>
      )}
    </main>
  )
}