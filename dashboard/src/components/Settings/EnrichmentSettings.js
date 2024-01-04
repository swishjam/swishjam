import { Badge } from "@/components/ui/badge";
import CardSection from "./CardSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Toggle from "@/components/utils/Toggle";
import { useState } from "react";
import { XIcon } from "lucide-react";

export default function EnrichmentSettings({
  doNotEnrichEmailDomains,
  isUserEnrichmentEnabled,
  isOrganizationEnrichmentEnabled,
  enrichmentProvider,
  onUserEnrichmentToggle,
  onOrganizationEnrichmentToggle,
  onEnrichmentProviderChanged,
  onDoNotEnrichEmailDomainAdded,
  onDoNotEnrichEmailDomainRemoved
}) {
  const [doNotEnrichEmailDomainInputValue, setDoNotEnrichEmailDomainInputValue] = useState('')

  const handleDoNotEnrichFormSubmit = e => {
    e.preventDefault()
    onDoNotEnrichEmailDomainAdded(doNotEnrichEmailDomainInputValue)
    setDoNotEnrichEmailDomainInputValue('')
  }

  console.log(enrichmentProvider)

  return (
    <>
      <CardSection
        title='Enrichment Settings'
        sections={[
          {
            title: 'Enrich user profile data?',
            subTitle: 'When enabled, Swishjam will enrich your user profile data upon each identify call.',
            body: <Toggle checked={isUserEnrichmentEnabled} onChange={onUserEnrichmentToggle} disabled={doNotEnrichEmailDomains === undefined} />
          },
          {
            title: 'Enrich organization profile data?',
            subTitle: 'When enabled, Swishjam will enrich your organization profile data upon each setOrganization call.',
            body: <Toggle checked={isOrganizationEnrichmentEnabled} onChange={onOrganizationEnrichmentToggle} disabled={doNotEnrichEmailDomains === undefined} />
          },
          {
            title: 'Enrichment provider',
            subTitle: 'Select which enrichment provider you would like to enrich the profile with.',
            body: (
              <Select
                onValueChange={onEnrichmentProviderChanged}
                defaultValue={enrichmentProvider}
                value={enrichmentProvider}
                disabled={doNotEnrichEmailDomains === undefined}
              >
                <SelectTrigger className='w-fit'>
                  <SelectValue placeholder="Select your enrichment provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer hover:bg-gray-100" value='octolane'>Octolane</SelectItem>
                  <SelectItem className="cursor-pointer hover:bg-gray-100" value='people_data_labs'>People Data Labs</SelectItem>
                </SelectContent>
              </Select>
            )
          }, {
            title: 'Email domains to not enrich',
            subTitle: 'When a user has an email address with one of these domains, Swishjam will not enrich the profile.',
            body: (
              <div>
                <form className='flex justify-end' onSubmit={handleDoNotEnrichFormSubmit}>
                  <input
                    className='input w-fit'
                    disabled={doNotEnrichEmailDomains === undefined}
                    onChange={e => setDoNotEnrichEmailDomainInputValue(e.target.value)}
                    placeholder='(ie: gmail.com)'
                    type='text'
                    value={doNotEnrichEmailDomainInputValue}
                  />
                  <button
                    type="submit"
                    className={`ml-2 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${doNotEnrichEmailDomains === undefined ? 'bg-gray-200 animate-pulse cursor-not-allowed' : 'bg-swishjam hover:bg-swishjam-dark'}`}
                  >
                    Add
                  </button>
                </form>
                <div className='flex flex-wrap gap-1 mt-2'>
                  {doNotEnrichEmailDomains?.map(({ email_domain, id }) => (
                    <Badge variant='secondary' className='py-2 flex items-center w-fit'>
                      <span className='text-sm text-gray-700 block mr-1'>{email_domain}</span>
                      <button
                        className='text-sm text-gray-500 flex items-center rounded-full p-1 hover:bg-gray-200'
                        onClick={() => onDoNotEnrichEmailDomainRemoved(id)}
                      >
                        <XIcon className='w-3 h-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )
          }
        ]}
      />
    </>
  )
}