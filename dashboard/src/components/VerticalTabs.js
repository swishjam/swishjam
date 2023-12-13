"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function VerticalTabs({ className, items, ...props }) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted text-swishjam"
              : "hover:bg-transparent hover:text-swishjam",
            "justify-start group duration-300 transition-all"
          )}
        >
          <item.icon
            className={cn(
              pathname === item.href ? 'text-swishjam' : 'text-gray-400 group-hover:text-swishjam',
              '-ml-0.5 mr-2 h-5 w-5 duration-300 transition-all'
            )}
            aria-hidden="true"
          />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}