
import { useState } from 'react';
import NewSiteDialog from '@components/NewSiteDialog';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function NoProjectsView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="text-center mt-32">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z" />
      </svg>

      <h3 className="mt-2 text-sm font-semibold text-gray-900">Create Your First Project</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating your first project to track.</p>
      <div className="mt-6">
        <button
          onClick={() => setIsDialogOpen(true)}
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Project
        </button>
        <NewSiteDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onComplete={() => setIsDialogOpen(false)} />
      </div>
    </div>
  )
}