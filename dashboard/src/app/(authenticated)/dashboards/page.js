'use client'

import Link from "next/link";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
//import { Button } from "@/components/ui/button"

//import { BsArrowRightShort } from 'react-icons/bs'
import { LuClipboardPaste, LuPlus } from "react-icons/lu";


const ImageCard = ({ title, description, img }) => {

  return (
    <Card className={`group hover:ring-2 offset-2 ring-swishjam duration-500 transition cursor-pointer overflow-hidden`}>
      <CardContent className={`!p-0`}>
        <div className="border-b overflow-hidden w-full bg-accent h-36">
          <div className="mx-auto mt-8 mx-8 rounded-md overflow-hidden border border-gray-200 min-h-20">
            <img
              className=""
              src={img}
            />
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-sm font-medium cursor-pointer">{title}</h3>
          <p className="text-sm mt-2 cursor-pointer truncate">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
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
      <div className='grid grid-cols-3 gap-2 mt-8'>
        <Link href="/dashboards/web-analytics">
          <ImageCard
            title='Web Analytics'
            description='Site traffic, sessions, referrers, and much more'
            img='/visitor-trends.png'
          />
        </Link>
        <Link href="/dashboards/product-analytics">
          <ImageCard
            title='Product Analytics'
            description='Active users, retention, feature breakdowns, and more'
            img='/product-analytics.png'
          />
        </Link>
        <Link href="/dashboards/revenue-analytics">
          <ImageCard
            title='Revenue Analytics'
            description='MRR, ARR, Churn, new subscriptions, and more'
            img='/revenue-analytics.png'
          />
        </Link>
      </div>

      <div className='grid grid-cols-2 mt-8 items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Custom Dashboards</h1>
        </div>
        <div className="w-full flex items-center justify-end">
          <Link
            href='dashboards/new'
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
          >
            <LuPlus className='inline mr-2 h-4 w-4' />
            New Dashboard
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
            <div className="border border-zinc-200 rounded-md overflow-hidden mt-4">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Dashboard
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Creator
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created
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
                        <div className="font-semibold text-swishjam hover:text-swishjam-dark cursor-pointer">
                          <LuClipboardPaste size={16} className="float-right" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table >
            </div>
          )
        : (
          <div className="border border-zinc-200 rounded-md overflow-hidden mt-4">
            <table className="min-w-full divide-y divide-gray-300 border border-indigo-500 rounded-md overflow-hidden">
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
          </div>
        )
      }
    </main >
  )
}