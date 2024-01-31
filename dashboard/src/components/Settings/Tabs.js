import { LuSettings, LuUser } from 'react-icons/lu'
const isCurrentPage = (menuItemHref, currentPath) => {return currentPath == menuItemHref};
const tabs = [
  { name: 'Settings', href: '/settings', icon: LuSettings },
  { name: 'Team', href: '/settings/team', icon: LuUser },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Tabs({ currentPath, className }) {

  return (
    <div className={className}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        {/*<select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-swishjam focus:ring-indigo-500"
          defaultValue={tabs.find((tab) => tab.current).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>*/}
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={classNames(
                  isCurrentPage(tab.href, currentPath)
                    ? 'border-swishjam text-swishjam'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={isCurrentPage(tab.href, currentPath) ? 'page' : undefined}
              >
                <tab.icon
                  className={classNames(
                    isCurrentPage(tab.href, currentPath) ? 'text-swishjam' : 'text-gray-400 group-hover:text-gray-500',
                    '-ml-0.5 mr-2 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                <span>{tab.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
