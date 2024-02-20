'use client'

import QueryBuilder from "@/components/QueryBuilder/QueryBuilder";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewUserSegmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)

  const saveSegment = ({ name, description, queryFilterGroups }) => {
    setIsLoading(true)
    SwishjamAPI.UserSegments.create({ name, description, queryFilterGroups }).then(({ user_segment, error }) => {
      if (error) {
        setIsLoading(false)
        toast.error('Failed to create user segment', {
          description: error,
          duration: 10_000,
        })
      } else {
        router.push(`/users/segments/${user_segment.id}`)
      }
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">New User Segment</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <QueryBuilder
        isLoading={isLoading}
        onSave={saveSegment}
      />
    </main>
  )
}