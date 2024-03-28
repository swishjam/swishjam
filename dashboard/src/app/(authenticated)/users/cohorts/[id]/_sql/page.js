'use client'

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";

export default function EditUserSegmentPage({ params }) {
  const { id } = params;
  const [userSegment, setUserSegment] = useState()

  useEffect(() => {
    SwishjamAPI.UserSegments.sql(id).then(({ user_segment, sql }) => {
      setUserSegment({ ...user_segment, sql })
    })
  }, [id])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 items-center'>
        <div>
          <Link href='/users/cohorts' className="flex items-center space-x-1 mb-1 text-xs font-medium text-gray-500 hover:text-swishjam transition duration-300 hover:underline">
            <ArrowLeftIcon className='w-3 h-3' /> All Cohorts
          </Link>
          <div>
            <div>
              <h1 className="text-lg font-medium text-gray-700 mb-0 flex items-center">
                {userSegment?.name || <Skeleton className='h-8 w-16 mx-1 inline-block bg-gray-200' />}
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
        <MonacoEditor
          height='500px'
          language="sql"
          value={userSegment.sql}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            matchBrackets: 'never',
            readOnly: true,
          }}
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