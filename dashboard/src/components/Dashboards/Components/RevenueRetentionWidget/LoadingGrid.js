import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <div className='overflow-x-scroll'>
      <table className="min-w-full">
        <thead>
          <tr className='font-normal pb-2'>
            <th className="text-left text-sm text-gray-700 font-normal">
            </th>
            <th className="text-left text-sm text-gray-700 font-normal pr-4" style={{ fontSize: '0.75rem' }}>
              Starting MRR
            </th>
            <th className="text-left text-sm text-gray-700 font-normal pr-4" style={{ fontSize: '0.75rem' }}>
              # Subscriptions
            </th>
            {Array.from(({ length: 10 }), (_, i) => (
              <th key={i} className="text-left text-sm text-gray-700 text-center font-normal">
                Month {i + 1}
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
                {Array.from(({ length: 10 }), (_, i) => (
                  <td key={i}>
                    <Skeleton className="w-20 h-20" />
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