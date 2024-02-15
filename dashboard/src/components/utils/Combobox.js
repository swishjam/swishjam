import { Button } from "@/components/ui/button"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Combobox({ selectedValue, onSelectionChange, options, placeholder = "Select an option", maxHeight = '400px' }) {
  const [isOpen, setIsOpen] = useState(false)

  if (options) {
    options = options.map(option => {
      if (typeof option === "string") {
        return { label: option, value: option }
      }
      return option
    })
  }

  return (
    options === undefined
      ? (
        <Skeleton className="w-[200px] h-10" />
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="min-w-[200px] max-w-[400px] justify-between font-normal text-sm"
            >
              {selectedValue ? options.find(option => option.value && option.value.toLowerCase() === selectedValue.toLowerCase())?.label : placeholder}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button >
          </PopoverTrigger >
          <PopoverContent className="max-w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>No results found for search.</CommandEmpty>
              <CommandGroup className='overflow-y-scroll' style={{ maxHeight }}>
                {options.map((option, i) => {
                  if (option.type === "separator") {
                    return <CommandSeparator className='my-1' key={i} />
                  } else if (option.type === 'title') {
                    return (
                      <CommandItem
                        key={i}
                        className="text-sm font-bold text-gray-900"
                        disabled
                      >
                        {option.label}
                      </CommandItem>
                    )
                  } else {
                    return (
                      <CommandItem
                        className='text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-100 ease-in-out pl-2'
                        key={option.value}
                        value={option.value}
                        onSelect={newValue => {
                          setIsOpen(false)
                          onSelectionChange(newValue)
                        }}
                      >
                        {option.label}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedValue && selectedValue.toLowerCase() === option.value.toLowerCase() ? "opacity-100" : "opacity-0"
                          )}
                        />
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