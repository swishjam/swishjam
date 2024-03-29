import { Skeleton } from "@/components/ui/skeleton";

export default function EnrichedDataItem({
  title,
  enrichmentData,
  enrichmentKey,
  formatter = val => val.charAt(0).toUpperCase() + val.slice(1),
  noDataValue = '-'
}) {
  return (
    <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2 cursor-default">
      <dt className="text-sm font-medium leading-6 text-gray-900">{title}</dt>
      <dd className="text-sm leading-6 text-gray-700 flex justify-end">
        {enrichmentData
          ? [undefined, null].includes(enrichmentData[enrichmentKey]) ? noDataValue : formatter(enrichmentData[enrichmentKey])
          : <Skeleton className='h-8 w-12' />
        }
      </dd>
    </div>
  )
}