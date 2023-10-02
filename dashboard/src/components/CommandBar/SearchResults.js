import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { GlobeAmericasIcon, UserGroupIcon, UserIcon, ChartPieIcon } from "@heroicons/react/20/solid"
import { Combobox } from "@headlessui/react"

export default function SearchResults({ organizations, users, dashboards, hasAttemptedSearch }) {
  if (!hasAttemptedSearch) {
    return (
      <div className="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14">
        <GlobeAmericasIcon className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
        <p className="mt-4 font-semibold text-gray-900">
          Quickly access users, organizations, and dashboards.
        </p>
      </div>
    )
  } else if (hasAttemptedSearch && organizations?.length === 0 && users?.length === 0 && dashboards?.length === 0) {
    return (
      <div className="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14">
        <p className="mt-4 font-semibold text-gray-900">No results found</p>
        <p className="mt-2 text-gray-500">No users, organizations, or dashboards match this search.</p>
      </div>
    )
  } else if (hasAttemptedSearch && (organizations?.length > 0 || users?.length > 0 || dashboards?.length > 0)) {
    return (
      <Combobox.Options static className="max-h-80 scroll-pb-2 scroll-pt-11 space-y-2 overflow-y-auto pb-2">
        <li>
          <h2 className="bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-900">
            <ChartPieIcon className='h-4 w-4 mr-1 inline' />
            Dashboards
            {dashboards.length > 0 && dashboards.length >= 10 ? ' (10+)' : ` (${dashboards.length})`}
          </h2>
          {dashboards.length > 0 && (
            <ul className="text-sm text-gray-800">
              {dashboards.map(dashboard => (
                <Combobox.Option
                  key={dashboard.name}
                  value={dashboard}
                  className={({ active }) => `cursor-default select-none ${active && 'bg-swishjam text-gray-50'}`}
                >
                  <a href={dashboard.href} className='block w-full h-full px-4 py-2 flex items-center'>
                    {dashboard.icon && <dashboard.icon className='w-4 h-4 inline mr-1' />}
                    {dashboard.name}
                  </a>
                </Combobox.Option>
              ))}
            </ul>
          )}
        </li>
        <li className='border-t border-gray-200' style={{ marginTop: 0 }}>
          <h2 className="bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-900">
            <UserGroupIcon className='h-4 w-4 mr-1 inline' />
            Organizations
            {organizations.length > 0 && organizations.length >= 10 ? ' (10+)' : ` (${organizations.length})`}
          </h2>
          {organizations.length > 0 && (
            <ul className="text-sm text-gray-800">
              {organizations.map(org => (
                <Combobox.Option
                  key={org.id}
                  value={{ ...org, href: `/organizations/${org.id}` }}
                  className={({ active }) => `cursor-default select-none ${active && 'bg-swishjam text-gray-50'}`}
                >
                  <a href={`/organizations/${org.id}`} className='block w-full h-full px-4 py-2'>
                    {org.name}
                  </a>
                </Combobox.Option>
              ))}
            </ul>
          )}
        </li>
        <li className='border-t border-gray-200' style={{ marginTop: 0 }}>
          <h2 className="bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-900">
            <UserIcon className='h-4 w-4 mr-1 inline' />
            Users
            {users.length > 0 && users.length >= 10 ? ' (10+)' : ` (${users.length})`}
          </h2>
          {users.length > 0 && (
            <ul className="text-sm text-gray-800">
              {users.map(user => (
                <Combobox.Option
                  key={user.id}
                  value={{ ...user, href: `/users/${user.id}` }}
                  className={({ active }) => `cursor-default select-none ${active && 'bg-swishjam text-gray-50'}`}
                >
                  <a href={`/users/${user.id}`} className='block w-full h-full px-4 py-2'>
                    {user.email}
                  </a>
                </Combobox.Option>
              ))}
            </ul>
          )}
        </li>
      </Combobox.Options>
    )
  }
}