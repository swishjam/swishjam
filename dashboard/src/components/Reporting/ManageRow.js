import { useState, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ProjectReportUrlsAPI } from '@/lib/api-client/project-report-urls';
import UpdateReportUrlModal from './UpdateModal';
import { EllipsisVerticalIcon, CheckCircleIcon, XCircleIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { formattedDate } from "@/lib/utils";
import LoadingSpinner from '../LoadingSpinner';

const CADENCE_TO_HUMAN_READABLE = {
  '7-day': 'Every 7 days',
  '14-day': 'Every 14 days'
}
const DATASOURCE_TO_HUMAN_READABLE = {
  'rum': 'Real User Data',
  'lab-test': 'Lab Tests',
  'crux': 'CrUX — Google Data'
}

export default function ManageRow({ pageUrl }) {
  const [url, setUrl] = useState(pageUrl.full_url);
  const [dataSource, setDataSource] = useState(pageUrl.data_source);
  const [cadence, setCadence] = useState(pageUrl.cadence);
  const [isEnabled, setIsEnabled] = useState(pageUrl.enabled);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const toggleReportEnabled = async () => {
    setIsUpdating(true);
    const { error, record } = await ProjectPageUrlsAPI.update({ 
      id: pageUrl.id, 
      url: pageUrl.full_url, 
      cadence: pageUrl.cadence,
      dataSource: pageUrl.data_source, 
      enabled: !isEnabled 
    });
    setIsUpdating(false);
    if (error) {
      console.error(error);
    } else {
      setIsEnabled(record.enabled);
    }
  }

 return (
  <>
    {showUpdateModal && <UpdateReportUrlModal 
                          projectReportUrl={pageUrl} 
                          onClose={() => setShowUpdateModal(false)} 
                          onUpdate={record => {
                            setDataSource(record.data_source);
                            setCadence(record.cadence);
                            setUrl(record.full_url);
                          }} 
                          isOpen={showUpdateModal}
                        />}
   <tr key={pageUrl.id}>
     <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
       <div className="flex items-center">
         <div className="ml-4">
           <div className="font-medium text-gray-900 flex items-center">
              <span className='inline-block'>{url}</span>
              {isUpdating && <span className='inline-block ml-2'><LoadingSpinner /></span>}
            </div>
         </div>
       </div>
     </td>
     <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
       <div className="text-gray-900">{cadence ? CADENCE_TO_HUMAN_READABLE[cadence] : 'Never'}</div>
     </td>
     <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
       <div className="text-gray-900">{dataSource ? DATASOURCE_TO_HUMAN_READABLE[dataSource] : '—'}</div>
     </td>
     <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
       <span
         className={`
            ${cadence && isEnabled ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'} 
            inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset
          `}
        >
         {cadence && isEnabled ? 'Active' : 'Disabled'}
       </span>
     </td>
     <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
       <div className="text-gray-900">{formattedDate(pageUrl.created_at)}</div>
     </td>
     <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium">
       <Menu as="div" className="relative inline-block text-left">
         <div>
           <Menu.Button className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
             <span className="sr-only">Open options</span>
             <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
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
           <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
             <div className="py-1">
               <Menu.Item>
                 <button 
                    className='text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center'
                    onClick={() => setShowUpdateModal(true)}
                  >
                   <PencilSquareIcon className='w-4 h-4 inline-block mr-2' /> Edit
                 </button>
               </Menu.Item>
               {cadence && <Menu.Item>
                 <button
                   className={`
                      ${isUpdating ? 'text-gray-600 bg-gray-50' : isEnabled ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} 
                      flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-50
                    `}
                    onClick={toggleReportEnabled}
                    disabled={isUpdating}
                 >
                    <span>
                      {isEnabled
                        ? <><XCircleIcon className='w-4 h-4 inline-block mr-2' /> Disable</>
                        : <><CheckCircleIcon className='w-4 h-4 inline-block mr-2' /> Enable</>}
                    </span>
                   {isUpdating && <span className='ml-2'><LoadingSpinner size={4} /></span>}
                 </button>
               </Menu.Item>}
             </div>
           </Menu.Items>
         </Transition>
       </Menu>
     </td>
   </tr>
  </> 
 )
}