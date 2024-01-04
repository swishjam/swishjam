import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Toggle from "@/components/utils/Toggle";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function EnrichmentSettings({ onEnrichmentToggle, onEnrichmentProviderChanged, isEnabled, enrichmentProvider }) {
  return (
    <>
      <h2 className="block text-sm font-medium leading-6 text-gray-900">Enrichment Settings</h2>
      <Toggle
        text={<span className='text-sm text-gray-700'>Enrich user profile data.</span>}
        checked={isEnabled}
        onChange={onEnrichmentToggle}
      />
      <div className='flex items-center gap-x-2 mt-2'>
        <span className='text-sm text-gray-700'>Enrichment provider:</span>
        <Select
          // onValueChange={e => onEnrichmentProviderChanged()}
          defaultValue={enrichmentProvider}
          disabled={!isEnabled}
        >
          <SelectTrigger className='w-fit'>
            <SelectValue placeholder="Select your enrichment provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer hover:bg-gray-100" value='octolane'>Octolane</SelectItem>
            <SelectItem className="cursor-pointer hover:bg-gray-100" value='people_data_labs'>People Data Labs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='mt-2'>
        <div className='flex items-center gap-x-2'>
          <span className='text-sm text-gray-700'>Email domains to not enrich:</span>
          <div className='flex'>
            {/* <form onSubmit={onEnrichmentDomainsToNotEnrichSubmit}> */}
            <Input className='w-fit' placeholder='gmail.com' />
            <button
              type='submit'
              className={`ml-2 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam`}
            >
              Add
            </button>
            {/* </form> */}
          </div>
        </div>
      </div>
    </>
  )
}