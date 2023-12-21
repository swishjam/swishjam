'use client'

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import LoadingView from './LoadingView';
import Pagination from "@/components/Pagination/Pagination";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import useCommandBar from "@/hooks/useCommandBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FilterableDropdownItem from "@/components/utils/FilterDropdown";

const UsersTableBody = ({ users }) => {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {users.map((user) => (
        <tr
          key={user.email}
          className="group hover:bg-gray-50 duration-300 transition cursor-pointer"
          onClick={() => router.push(`/users/${user.swishjam_user_id}`)}
        >
          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6 lg:pl-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Avatar className="border border-slate-200">
                  <AvatarImage src={user.gravatar_url} />
                  <AvatarFallback>{user.full_name ? user.full_name.split(' ').map(n => n[0].toUpperCase()).join('') : ''}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-4">
                {user.full_name
                  ? <span className="font-medium text-gray-900">{user.full_name}</span>
                  : <span className='text-gray-700 italic'>Name Unknown</span>}
              </div>
            </div>
          </td>
          <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{user.email}</td>
          <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
            <Link href={`/users/${user.swishjam_user_id}`} className="text-swishjam hover:text-swishjam-dark duration-300 transition">
              View<span className="sr-only">, {user.full_name}</span>
            </Link>
          </td>
        </tr>
      ))
      }
    </tbody>
  )
}

export default function Users() {
  const router = useRouter();
  const { setCommandBarIsOpen } = useCommandBar();

  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [lastPageNum, setLastPageNum] = useState();
  const [selectedFilters, setSelectedFilters] = useState({}); // { section: [value, value] }
  const [usersData, setUsersData] = useState();

  const getUsers = async ({ page, where }) => {
    setUsersData()
    setCurrentPageNum(page);
    await SwishjamAPI.Users.list({ page, where }).then(({ users, total_pages }) => {
      setUsersData(users);
      setLastPageNum(total_pages);
    });
  }

  useEffect(() => {
    getUsers({ page: currentPageNum, where: selectedFilters })
  }, [selectedFilters])

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
                          <div className='flex items-center'>
                            <FilterableDropdownItem
                              sections={[
                                {
                                  label: 'Company Size',
                                  value: 'enrichment_company_size',
                                  options: [
                                    { value: '1-10', label: '1-10' },
                                    { value: '11-50', label: '11-50' },
                                    { value: '51-200', label: '51-200' },
                                    { value: '201-500', label: '201-500' },
                                    { value: '501-1000', label: '501-1000' },
                                    { value: '1001+', label: '1001+' },
                                  ]
                                },
                                {
                                  label: 'Industry',
                                  value: 'enrichment_company_industry',
                                  options: [
                                    { value: 'tech', label: 'Tech' },
                                    { value: 'healthcare', label: 'Healthcare' },
                                    { value: 'finance', label: 'Finance' },
                                    { value: 'education', label: 'Education' },
                                    { value: 'retail', label: 'Retail' },
                                    { value: 'manufacturing', label: 'Manufacturing' },
                                    { value: 'other', label: 'Other' },
                                  ]
                                },
                                {
                                  label: 'Location',
                                  value: 'enrichment_company_location_metro',
                                  options: [
                                    { value: 'usa', label: 'USA' },
                                    { value: 'canada', label: 'Canada' },
                                    { value: 'europe', label: 'Europe' },
                                    { value: 'asia', label: 'Asia' },
                                    { value: 'australia', label: 'Australia' },
                                    { value: 'africa', label: 'Africa' },
                                    { value: 'south-america', label: 'South America' },
                                    { value: 'other', label: 'Other' },
                                  ]
                                },
                                {
                                  label: 'Subscription Plan',
                                  value: 'current_subscription_plan_name',
                                  options: [
                                    { value: 'free', label: 'Free' },
                                    { value: 'pro', label: 'Pro' },
                                    { value: 'enterprise', label: 'Enterprise' },
                                  ]
                                },
                                {
                                  label: 'Initial Referrer',
                                  value: 'initial_referrer_url',
                                  options: [
                                    { value: 'google', label: 'Google' },
                                    { value: 'facebook', label: 'Facebook' },
                                    { value: 'linkedin', label: 'LinkedIn' },
                                    { value: 'twitter', label: 'Twitter' },
                                    { value: 'direct', label: 'Direct' },
                                    { value: 'other', label: 'Other' },
                                  ]
                                },
                                {
                                  label: 'Initial Landing Page URL',
                                  value: 'initial_landing_page_url',
                                  options: [
                                    { value: 'https://swishjam.com', label: 'swishjam.com' },
                                    { value: 'https://swishjam.com/pricing', label: 'swishjam.com/pricing' },
                                    { value: 'https://swishjam.com/about', label: 'swishjam.com/about' },
                                    { value: 'https://swishjam.com/blog', label: 'swishjam.com/blog' },
                                    { value: 'https://swishjam.com/docs', label: 'swishjam.com/docs' },
                                    { value: 'https://swishjam.com/changelog', label: 'swishjam.com/changelog' },
                                    { value: 'https://wuckert.example/tova_breitenberg', label: 'wuckert.example/tova_breitenberg' },
                                  ]
                                }
                              ]}
                              selectedOptions={selectedFilters}
                              onChange={({ checked, section: { value: sectionValue }, option: { value: selectedOptionValue } }) => {
                                if (checked) {
                                  setSelectedFilters({
                                    ...selectedFilters,
                                    [sectionValue]: [...(selectedFilters[sectionValue] || []), selectedOptionValue]
                                  });
                                } else {
                                  setSelectedFilters({
                                    ...selectedFilters,
                                    [sectionValue]: selectedFilters[sectionValue].filter(v => v !== selectedOptionValue)
                                  })
                                }
                              }}
                            />
                            <button
                              className='border-none bg-white flex-shrink-0 cursor-pointer rounded-md p-2 hover:bg-gray-100'
                              onClick={() => setCommandBarIsOpen(true)}
                            >
                              <MagnifyingGlassIcon className='h-4 w-4' />
                            </button>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <UsersTableBody users={usersData} />
                  </table>
                  {usersData.length === 0
                    ? (
                      <div className='text-sm text-gray-500 text-center'>
                        No users identified yet Once you begin to identify users in your app, they will show up here.
                      </div>
                    ) : (
                      <div className='px-4'>
                        <Pagination
                          currentPage={currentPageNum}
                          lastPageNum={lastPageNum}
                          onNewPageSelected={page => getUsers({ page })}
                        />
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