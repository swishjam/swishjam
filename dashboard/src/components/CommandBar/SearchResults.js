import { UserGroupIcon, UserIcon, ChartPieIcon, GlobeAmericasIcon } from "@heroicons/react/24/outline"
import { Combobox } from "@headlessui/react"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import SearchResultSection from "./SearchResultSection"

const boldedSearchResult = (text, searchTerm) => {
  try {
    const searchTermIndexStart = text.toLowerCase().indexOf(searchTerm);
    if (searchTermIndexStart < 0) {
      return text;
    }
    const searchTermIndexEnd = searchTerm.length + searchTermIndexStart;
    const preceedingText = text.slice(0, searchTermIndexStart);
    const matchingText = text.slice(searchTermIndexStart, searchTermIndexEnd);
    const succeedingText = text.slice(searchTermIndexEnd, text.length);
    return (
      <>
        <span>{preceedingText}</span>
        <span className='font-bold'>{matchingText}</span>
        <span>{succeedingText}</span>
      </>
    )
  } catch (err) {
    return text;
  }
}

export default function SearchResults({ organizations, users, dashboards, events, searchedTerm }) {
  const hasAttemptedSearch = searchedTerm && searchedTerm !== ''
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
                  <span className="block">{boldedSearchResult(dashboard.name, searchedTerm)}</span>
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
            linkGenerator={event => `/events/${event.name}`}
            resultDisplayGenerator={event => {
              return (
                <div className="flex items-center">
                  <div className="ml-4">
                    <span className="block">{boldedSearchResult(event.name, searchedTerm)}</span>
                  </div>
                </div>
              )
            }}
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
                    <AvatarImage src={user.gravatar_url} />
                    <AvatarFallback>{user.full_name ? user.full_name.split(' ').map(w => w[0].toUpperCase()).join('') : '?'}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-4">
                  <span className="block">{boldedSearchResult(user.full_name, searchedTerm)}</span>
                  <span className='font-light text-xs'>{boldedSearchResult(user.email, searchedTerm)}</span>
                </div>
              </div>
            )}
            linkGenerator={user => `/users/${user.swishjam_user_id}`}
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
                  <span className="block">{boldedSearchResult(org.name, searchedTerm)}</span>
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