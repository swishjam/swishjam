import { Button } from "@/components/ui/button"
import { LuChevronsUpDown, LuCheck } from "react-icons/lu"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Combobox({
  selectedValue,
  onSelectionChange,
  options,
  placeholder = "Select an option",
  minWidth = '200px',
  maxHeight = '300px',
  buttonClass = '',
  popoverClass = '',
  inModal = false,
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (options) {
    options = options.map(option => {
      if (typeof option === "string") {
        return { label: option, value: option }
      }
      return option
    })
  }

  const optionForValue = value => options.find(option => option.value && option.value.toLowerCase() === value.toLowerCase())

  return (
    options === undefined
      ? (
        <Skeleton className={`w-${minWidth} h-10`} />
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen} modal={inModal}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className={`w-full justify-between font-normal text-sm ${buttonClass || ''}`}
            >
              <span className="truncate overflow-hidden">
                {selectedValue ? optionForValue(selectedValue)?.label : <span className='italic text-gray-500'>{placeholder}</span>}
              </span>
              <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger >
          <PopoverContent className={`max-w-[400px] p-0 ${popoverClass}`}>
            <Command>
              <CommandInput className="border-0" placeholder="Search..." />
              <CommandEmpty>No results found for search.</CommandEmpty>

              <CommandGroup className='overflow-y-scroll' style={{ maxHeight }}>
                {options.map((option, i) => {
                  if (option.type === "separator") {
                    return <CommandSeparator className='my-1' key={i} />
                  } else if (option.type === 'title') {
                    return (
                      <div
                        key={i}
                        className={`text-sm font-bold text-gray-700 py-2 px-1 mt-1 border-gray-200 ${i > 0 ? 'border-t' : ''}`}
                        disabled
                      >
                        {option.label}
                      </div>
                    )
                  } else {
                    const isSelected = selectedValue && selectedValue.toLowerCase() === option.value.toLowerCase()
                    return (
                      <CommandItem
                        className={`text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-100 ease-in-out pl-2 ${isSelected ? 'bg-gray-100 text-swishjam font-semibold' : ''}`}
                        key={i}
                        value={option.value}
                        onSelect={newValue => {
                          setIsOpen(false)
                          onSelectionChange(optionForValue(newValue)?.value)
                        }}
                      >
                        {option.label}
                        <LuCheck className={cn("ml-auto h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    )
                  }
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover >
      )
  )
}