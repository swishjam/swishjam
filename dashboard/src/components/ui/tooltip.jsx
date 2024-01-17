"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "src/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "text-zinc-950 dark:bg-zinc-950 z-50 overflow-hidden rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-zinc-800 dark:text-zinc-50",
        className
      )}
      {...props}
    />
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const TooltipArrow = TooltipPrimitive.Arrow;

const Tooltipable = ({ children, content, delay = 200, direction = "top" }) => (
  <TooltipProvider>
    <Tooltip delayDuration={delay}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={direction} className='max-w-[500px]'>
        <span className='text-xs text-gray-700'>{content}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export {
  Tooltipable,
  Tooltip,
  TooltipArrow,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};
