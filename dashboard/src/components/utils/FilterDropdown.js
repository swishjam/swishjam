import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FunnelIcon } from "@heroicons/react/24/outline"
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from "@radix-ui/react-scroll-area"

export default function FilterableDropdownItem({ hasProfileEnrichmentEnabled, sections, selectedOptions, onChange, onClearAllFilters }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='relative border-none bg-white flex-shrink-0 cursor-pointer text-center rounded-md p-2 mr-2 hover:bg-gray-100'>
          {Object.keys(selectedOptions || {}).length > 0 && Object.keys(selectedOptions).map(section => selectedOptions[section].length > 0).includes(true) && (
            <span className='absolute top-[-3px] left-[-3px] text-white bg-swishjam rounded-full w-4 h-4 flex items-center justify-center text-xs p-2'>
              {Object.keys(selectedOptions).map(section => selectedOptions[section].length).reduce((a, b) => a + b)}
            </span>
          )}
          <FunnelIcon className='h-4 w-4 text-gray-700' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96">
        <DropdownMenuLabel className='flex items-center justify-between py-4'>
          <div className='flex items-center text-gray-500'>
            <FunnelIcon className='h-4 w-4 inline-block mr-2' />
            User Filter
          </div>
          <button
            className='text-xs text-gray-500 hover:text-gray-600'
            onClick={onClearAllFilters}
          >
            Clear all
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='mb-0' />
        {!sections ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div className='w-full px-2 py-1' key={index}>
              <Skeleton className='w-full h-4' />
            </div>
          ))
        ) : (
          <ScrollArea className='max-h-96 overflow-y-scroll'>
            {sections.map(({ label: sectionLabel, value: sectionValue, options }, index) => {
              if (options.length > 1) {
                return (
                  <div key={sectionValue}>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1" className={index === sections.length - 1 ? 'border-none' : ''}>
                        <DropdownMenuLabel className='cursor-pointer hover:bg-gray-100'>
                          <AccordionTrigger underline={false} chevronFirst={true}>
                            {sectionLabel}
                            {selectedOptions[sectionValue]?.length > 0 && (
                              <span className='ml-2 px-2 py-0.5 text-gray-400 text-xs bg-gray-200 rounded-full'>
                                {selectedOptions[sectionValue].length}
                              </span>
                            )}
                          </AccordionTrigger>
                        </DropdownMenuLabel>
                        <AccordionContent>
                          <div className='px-2 overflow-hidden'>
                            {options.map(({ value, label, numUsers }) => (
                              <DropdownMenuCheckboxItem
                                checked={selectedOptions[sectionValue]?.includes(value) || selectedOptions[sectionLabel]?.includes({ value, label })}
                                className='cursor-pointer flex items-center justify-between hover:bg-gray-100 text-gray-700'
                                key={value}
                                onCheckedChange={checked => onChange({ checked, section: { label: sectionLabel, value: sectionValue }, option: { value } })}
                                onSelect={e => e.preventDefault()}
                              >
                                <span className='truncate'>{label}</span>
                                {typeof numUsers === 'number' && (
                                  <span className='text-gray-400 text-xs whitespace-nowrap ml-2'>
                                    {numUsers} users
                                  </span>
                                )}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )
              }
            }).filter(Boolean)}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}