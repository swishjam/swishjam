import { useState } from "react";
import LoadingSpinner from '@/components/LoadingSpinner';
import { API } from "@/lib/api-client/base";

export default function UrlSegmentPill({ urlSegment, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    API.delete(`/api/v1/url_segments/${urlSegment.id}`).then(({ error }) => {
      setIsDeleting(false);
      if (error) {
      } else {
        onDelete(urlSegment);
      }
    })
  }

  return (
    <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-500/10">
      {urlSegment.name}: {urlSegment.url_host}
      {isDeleting && <LoadingSpinner color='gray' className='w-1 h-1 -mr-1' />}
      {!isDeleting && (
        <button type="button" className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20" onClick={handleDelete}>
          <span className="sr-only">Remove</span>
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
            <path d="M4 4l6 6m0-6l-6 6" />
          </svg>
          <span className="absolute -inset-1" />
        </button>
      )}
    </span>
  )
}