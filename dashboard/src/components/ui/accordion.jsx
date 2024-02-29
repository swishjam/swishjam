"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "src/lib/utils"
import { SwishjamMemory } from "@/lib/swishjam-memory"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, underline = true, chevronFirst = false, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex flex-1 items-center py-4 font-medium transition-all",
        chevronFirst && '[&[data-state=open]>div>svg]:rotate-90 [&[data-state=open]>svg]:rotate-90',
        !chevronFirst && '[&[data-state=open]>div>svg]:rotate-180 [&[data-state=open]>svg]:rotate-180',
        underline && "hover:underline",
        className
      )}
      {...props}>
      {chevronFirst && <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 mr-2" />}
      {children}
      {!chevronFirst && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

const AccordionOpen = ({ trigger, children, onOpen = () => {}, onClose = () => {}, open = false, rememberState = false, className }) => {
  const memoryId = `accordion-open-${Object.values(trigger.props).join('_').replace(/\s/g, '-')}`
  const isOpen = SwishjamMemory.get(memoryId) ?? open;
  
  const onChange = value => {
    const isOpen = value === '1'
    if (isOpen) {
      onOpen()
    } else {
      onClose()
    }
    if (rememberState) {
      SwishjamMemory.set(memoryId, isOpen)
    }
  }

  return (
    <Accordion 
      type="single" 
      defaultValue={isOpen && '1'}
      onValueChange={onChange}
      collapsible 
      >
      <AccordionItem value='1' className="border-none">
        <AccordionTrigger className={`cursor-pointer active:scale-[98%] ${className}`} chevronFirst={true} underline={false}>
          {trigger}
        </AccordionTrigger>
        <AccordionContent>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion >
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionOpen }
