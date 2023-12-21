import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FunnelIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

export default function FilterableDropdownItem({ sections, selectedOptions, onChange }) {
  const [expandedSections, setExpandedSections] = useState([])

  const toggleSection = section => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section))
    } else {
      setExpandedSections([...expandedSections, section])
    }
  }

  console.log(selectedOptions)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='relative border-none bg-white flex-shrink-0 cursor-pointer text-center rounded-md p-2 mr-2 hover:bg-gray-100'>
          {Object.keys(selectedOptions || {}).length > 0 && (
            <span className='absolute top-0 left-0 text-gray-400 bg-gray-200 rounded-full w-3 h-3' style={{ fontSize: '0.5rem' }}>
              {Object.keys(selectedOptions).length}
            </span>
          )}
          <FunnelIcon className='h-4 w-4 text-gray-500' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {/* <DropdownMenuLabel>Filter</DropdownMenuLabel> */}
        {/* <DropdownMenuSeparator /> */}
        {sections.map(({ label: sectionLabel, value: sectionValue, options }, index) => (
          <div key={sectionValue}>
            <DropdownMenuLabel
              className='cursor-pointer hover:bg-gray-100'
              onClick={() => toggleSection(sectionValue)}
            >
              {expandedSections.includes(sectionValue)
                ? <span className='mr-2'>-</span>
                : <span className='mr-2'>+</span>
              }
              {sectionLabel}
              {selectedOptions[sectionValue]?.length > 0 && (
                <span className='ml-2 px-2 py-0.5 text-gray-400 text-xs bg-gray-200 rounded-full'>
                  {selectedOptions[sectionValue].length}
                </span>
              )}
            </DropdownMenuLabel>
            <div className={`px-2 overflow-hidden transition-all ${expandedSections.includes(sectionValue) ? '' : 'h-0'}`}>
              {options.map(({ value, label }) => (
                <DropdownMenuCheckboxItem
                  checked={selectedOptions[sectionValue]?.includes(value) || selectedOptions[sectionLabel]?.includes({ value, label })}
                  className='cursor-pointer'
                  key={value}
                  onCheckedChange={checked => onChange({ checked, section: { label: sectionLabel, value: sectionValue }, option: { value } })}
                  onSelect={e => e.preventDefault()}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
              {index < sections.length - 1 && <DropdownMenuSeparator />}
            </div>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}