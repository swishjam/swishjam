'use client';

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/AuthenticatedView"
import { useAuth } from "@/components/AuthProvider";
import { ProjectPageUrlsAPI } from "@/lib/api-client/project-page-urls";
import NewProjectPageUrlModal from "@/components/ProjectPageUrls/NewModal";
import ManageRow from "@/components/ProjectPageUrls/ManageRow";
import { BeakerIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

export default function Manage() {
  const { currentProject } = useAuth();
  const [projectPageUrls, setProjectPageUrls] = useState();
  const [newPageUrlModalIsOpen, setNewPageUrlModalIsOpen] = useState(false);

  useEffect(() => {
    setProjectPageUrls();
    ProjectPageUrlsAPI.getAll().then(setProjectPageUrls);
  }, [currentProject?.public_id]);

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <Link href='/lab-tests' className='text-xs text-blue-700 flex items-center'>
              <ArrowLeftIcon className='h-3 w-3 inline-block mr-1' /> All lab tests
            </Link>
            <h1 className="text-lg font-medium">Manage Lab Tests</h1>
          </div>
          <div className='text-right'>
            <button 
              onClick={() => setNewPageUrlModalIsOpen(true)}
              className="ml-6 mt-2 rounded-md bg-swishjam px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swishjam transition duration-300"
            >
              New lab test configuration
            </button>
          </div>
        </div>
        {projectPageUrls && projectPageUrls.length === 0
          ? <EmptyState onNewConfigurationClick={() => setNewPageUrlModalIsOpen(true)} /> 
          : <ProjectPageUrlsTable projectPageUrls={projectPageUrls} />
        }
      </main>
      <NewProjectPageUrlModal 
        isOpen={newPageUrlModalIsOpen} 
        onClose={() => setNewPageUrlModalIsOpen(false)} 
        onNewConfiguration={newConfiguration => setProjectPageUrls([...projectPageUrls, newConfiguration])}
      />
    </AuthenticatedView>
  )
}

function ProjectPageUrlsTable({ projectPageUrls }) {
  return (
    <div className='border border-gray-300 rounded-md'>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr className='bg-gray-100'>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
              URL
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Cadence
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Created
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4">
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {projectPageUrls 
            ? projectPageUrls.map((pageUrl, i) => <ManageRow key={pageUrl.id} pageUrl={pageUrl} key={i} />)
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
      className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      onClick={onNewConfigurationClick}
    >
      <BeakerIcon className='mx-auto h-12 w-12 text-gray-700' />
      <span className="mt-2 block text-md font-semibold text-gray-700">You haven't configured any lab tests yet.</span>
      <span className="mt-2 block text-sm font-semibold text-gray-700">Create your first lab test.</span>
    </button>
  )
}