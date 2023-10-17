export default function Breadcrumbs({ paths }) {
  return (
  <div>
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        {paths?.map((path, i) => 
          <li key={i}>
            <div className="flex items-center">
              {i > 0 ?
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>:null}
              <a href={path.url || '#'} className={`${i > 0 ? 'ml-4':''} text-sm font-medium text-gray-500 hover:text-swishjam duration-300 transition hover:underline cursor-pointer`}>{path.title}</a>
            </div>
          </li>
        )} 
      </ol>
    </nav>
  </div>
  )
}