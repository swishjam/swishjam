import { cn } from "src/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800", className)}
      {...props} />)
  );
}

export { Skeleton }
