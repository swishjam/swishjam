'use client'

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Pagination from "@/components/Pagination/Pagination";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import useCommandBar from "@/hooks/useCommandBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserProfilesCollection from "@/lib/collections/user-profiles";
// import FilterableDropdownItem from "@/components/utils/FilterDropdown";
import { Skeleton } from "@/components/ui/skeleton";

const UsersTableBody = ({ currentPageNum, onUsersFetched = () => { } }) => {
  const router = useRouter();
  const [userModels, setUserModels] = useState();

  const getUsers = async ({ page }) => {
    setUserModels()
    await SwishjamAPI.Users.list({ page }).then(({ users, total_pages }) => {
      const userModels = new UserProfilesCollection(users).models();
      setUserModels(userModels);
      onUsersFetched({ users: userModels, total_pages });
    });
  }

  useEffect(() => {
    getUsers({ page: currentPageNum })
  }, [currentPageNum])

  return (
    userModels === undefined ? (
      <tbody className="divide-y divide-gray-200 bg-white">
        {[...Array(10)].map((_, i) => (
          <tr key={i}>
            <td className="py-3 pl-4 pr-3 sm:pl-6 lg:pl-8">
              <Skeleton className='w-24 h-6' />
            </td>
            <td className="px-3 py-3">
              <Skeleton className='w-20 h-6' />
            </td>
            <td className="py-3 pl-3 pr-4 sm:pr-6 lg:pr-8 flex justify-end">
              <Skeleton className='w-14 h-6' />
            </td>
          </tr>
        ))}
      </tbody>
    ) : (
      userModels.length === 0 ? (
        <tbody className="divide-y divide-gray-200 bg-white">
          <tr>
            <td className='px-4 pt-8 pb-6 text-center' colSpan={3}>
              <h2 className='text-xl font-medium text-gray-700'>No users found</h2>
              <p className='text-gray-500'>
                No users found, <Link href='https://docs.swishjam.com' target='_blank'>integrate the Swishjam SDK</Link> into your web app to start tracking users.
              </p>
            </td>
          </tr>
        </tbody>
      ) : (
        <tbody className="divide-y divide-gray-200 bg-white">
          {userModels.map((user, idx) => (
            <tr
              key={idx}
              className="group hover:bg-gray-50 duration-300 transition cursor-pointer"
              onClick={() => router.push(`/users/${user.id()}`)}
            >
              <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6 lg:pl-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Avatar className="border border-slate-200">
                      <AvatarImage src={user.gravatarUrl()} />
                      <AvatarFallback>{user.initials()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-4">
                    {user.fullName()
                      ? <span className="font-medium text-gray-900">{user.fullName()}</span>
                      : <span className='text-gray-700 italic'>{!user.uniqueIdentifier() && !user.email() ? `Anonymous User ${user.id().slice(0, 4)}` : 'Name Unknown'}</span>}
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{user.email()}</td>
              <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                <Link href={`/users/${user.id()}`} className="text-swishjam hover:text-swishjam-dark duration-300 transition">
                  View<span className="sr-only">, {user.fullName() || user.email()}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      )
    )
  )
}

export default function Users() {
  const { setCommandBarIsOpen } = useCommandBar();

  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [hasNoUsers, setHasNoUsers] = useState(false);
  // const [hasProfileEnrichmentEnabled, setHasProfileEnrichmentEnabled] = useState();
  const [lastPageNum, setLastPageNum] = useState();
  const [selectedFilters, setSelectedFilters] = useState({}); // { section: [value, value] }
  // const [filterOptions, setFilterOptions] = useState();

  // useEffect(() => {
  //   SwishjamAPI.Config.retrieve().then(({ settings }) => setHasProfileEnrichmentEnabled(settings.should_enrich_user_profile_data))
  //   SwishjamAPI.Users.uniqueAttributeValues({ attributes: FILTERABLE_USER_ATTRIBUTES }).then(filterableAttributeValues => {
  //     const options = [];
  //     const metadataOptions = {};
  //     filterableAttributeValues.forEach(({ column, values }) => {
  //       if (column === 'metadata') {
  //         values.forEach(({ metadata_key, metadata_value, num_users }) => {
  //           metadataOptions[metadata_key] = metadataOptions[metadata_key] || [];
  //           metadataOptions[metadata_key].push({ value: metadata_value, label: metadata_value, numUsers: num_users });
  //         })
  //       } else {
  //         options.push({
  //           label: column.replace('enrichment_', '').split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
  //           value: column,
  //           options: values.map(({ attr_value, num_users }) => ({ value: attr_value, label: attr_value, numUsers: num_users }))
  //         })
  //       }
  //     })
  //     Object.keys(metadataOptions).forEach(metadataKey => {
  //       options.push({
  //         label: metadataKey.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
  //         value: `metadata.${metadataKey}`,
  //         options: metadataOptions[metadataKey]
  //       })
  //     })
  //     setFilterOptions(options);
  //   })
  // }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 items-center'>
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
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="flex justify-end py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                        <div className='flex items-center'>
                          {/* <FilterableDropdownItem
                            hasProfileEnrichmentEnabled={hasProfileEnrichmentEnabled}
                            sections={filterOptions}
                            selectedOptions={selectedFilters}
                            onClearAllFilters={() => {
                              if (Object.keys(selectedFilters).length > 0 && Object.keys(selectedFilters).map(section => selectedFilters[section].length > 0).includes(true)) {
                                setSelectedFilters({})
                              }
                            }}
                            onChange={({ checked, section: { value: sectionValue }, option: { value: selectedOptionValue } }) => {
                              setCurrentPageNum(1)
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
                          /> */}
                          <button
                            className='border-none bg-white flex-shrink-0 cursor-pointer rounded-md p-2 hover:bg-gray-100'
                            onClick={() => setCommandBarIsOpen(true)}
                          >
                            <MagnifyingGlassIcon className='h-4 w-4 text-gray-700' />
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <UsersTableBody
                    currentPageNum={currentPageNum}
                    onUsersFetched={({ users, total_pages }) => {
                      setHasNoUsers(users.length === 0)
                      setLastPageNum(total_pages)
                    }}
                  />
                </table>
                {!hasNoUsers && (
                  <div className='px-4'>
                    <Pagination
                      currentPage={currentPageNum}
                      lastPageNum={lastPageNum}
                      onNewPageSelected={setCurrentPageNum}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </main>
  )
}