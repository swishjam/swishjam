'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { FilterIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { LuSettings, LuTrash, LuPencil, LuReceipt } from "react-icons/lu";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { Tooltipable } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import EmptyState from "@/components/utils/PageEmptyState";

export default function CohortsList({ type }) {
  const { displayConfirmation } = useConfirmationModal();
  const [cohorts, setCohorts] = useState()

  useEffect(() => {
    SwishjamAPI.Cohorts.list({ type }).then(setCohorts)
  }, [])

  console.log(cohorts)
  return (
    <div className='flex space-y-2 flex-col'>
      {cohorts === undefined
        ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='bg-white relative px-8 py-4 border border-zinc-200 shadow-sm rounded-sm'>
              <div className="flex items-center space-x-2">
                <div className="min-w-0 flex-auto">
                  <Skeleton className='w-24 h-10' />
                </div>
                <Skeleton className='w-8 h-6' />
                <Skeleton className='w-8 h-6' />
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="min-w-0 flex-auto">
                  <Skeleton className='w-44 h-6' />
                </div>
                <Skeleton className='w-8 h-6' />
              </div>
            </div>
          ))
        ) : (
          cohorts.length === 0
            ? <EmptyState title={`You haven't defined any ${type === 'Cohorts::UserCohort' ? 'user' : 'organization'} cohorts yet.`} />
            : (
              cohorts.map(cohort => (
                <div key={cohort.id} className='bg-white relative px-8 py-4 border border-zinc-200 shadow-sm rounded-sm'>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm font-semibold leading-6 text-gray-600 min-w-0 flex-auto">{cohort.name}</h2>
                    {cohort.last_synced_profile_tags_at && (
                      <Tooltipable content={<span className='text-xs'>Cohort has {cohort.rough_user_count} users (as of {prettyDateTime(cohort.last_synced_profile_tags_at)}).</span>}>
                        <span className="text-xs inline-flex items-center gap-x-1.5 rounded-sm bg-green-100 px-1.5 py-0.5 font-medium text-green-700 cursor-default">
                          {cohort.rough_user_count} <UserIcon className='h-3 w-3 inline-block' />
                        </span>
                      </Tooltipable>
                    )}
                    {cohort?.query_filter_groups?.length > 0 && (
                      <Tooltipable content={<span className='text-xs'>Cohort has {cohort.query_filter_groups.reduce((acc, group) => acc + group.query_filters.length, 0)} filters defined across {cohort.query_filter_groups.length} filter groups.</span>}>
                        <span className="text-xs inline-flex items-center gap-x-1.5 rounded-sm bg-accent px-1.5 py-0.5 font-medium text-gray-600 cursor-default">
                          {cohort.query_filter_groups.reduce((acc, group) => acc + group.query_filters.length, 0)} <FilterIcon className='h-3 w-3 inline-block' />
                        </span>
                      </Tooltipable>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="min-w-0 flex-auto">
                      <p className='text-xs text-gray-500'>{cohort.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div>
                          <LuSettings className="text-gray-400 h-5 w-5 hover:text-swishjam cursor-pointer duration-300 transition-all" aria-hidden="true" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-fit border-zinc-200 shadow-sm border-sm" align='end'>
                        <Link href={`/users/cohorts/${cohort.id}`}>
                          <DropdownMenuItem className='cursor-pointer hover:bg-accent'>
                            <LuReceipt className='h-4 w-4 inline-block mr-2' />
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/users/cohorts/${cohort.id}/edit`}>
                          <DropdownMenuItem className='cursor-pointer hover:bg-accent'>
                            <LuPencil className='h-4 w-4 inline-block mr-2' />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="!text-red-400 cursor-pointer hover:bg-accent"
                            onClick={() => {
                              displayConfirmation({
                                title: <>Delete the '{cohort.name}' cohort?</>,
                                body: <>This action cannot be undone. Are you sure you want to delete this cohort?</>,
                                callback: () => {
                                  SwishjamAPI.Cohorts.delete(cohort.id).then(({ error }) => {
                                    if (error) {
                                      toast.error('Failed to delete user cohort', {
                                        description: error,
                                        duration: 10_000,
                                      })
                                    } else {
                                      setCohorts(cohorts.filter(s => s.id !== cohort.id))
                                      toast.success(`Successfully deleted the '${cohort.name}' cohort.`)
                                    }
                                  })
                                },
                              })
                            }}
                          >
                            <LuTrash className='h-4 w-4 inline-block mr-2' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )
        )}
    </div>
  )
}