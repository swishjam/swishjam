export default function Breadcrumbs({ userName }) {
  return (
  <div>
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div className="flex items-center">
            <a href='/users' className="text-sm font-medium text-gray-500 hover:text-swishjam duration-300 transition">Users</a>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <svg
              className="h-5 w-5 flex-shrink-0 text-gray-900"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
            <a href='#' className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{userName}</a>
          </div>
        </li>
      </ol>
    </nav>
  </div>
  )
}