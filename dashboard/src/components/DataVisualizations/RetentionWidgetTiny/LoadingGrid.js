import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <div className='relative'>
      <div className='no-scrollbar overflow-scroll min-w-full relative transition-all'>
        <table>
          <tbody className="bg-white">
            {Array.from(({ length: 4 }), (_, i) => (
              <tr key={i}>
                <>
                  <td className="whitespace-nowrap text-sm pr-4">
                    <span className='block' style={{ fontSize: '0.85rem' }}><Skeleton className='w-8 h-5' /></span>
                  </td>
                  {Array.from(({ length: 4 - i }), (_, i) => (
                    <td className="whitespace-nowrap text-sm" key={i}>
                      <Skeleton className="w-6 h-6" />
                    </td>
                  ))}
                </>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}