import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <div className='overflow-x-scroll'>
      <table className="min-w-full">
        <thead>
          <tr className='font-normal pb-2'>
            <th className="text-left text-sm text-gray-700 font-normal">
            </th>
            {Array.from(({ length: 10 }), (_, i) => (
              <th key={i} className="text-left text-sm text-gray-700 font-normal">
                Week {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white mt-2">
          {Array.from(({ length: 5 }), (_, i) => (
            <tr key={i}>
              <>
                <td className="pr-2">
                  <Skeleton className='h-8 w-20' />
                </td>
                {Array.from(({ length: 10 - i }), (_, j) => (
                  <td key={j}>
                    <Skeleton className="w-20 h-8" />
                  </td>
                ))}
              </>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}