import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatEventDataForCombobox, formatSelectedValueForCombobox } from "@/lib/utils/eventComboboxFormatter"
import { LuChevronsUpDown } from "react-icons/lu";

export default function ComboboxEvents({ selectedValue, onSelectionChange, options, placeholder = "Select an option", minWidth = '200px', maxHeight = '400px', buttonClass }) {
  const [isOpen, setIsOpen] = useState(false)
  const formattedOptions = formatEventDataForCombobox(options)

  // const optionForValue = value => options.find(option => option.value && option.value.toLowerCase() === value.toLowerCase())

  return (
    options === undefined
      ? (
        <Skeleton className={`w-${minWidth} h-10`} />
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
            asChild
          >
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className={`w-full font-normal text-sm truncate ${buttonClass}`}
            >
              <div className='flex items-center justify-between w-full'>
                <span className='flex-grow truncate'>{selectedValue ? formatSelectedValueForCombobox(selectedValue) : placeholder}</span>
                <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </div>
            </Button >
          </PopoverTrigger >
          <PopoverContent className={`max-w-[400px] p-0 ${buttonClass}`}>
            <Command>
              <CommandInput className="border-0" placeholder="Search..." />
              <CommandEmpty>No results found for search.</CommandEmpty>
              <div style={{ maxHeight }} className="overflow-y-scroll overflow-x-hidden">
                {formattedOptions.map((group, idx) => (
                  <div key={idx}>
                    <CommandGroup heading={group.heading}>
                      {group.items.map((item, i) => (
                        <CommandItem
                          key={i}
                          className={`cursor-pointer ${selectedValue === item.value ? 'bg-gray-100 text-swishjam font-semibold' : ''}`}
                          value={item.value}
                          onSelect={() => {
                            onSelectionChange(item.value)
                            setIsOpen(false)
                          }}
                        >
                          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                          <span className="capitalize truncate">{item.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {(idx < formattedOptions.length - 1) && <CommandSeparator />}
                  </div>
                ))}
              </div>
            </Command>
          </PopoverContent>
        </Popover >
      )
  )
}