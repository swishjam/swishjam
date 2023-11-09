'use client'

import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function Dashboards() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState();

  useEffect(() => {
    SwishjamAPI.Dashboards.list().then(setDashboards)
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboards</h1>
        </div>

        <div className="w-full flex items-center justify-end">
          <Link
            href='dashboards/new'
            className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
          >
            <PlusCircleIcon className='inline mr-1 h-4 w-4' />
            New Dashboard
          </Link>
        </div>
      </div>
      {dashboards
        ? (
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Dashboard
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Created By
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Created At
                </th>
                <th scope="col" className="flex justify-end px-3 py-3.5 sm:pr-6 lg:pr-8">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {dashboards.map(({ id, name, created_at, created_by_user }) => (
                <tr
                  key={id}
                  className="group hover:bg-gray-50 duration-300 transition cursor-pointer"
                  onClick={() => router.push(`/dashboards/${id}`)}
                >
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">
                    <div className="font-semibold text-gray-900">{name}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">
                    <div className="text-gray-900">{created_by_user.full_name || created_by_user.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">
                    <div className="text-gray-900">
                      {new Date(created_at).toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm">
                    <div className="font-semibold text-swishjam hover:text-swishjam-dark cursor-pointer">View</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Dashboard
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm text-gray-900">
                  Created By
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm text-gray-900">
                  Created At
                </th>
                <th scope="col" className="flex justify-end py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr
                  key={i}
                  className="group hover:bg-gray-50 duration-300 transition cursor-pointer"
                >
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <div className="font-medium text-gray-900"><Skeleton className='h-8 w-20' /></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <div className="text-gray-900"><Skeleton className='h-8 w-10' /></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <div className="text-gray-900"><Skeleton className='h-8 w-14' /></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <div className="font-medium text-gray-900"><Skeleton className='h-8 w-14' /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </main>
  )
}