import { useState } from "react";
import LoadingSpinner from '@/components/LoadingSpinner';
import { API } from "@/lib/api-client/base";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const TooltipOnHover = ({ children, msg }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <p className='text-gray-600 font-light'>{msg}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


export default function AnalyticsFamilyConfigurationPill({ analyticsFamilyConfiguration, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    API.delete(`/api/v1/analytics_family_configurations/${analyticsFamilyConfiguration.id}`).then(({ error }) => {
      setIsDeleting(false);
      if (error) {
      } else {
        onDelete(analyticsFamilyConfiguration);
      }
    })
  }

  return (
    <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-500/10">
      <TooltipOnHover msg={analyticsFamilyConfiguration.description}>
        <InfoCircledIcon className="w-4 h-4 text-gray-700 mr-1" />
      </TooltipOnHover>
      {analyticsFamilyConfiguration.friendly_name}: <span className='bg-gray-300 rounded px-2 py-1 italic text-xs'>{analyticsFamilyConfiguration.url_regex}</span>
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