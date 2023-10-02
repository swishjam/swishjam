'use client'

import { useEffect, useState, useRef } from "react";
import { API } from "@/lib/api-client/base";
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingView from './LoadingView';

export default function Users() {
  const router = useRouter();
  const [usersData, setUsersData] = useState();
  const [displaySearchInput, setDisplaySearchInput] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef();

  const getUsers = async searchTerm => {
    setUsersData()
    if (!searchTerm || searchTerm === '') {
      await API.get('/api/v1/users').then(setUsersData);
    } else {
      await API.get('/api/v1/users', { q: searchTerm }).then(setUsersData);
    }
  }


  const navigateToUsersProfile = id => {
    router.push(`/users/${id}`);
  };

  useEffect(() => {
    getUsers()
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
                        <th scope="col" className="flex justify-end py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                          <div className={`input flex font-normal text-sm ${displaySearchInput ? '' : 'hidden'}`}>
                            <form 
                              className="flex-grow" 
                              onSubmit={e => {
                                e.preventDefault();
                                getUsers(searchValue)
                              }}
                            >
                              <input
                                className='outline-none flex-grow h-full focus:outline-none'
                                value={searchValue}
                                onChange={e => setSearchValue(e.target.value)}
                                ref={searchInputRef}
                                onBlur={() => {
                                  if (!searchValue || searchValue.length === 0) {
                                    setDisplaySearchInput(false);
                                  }
                                }}
                              />
                            </form>
                            <button
                              className='border-none bg-white flex-shrink-0 cursor-pointer rounded-full p-2 hover:bg-gray-100'
                              type='submit'
                              onClick={() => getUsers(searchValue)}
                            >
                              <MagnifyingGlassIcon className='h-4 w-4' />
                            </button>
                            {searchValue && searchValue.length > 0 && (
                              <div
                                className='flex-shrink-0 cursor-pointer rounded-full p-2 hover:bg-red-100'
                                onClick={() => {
                                  setSearchValue('');
                                  getUsers();
                                }}
                              >
                                <XCircleIcon className='h-4 w-4' />
                              </div>
                            )}
                          </div>
                          {!displaySearchInput && (
                            <div 
                              className='cursor-pointer rounded-full p-2 hover:bg-gray-100'
                              onClick={() => {
                                setDisplaySearchInput(true)
                                setTimeout(() => {
                                  searchInputRef.current.focus()
                                }, 100)
                              }}
                            >
                              <MagnifyingGlassIcon className='h-4 w-4' />
                            </div>
                          )}
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