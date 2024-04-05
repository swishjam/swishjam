"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "src/lib/utils"

const Checkbox = React.forwardRef(({ className = '', labelClass = '', id, label, size = 4, ...props }, ref) => (
  <>
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer shrink-0 rounded-sm border border-zinc-400 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-swishjam data-[state=checked]:text-zinc-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:text-zinc-900",
        `h-${size} w-${size}`,
        className
      )}
      id={id}
      {...props}>
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <Check className={`h-${size} w-${size}`} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    <label
      htmlFor={id}
      className={`cursor-pointer transition-all duration-200 text-xs text-gray-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 active:text-gray-900 peer-active:text-gray-900 hover:text-gray-700 peer-hover:text-gray-700 active:scale-[98%] peer-active:scale-[98%] ${labelClass}`}
    >
      {label}
    </label>
  </>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
