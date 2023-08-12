import { Fragment } from "react"
import { Menu, Transition } from "@headlessui/react";
import { UserCircleIcon, ChevronDownIcon, UserGroupIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { logUserOut } from "../AuthProvider";
import { useRouter } from "next/navigation";

export default function UserFlyout({ userEmail, currentOrganization, organizations }) {
  const router = useRouter();

  const logout = async () => {
    await logUserOut();
    router.push('/login');
  }

  return (
    <>
      <Menu as="div" className="relative inline-block text-left w-full">
        <div>
          <Menu.Button className="px-8 inline-flex justify-between items-center w-full rounded-md bg-white py-2 text-sm text-gray-900 hover:bg-gray-50">
            <div className='flex items-center truncate'>
              <UserCircleIcon className='text-gray-400 group-hover:text-swishjam duration-300 transition h-6 w-6 shrink-0 inline-block mr-2' />
              <span className='truncate'>{userEmail}</span>
            </div>
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 bottom-0 w-full z-10 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Button className="w-full px-4 py-3 flex w-full justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div className='flex items-center truncate'>
                <UserCircleIcon className='text-gray-900 duration-300 transition h-6 w-6 shrink-0 inline-block mr-2' />
                <p className="truncate text-sm font-medium text-gray-900">{userEmail}</p>
              </div>
              <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>
            <a
              className='flex items-center w-full text-start px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-swishjam transition'
              href='/team'
            >
              <UserGroupIcon className='h-6 w-6 inline-block mr-2' /> Manage team
            </a>
            {organizations && organizations.length > 1 && (
              <>
                <div className='text-gray-700 px-4 py-2 text-sm text-gray-900 font-medium'>
                  Change organizations
                </div>
                {organizations.map(org => (
                  <Menu.Button
                    className={`block w-full text-start px-4 py-2 text-sm ${org.id === currentOrganization.id ? 'bg-gray-100 text-swishjam cursor-default' : 'cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-swishjam transition'}`}
                    onClick={() => updateCurrentOrganization(org)}
                    key={org.id}
                  >
                    <div className='rounded-full bg-gray-300 text-gray-900 text-xs w-8 h-8 p-1 inline-flex items-center justify-center mr-2'>
                      {org.name.split(' ').map(word => word[0]).join('')}
                    </div>
                    <span>{org.name}</span>
                  </Menu.Button>
                ))}
              </>
            )}
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="submit"
                    onClick={logout}
                    className={`${active ? 'bg-red-100 text-red-500' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                  >
                    <ArrowLeftOnRectangleIcon className='h-6 w-6 inline-block mr-2' />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  )
}