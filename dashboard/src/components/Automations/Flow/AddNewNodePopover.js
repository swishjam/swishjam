"use client"

import { LuPlus } from 'react-icons/lu';
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NodeTypesList } from '@/components/Automations/Flow/FlowHelpers';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function AddNewNodePopover({ onSelection }) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(null)

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start hover:border-gray-900">
            <LuPlus className="h-5 w-5" /> 
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Search Automation Steps" className="border-0"/>
            <CommandList>
              <CommandEmpty>No automation step found.</CommandEmpty>
              {NodeTypesList.map((group, idx) => (
                <div key={idx}>
                  <CommandGroup heading={group.heading}>
                    {group.items.map((item) => (
                      <CommandItem
                        className="cursor-pointer"
                        key={item.value}
                        value={item.value}
                        onSelect={(value) => {
                          onSelection(value)
                          setOpen(false)
                        }}
                      >
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        <span>{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {(idx < NodeTypesList.length - 1) && <CommandSeparator />}
                </div>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
