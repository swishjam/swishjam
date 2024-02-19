'use client'

import QueryBuilder from "@/components/QueryBuilder/QueryBuilder";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditUserSegmentPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [userSegment, setUserSegment] = useState()

  useEffect(() => {
    SwishjamAPI.UserSegments.retrieve(id).then(({ user_segment }) => setUserSegment(user_segment))
  }, [id])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Edit User Segment</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <QueryBuilder
        defaultQueryFilterGroups={userSegment?.query_filter_groups}
        onCreate={newSegment => router.push(`/users/segment/${newSegment.id}`)}
      />
    </main>
  )
}