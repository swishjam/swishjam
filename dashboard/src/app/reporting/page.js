'use client';

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/AuthenticatedView"
import { useAuth } from "@/components/AuthProvider";
import { FlagIcon } from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/20/solid";

import { ProjectReportUrlsAPI } from "@/lib/api-client/project-report-urls";
import NewReportModal from "@/components/Reporting/NewModal";
import ManageRow from "@/components/Reporting/ManageRow";

export default function Manage() {
  const { currentProject } = useAuth();
  const [ projectReportUrls, setProjectReportUrls ] = useState([]);
  const [ newReportUrlModalIsOpen, setNewReportUrlModalIsOpen ] = useState(false);

  useEffect(() => {
    setProjectReportUrls();
    ProjectReportUrlsAPI.getAll().then(setProjectReportUrls);
  }, [currentProject?.public_id]);

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Reporting Settings</h1>
          </div>
          <div className='text-right'>
            <button 
              onClick={() => setNewReportUrlModalIsOpen(true)}
              className="ml-6 mt-2 rounded-md bg-swishjam px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swishjam transition duration-300"
            >
              <PlusCircleIcon className='h-5 w-5 inline-block mr-1' />
              Add Report 
            </button>
          </div>
        </div>
        {projectReportUrls && projectReportUrls.length === 0
          ? <EmptyState onNewConfigurationClick={() => setNewReportUrlModalIsOpen(true)} /> 
          : <ProjectPageUrlsTable projectReportUrls={projectReportUrls} />
        }
      </main>
      <NewReportModal 
        isOpen={newReportUrlModalIsOpen} 
        onClose={() => setNewReportUrlModalIsOpen(false)} 
        onNewConfiguration={newConfiguration => setProjectReportUrls([...projectReportUrls, newConfiguration])}
      />
    </AuthenticatedView>
  )
}

function ProjectPageUrlsTable({ projectReportUrls }) {
  return (
    <div className='border border-gray-300 rounded-md'>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className='bg-gray-100'>
          <tr className='bg-gray-100'>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 rounded-tl-md overflow-hidden">
              URL
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Cadence 
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Data Source
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Enabled 
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Created
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 rounded-tr-md overflow-hidden">
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projectReportUrls 
            ? projectReportUrls.map(pageUrl => <ManageRow key={pageUrl.id} pageUrl={pageUrl} />)
            : (
              Array.from({ length: 6}).map((_, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                    <div className="ml-4 w-32 h-6 animate-pulse bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                    <div className="w-12 h-6 animate-pulse bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                    <div className="w-12 h-6 animate-pulse bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                    <div className="w-8 h-6 animate-pulse bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                    <div className="w-10 h-6 animate-pulse bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium">
                    <div className="w-8 h-6 animate-pulse bg-gray-200 rounded-md"></div>
                  </td>
                </tr>
              ))
            )}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ onNewConfigurationClick }) {
  return (
    <button
      type="button"
      className="group relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-swishjam focus:outline-none focus:ring-2 focus:ring-swishjam focus:ring-offset-2 transition-all duration-300"
      onClick={onNewConfigurationClick}
    >
      <FlagIcon className='group-hover:text-swishjam mx-auto h-12 w-12 text-gray-700 transition-all duration-300' />
      <span className="group-hover:text-swishjam mt-2 block text-md font-semibold text-gray-700 transition-all duration-300">You haven't configured any reports yet.</span>
      <span className="group-hover:text-swishjam mt-2 block text-sm font-semibold text-gray-700 transition-all duration-300">Create your first report.</span>
    </button>
  )
}