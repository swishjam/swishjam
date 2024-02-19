'use client'

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LuSettings, LuSplit, LuTrash, LuPencil, LuReceipt } from "react-icons/lu";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { Tooltipable } from "@/components/ui/tooltip";
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
      {userSegments?.map(segment => (
        <div key={segment.id} className='bg-white relative px-8 py-4 border border-zinc-200 shadow-sm rounded-sm'>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto">{segment.name}</h2>
            <span className='text-xs text-gray-500'>Created on {prettyDateTime(segment.created_at, { hour: 'none', minute: 'none' })}</span>
            {segment?.query_filter_groups?.length > 0 && (
              <Tooltipable content={<span className='text-xs'>Segment has {segment.query_filter_groups.length} filter conditions defined.</span>}>
                <span className="text-xs inline-flex items-center gap-x-1.5 rounded-sm bg-accent px-1.5 py-0.5 font-medium text-gray-600 cursor-default">
                  {segment.query_filter_groups.length} <LuSplit className='h-3 w-3 inline-block' />
                </span>
              </Tooltipable>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="min-w-0 flex-auto">
              <p className='text-xs text-gray-500'>{segment.description}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <LuSettings className="text-gray-400 h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit border-zinc-200 shadow-sm border-sm" align='end'>
                <Link href={`/users/segments/${segment.id}`}>
                  <DropdownMenuItem className='cursor-pointer hover:bg-accent'>
                    <LuReceipt className='h-4 w-4 inline-block mr-2' />
                    View Details
                  </DropdownMenuItem>
                </Link>
                <Link href={`/users/segments/${segment.id}/edit`}>
                  <DropdownMenuItem className='cursor-pointer hover:bg-accent'>
                    <LuPencil className='h-4 w-4 inline-block mr-2' />
                    Edit
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="!text-red-400 cursor-pointer hover:bg-accent">
                    <LuTrash className='h-4 w-4 inline-block mr-2' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </main>
  )
}