import { Combobox } from "@headlessui/react"
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline"

export default function SearchResultSection({
  title,
  TitleIcon,
  results,
  resultDisplayAttr = 'name',
  linkGenerator = result => result.href,
  resultDisplayGenerator
}) {
  return (
    <>
      <h2 className="bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-900">
        {TitleIcon && <TitleIcon className='h-4 w-4 mr-1 inline' />}
        {title}
        {results.length > 0 && results.length >= 10 ? ' (10+)' : ` (${results.length})`}
      </h2>
      {results.length > 0 && (
        <ul className="text-sm text-gray-800">
          {results.map(result => (
            <Combobox.Option
              key={result.name}
              value={{ ...result, href: linkGenerator(result) }}
              className={({ active }) => `cursor-default select-none ${active && 'bg-swishjam text-gray-50'}`}
            >
              {({ active }) => (
                <a href={linkGenerator(result)} className='block w-full h-full px-4 py-2 flex items-center justify-between'>
                  <div>
                    {resultDisplayGenerator
                      ? resultDisplayGenerator(result)
                      : (
                        <>
                          {result.icon && <result.icon className='w-4 h-4 inline mr-4' />}
                          {result[resultDisplayAttr]}
                        </>
                      )
                    }
                  </div>
                  {active && <ArrowUturnLeftIcon className='w-4 h-4 text-gray-50' />}
                </a>
              )}
            </Combobox.Option>
          ))}
        </ul>
      )}
    </>
  )
}