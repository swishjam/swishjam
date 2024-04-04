"use client"

import { LuPlus } from 'react-icons/lu';
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LuSplit, LuBrain, LuMail, LuMegaphone, LuFilter, LuAlarmClock } from 'react-icons/lu';

const SlackIcon = ({ className }) => <img src={'/logos/slack.svg'} className={className} />

const nodeOptions = [
  {
    heading: (<span className='flex items-center'><LuBrain size={18} className='mr-2' />Logic</span>),
    items: [
      // {
      //   value: "IfElse",
      //   label: "If/Else",
      //   icon: LuSplit,
      // },
      {
        value: "Filter",
        label: "Filter",
        icon: LuFilter,
      },
      {
        value: "Delay",
        label: "Delay",
        icon: LuAlarmClock,
      },
    ]
  },
  {
    heading: (<span className='flex items-center'><LuMegaphone size={18} className='mr-2' />Messaging</span>),
    items: [
      {
        value: "SlackMessage",
        label: "Send Slack Message",
        icon: SlackIcon,
      },
      {
        value: "ResendEmail",
        label: "Send Email",
        icon: LuMail,
      },
    ]
  },
]

export function AddNewNodePopover({ onSelection, disabled = false }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`justify-start ${disabled ? 'bg-gray-100 !opacity-100 cursor-disabled' : 'hover:border-gray-900'}`} disabled={disabled}>
            <LuPlus className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Search Automation Steps" className="border-0" />
            <CommandList>
              <CommandEmpty>No automation step found.</CommandEmpty>
              {nodeOptions.map((group, idx) => (
                <div key={idx}>
                  <CommandGroup heading={group.heading}>
                    {group.items.map((item) => (
                      <CommandItem
                        className="cursor-pointer"
                        key={item.value}
                        value={item.value}
                        onSelect={() => {
                          onSelection(item.value)
                          setOpen(false)
                        }}
                      >
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        <span>{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {(idx < nodeOptions.length - 1) && <CommandSeparator />}
                </div>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
