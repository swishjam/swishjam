'use client'

import QueryBuilder from "@/components/QueryBuilder/QueryBuilder";

export default function NewUserSegmentPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">New User Segment</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <QueryBuilder />
    </main>
  )
}