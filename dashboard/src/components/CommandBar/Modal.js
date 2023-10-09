import { Fragment, useState } from 'react'
import { UserGroupIcon, UserIcon, ChartPieIcon, HomeIcon, SquaresPlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Combobox, Dialog, Transition } from '@headlessui/react'
import { SwishjamAPI } from '@/lib/api-client/swishjam-api'
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import Footer from './Footer';

const dashboardOptions = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Visitor Trends', href: '/visitor-trends', icon: ChartPieIcon },
  { name: 'Users', href: '/users', icon: UserIcon },
  { name: 'Organizations', href: '/organizations', icon: UserGroupIcon },
  { name: 'Connections', href: '/connections', icon: SquaresPlusIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
]

export default function SearchBarModal({ onClose = () => { } }) {
  const [searchedTerm, setSearchedTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [organizationsResults, setOrganizationsResults] = useState();
  const [usersResults, setUsersResults] = useState();
  const [dashboardsResults, setDashboardsResults] = useState();
  const [eventResults, setEventResults] = useState();

  const commitSearch = async q => {
    if (!q || q === '') {
      setSearchedTerm('');
      setIsSearching(false);
      setOrganizationsResults();
      setUsersResults();
      setDashboardsResults();
      setEventResults();
    } else {
      setIsSearching(true);
      setSearchedTerm(q);
      await SwishjamAPI.Search.search(q).then(({ users, organizations, events }) => {
        setOrganizationsResults(organizations);
        setUsersResults(users);
        setEventResults(events);
        const matchingDashboards = dashboardOptions.filter(option => option.name.toLowerCase().includes(q.toLowerCase()));
        setDashboardsResults(matchingDashboards);
      });
      setIsSearching(false);
    }
  }

  return (
    <Transition.Root
      show={true}
      as={Fragment}
      afterLeave={() => {
        setSearchedTerm('');
        setIsSearching(false);
        setOrganizationsResults();
        setUsersResults();
        setDashboardsResults();
        setEventResults();
      }}
      appear
    >
      <Dialog as="div" className="relative" onClose={onClose} style={{ zIndex: 100 }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 w-screen overflow-y-auto p-4 sm:p-6 md:p-20" style={{ zIndex: 101 }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox onChange={(item) => (window.location = item.href)}>
                <SearchForm isSearching={isSearching} onSubmit={commitSearch} />
                <SearchResults
                  organizations={organizationsResults}
                  users={usersResults}
                  dashboards={dashboardsResults}
                  events={eventResults}
                  hasAttemptedSearch={searchedTerm && searchedTerm !== ''}
                />
                <Footer />
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
