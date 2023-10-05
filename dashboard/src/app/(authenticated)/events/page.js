'use client'

import { useEffect, useState } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link";
import LoadingView from './LoadingView';
import { useRouter } from "next/navigation";
// import Pagination from "@/components/Pagination/Pagination";
// import useCommandBar from "@/hooks/useCommandBar";

export default function Events() {
  const router = useRouter();
  // const { setCommandBarIsOpen } = useCommandBar();
  const [events, setEvents] = useState();
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [lastPageNum, setLastPageNum] = useState();
  const [totalNumRecords, setTotalNumRecords] = useState();

  const getEvents = async () => {
    setEvents()
    // setCurrentPageNum(page);
    await SwishjamAPI.Events.unique().then(setEvents);
  }

  useEffect(() => {
    getEvents()
  }, [])

  return (
    events ? (
      <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
        <div className='grid grid-cols-2 mt-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium text-gray-700 mb-0">Users</h1>
          </div>

          <div className="w-full flex items-center justify-end">
          </div>
        </div>

        <Card className="mt-8">
          <CardContent className="px-4 sm:px-6 lg:px-8">
            <div className="mt-2 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8">
                          Event
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Count
                        </th>
                        <th scope="col" className="flex justify-end py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {events.map(({ name, count }) => (
                        <tr
                          key={name}
                          className="group hover:bg-gray-50 duration-300 transition cursor-pointer"
                          // onClick={() => router.push('/events/name)}
                        >
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6 lg:pl-8">
                              <div className="font-medium text-gray-900">{name}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{count}</td>
                          <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                            <Link href={`/events/${name}`} className="text-swishjam hover:text-swishjam-dark duration-300 transition">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {events.length === 0 
                    ?  (
                      <div className='text-sm text-gray-500 text-center'>
                        No events triggered yet.
                      </div>
                    ) : (
                      <div className='px-4'>
                        {/* <Pagination
                          currentPage={currentPageNum}
                          lastPageNum={lastPageNum}
                          numRecordsDisplayed={usersData?.length}
                          totalNumRecords={totalNumRecords}
                          onNewPageSelected={page => getUsers({ page })}
                        /> */}
                      </div>
                    )
                  }
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </main>
    ) : <LoadingView />
  )
}