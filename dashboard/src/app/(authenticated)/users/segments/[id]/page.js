'use client'

import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";

export default function UserSegmentDetailsPage({ params }) {
  const { id } = params;
  const [userSegment, setUserSegment] = useState()

  useEffect(() => {
    SwishjamAPI.UserSegments.retrieve(id).then(({ user_segment }) => setUserSegment(user_segment))
    SwishjamAPI.Users.list({ userSegmentIds: [id] })
  }, [id])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">User Segment Details</h1>
        </div>
      </div>
      <div className='relative bg-white rounded-md border border-gray-200 px-4 py-8'>
        <div>
          <h3 className='text-lg font-medium'>{userSegment?.name}</h3>
          <p className='text-sm text-gray-500'>{JSON.stringify(userSegment?.user_segment_filters)}</p>
        </div>
      </div>
    </main>
  )
}