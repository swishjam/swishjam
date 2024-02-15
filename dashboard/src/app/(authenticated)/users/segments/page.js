'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";

export default function UserSegmentsPage() {
  const [userSegments, setUserSegments] = useState()

  useEffect(() => {
    SwishjamAPI.UserSegments.list().then(setUserSegments)
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">User Segments</h1>
        </div>

        <div className="w-full flex items-center justify-end">
          <Button variant='swishjam' href='/users/segments/new'>New User Segment</Button>
        </div>
      </div>
      <div className='relative bg-white rounded-md border border-gray-200 px-4 py-8'>
        {userSegments?.map(segment => (
          <div key={segment.id} className='flex items-center justify-between border-b border-gray-200 py-4'>
            <div>
              <h3 className='text-lg font-medium'>{segment.name}</h3>
              <p className='text-sm text-gray-500'>{JSON.stringify(segment.user_segment_filters)}</p>
            </div>
            <div>
              <Link href={`/users/segments/${segment.id}`}>
                <Button variant='outline'>
                  View
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}