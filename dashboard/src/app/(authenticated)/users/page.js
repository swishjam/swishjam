'use client'

import { useEffect, useState } from "react";
import { API } from "@/lib/api-client/base";
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingView from './LoadingView';

export default function Users() {
  const router = useRouter();
  const [usersData, setUsersData] = useState();

  const navigateToUsersProfile = id => {
    router.push(`/users/${id}`);
  };

  useEffect(() => {
    API.get(`/api/v1/users`).then(setUsersData);
  }, [])

  return (
    usersData ? (
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
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                        >
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {usersData.map((user) => (
                          <tr
                            key={user.email}
                            className="group hover:bg-gray-50 duration-300 transition cursor-pointer"
                            onClick={() => navigateToUsersProfile(user.id)}
                          >
                            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6 lg:pl-8">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <Avatar>
                                    <AvatarImage src={user.image} />
                                    <AvatarFallback>{user.initials}</AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">{user.full_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{user.email}</td>
                            <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                              <Link href={`/users/${user.id}`} className="text-swishjam hover:text-swishjam-dark duration-300 transition">
                                View<span className="sr-only">, {user.full_name}</span>
                              </Link>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                  {usersData.length === 0 && (
                  <div className='text-sm text-gray-500 text-center'>
                    No users identified yet Once you begin to identify users in your app, they will show up here.
                  </div>
                  )}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </main>
    ) : <LoadingView />
  )
}