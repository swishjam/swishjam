import { UserGroupIcon, UserIcon, ChartPieIcon, GlobeAmericasIcon } from "@heroicons/react/24/outline"
import { Combobox } from "@headlessui/react"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import SearchResultSection from "./SearchResultSection"

export default function SearchResults({ organizations, users, dashboards, events, hasAttemptedSearch }) {
  if (!hasAttemptedSearch) {
    return (
      <div className="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14">
        <GlobeAmericasIcon className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
        <p className="mt-2 font-semibold text-gray-400">
          Quickly access events, users, organizations, and dashboards.
        </p>
      </div>
    )
  } else if (hasAttemptedSearch && organizations?.length === 0 && users?.length === 0 && dashboards?.length === 0 && events?.length === 0) {
    return (
      <div className="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14">
        <p className="mt-4 font-semibold text-gray-900">No results found</p>
        <p className="mt-2 text-gray-500">No events, users, organizations, or dashboards match this search.</p>
      </div>
    )
  } else if (hasAttemptedSearch && (organizations?.length > 0 || users?.length > 0 || dashboards?.length > 0 || events?.length > 0)) {
    return (
      <Combobox.Options static className="max-h-80 scroll-pb-2 scroll-pt-11 space-y-2 overflow-y-auto pb-2">
        <li>
          <SearchResultSection
            title='Dashboards'
            TitleIcon={ChartPieIcon}
            results={dashboards}
            resultDisplayGenerator={dashboard => (
              <div className="flex items-center">
                <div className="flex-shrink-0 text-gray-700">
                  <Avatar>
                    <AvatarFallback>
                      <dashboard.icon className='h-5 w-5' />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-4">
                  <span className="block">{dashboard.name}</span>
                </div>
              </div>
            )}
          />
        </li>
        <li className='border-t border-gray-200' style={{ marginTop: 0 }}>
          <SearchResultSection
            title='Events'
            TitleIcon={UserIcon}
            results={events}
            resultDisplayGenerator={event => (
              <div className="flex items-center">
                <div className="ml-4">
                  <span className="block">{event.name}</span>
                </div>
              </div>
            )}
            linkGenerator={event => `/events/${event.name}`}
          />
        </li>
        <li className='border-t border-gray-200' style={{ marginTop: 0 }}>
          <SearchResultSection
            title='Users'
            TitleIcon={UserIcon}
            results={users}
            resultDisplayGenerator={user => (
              <div className="flex items-center">
                <div className="flex-shrink-0 text-gray-700">
                  <Avatar>
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-4">
                  <span className="block">{user.full_name}</span>
                  <span className='font-light text-xs'>{user.email}</span>
                </div>
              </div>
            )}
            linkGenerator={user => `/users/${user.id}`}
          />
        </li>
        <li className='border-t border-gray-200' style={{ marginTop: 0 }}>
          <SearchResultSection
            title='Organizations'
            TitleIcon={UserGroupIcon}
            results={organizations}
            resultDisplayGenerator={org => (
              <div className="flex items-center">
                <div className="flex-shrink-0 text-gray-700">
                  <Avatar>
                    <AvatarImage src={org.image} />
                    <AvatarFallback>{org.initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-4">
                  <span className="block">{org.name}</span>
                </div>
              </div>
            )}
            linkGenerator={org => `/organizations/${org.id}`}
          />
        </li>
      </Combobox.Options>
    )
  }
}