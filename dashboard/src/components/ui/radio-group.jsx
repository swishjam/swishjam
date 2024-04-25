"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "src/lib/utils"
import { Label } from "./label"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (<RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />);
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full transform duration-300 border border-swishjam text-swishjam ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:border-zinc-50 dark:text-zinc-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300",
        className
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>)
  );
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const RadioGroupItems = ({ direction = 'vertical', items, selected, onSelect, className }) => {
  const formattedItems = items.map(item => {
    if (typeof item === 'string') {
      return { value: item, label: item }
    }
  })
  return (
    <RadioGroup
      className={cn(className, direction === 'vertical' ? '' : 'flex items-center space-x-2')}
      defaultValue={selected}
      onValueChange={onSelect}
    >
      {formattedItems.map(({ value, label }) => (
        <div key={value} className="flex items-center space-x-2">
          <RadioGroupItem value={value} id={value} />
          <Label className='cursor-pointer capitalize' htmlFor={value}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}

export { RadioGroupItems, RadioGroup, RadioGroupItem }
