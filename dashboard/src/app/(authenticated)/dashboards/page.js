'use client'

import Link from "next/link";
import { ChartPieIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BsArrowRightShort } from 'react-icons/bs'

export function ButtonLink() {
  return
}
export default function Dashboards() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState();

  useEffect(() => {
    SwishjamAPI.Dashboards.list().then(setDashboards)
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div>
        <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboards</h1>
      </div>
      <div className='grid grid-cols-3 gap-4 mt-8'>
        <Link href="/dashboards/marketing-analytics">
          <Card className={`group hover:ring-2 offset-2 ring-swishjam duration-300 transition cursor-pointer`}>
            <CardContent>
              <div className="mt-6 border rounded-sm overflow-hidden">
                <Image src='/visitor-trends.png' width={400} height={100} />
              </div>
              <h3 className="text-sm font-medium mt-2 border-t-2 border-white cursor-pointer">Marketing Analytics</h3>
              <p className="text-sm mt-2 cursor-pointer">Site traffic, sessions, referrers, top pages, and more</p>
              <div className="flex justify-end">
                <Button variant="link" className="group-hover:text-swishjam transition duration-500">View <BsArrowRightShort size={16} /></Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboards/product-analytics">
          <Card className={`group hover:ring-2 offset-2 ring-swishjam duration-300 transition cursor-pointer`}>
            <CardContent>
              <div className="mt-6 border rounded-sm overflow-hidden">
                <Image src='/product-analytics.png' width={400} height={100} />
              </div>
              <h3 className="text-sm font-medium mt-2 border-t-2 border-white cursor-pointer">Product Analytics</h3>
              <p className="text-sm mt-2 cursor-pointer">Active users, retention, feature breakdowns, and more</p>
              <div className="flex justify-end">
                <Button variant="link" className="group-hover:text-swishjam transition duration-500">View <BsArrowRightShort size={16} /></Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card className={'opacity-50'}>
          <CardContent>
            <div className="mt-6 border rounded-sm overflow-hidden">
              <Image src='/visitor-trends.png' width={400} height={100} />
            </div>
            <h3 className="text-sm font-medium cursor-default mt-2 border-t-2 border-white">SaaS Metrics</h3>
            <p className="text-sm cursor-default mt-2">MRR, ARR, Churn, new subscriptions, and more</p>
            <div className="flex justify-end">
              <Button variant="cursor-default" className="">View <BsArrowRightShort size={16} /></Button>
            </div>

          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Custom Dashboards</h1>
        </div>
        <div className="w-full flex items-center justify-end">
          <Link
            href='dashboards/new'
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
          >
            New Dashboard
            <PlusCircleIcon className='inline ml-1 h-4 w-4' />
          </Link>
        </div>
      </div>

      {dashboards
        ? dashboards.length === 0
          ? (
            <Link
              className="mt-8 relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
              href='/dashboards/new'
            >
              <ChartPieIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-semibold text-gray-400">You have no dashboards, create your first one here.</span>
            </Link>
          ) : (
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
                </tr >
              </thead >
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
            </table >
          )
        : (
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
    </main >
  )
}