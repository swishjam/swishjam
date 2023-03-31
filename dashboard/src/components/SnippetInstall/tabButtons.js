import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { BoltIcon, CodeBracketIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function TabButtons({currentTab, setTab }) {
  let [methods] = useState(['npm', 'cdn']);

  return (
    <div className="flex ">
      <Tab.Group
        onChange={(index) => {
           setTab(methods[index]);
        }} 
      >
        <Tab.List className="flex space-x-1 rounded-lg bg-slate-100 p-0.5">
          {methods.map((method) => (
            <Tab
              key={method}
              className={({ selected }) =>
                classNames(
                  'flex items-center rounded-md py-[0.4375rem] pl-2 pr-2 text-sm font-semibold lg:pr-3 focus:outline-none focus:ring-0',
                  //'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                  //'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'text-slate-900 bg-white shadow' 
                    : 'text-slate-600 hover:bg-white/[0.12] '
                )
              }
            >
              {method === 'npm' ?
                <CodeBracketIcon className={`h-4 w-4 flex-none ${currentTab ==='npm' ? 'text-swishjam' : 'text-slate-600'}`} /> :
                <BoltIcon className={`h-4 w-4 flex-none ${currentTab === 'cdn' ? 'text-swishjam' : 'text-slate-600'}`} />
              }
              <span class="sr-only lg:not-sr-only lg:ml-2 ">via {method.toUpperCase()}</span>
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  )
}
            /*<CodeBracketIcon className='h-4 w-4 flex-none stroke-swishjam' />
            <span class="sr-only lg:not-sr-only lg:ml-2 text-slate-900">via NPM</span>
            
            <BoltIcon className='h-4 w-4 flex-none stroke-slate-600' />
            <span class="sr-only lg:not-sr-only lg:ml-2 text-slate-600">via CDN</span>*/