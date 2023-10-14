
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Users</h1>
        </div>

        <div className="w-full flex items-center justify-end">
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="px-4 sm:px-6 lg:px-8">
          <div className="mt-2 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                      >
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="group hover:bg-gray-50 duration-300 transition cursor-pointer">
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6 lg:pl-8">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <Skeleton className='rounded-full h-12 w-12' />
                            </div>
                            <div className="ml-4">
                              <Skeleton className='rounded h-8 w-24' />
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                          <Skeleton className='rounded h-8 w-24' />
                        </td>
                        <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                          <Skeleton className='rounded h-8 w-12' />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </main>
  )
}