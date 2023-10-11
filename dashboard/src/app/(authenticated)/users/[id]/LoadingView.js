import Breadcrumbs from "./Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingView({}) {
  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <Breadcrumbs userName={<Skeleton className='h-6 w-48' />} />
      <div className='grid grid-cols-10 gap-4 mt-4'>
        <Card className='col-span-4'>
          <CardHeader>
            <div className='flex items-center'>
              <Skeleton className='rounded-full h-20 w-20 mr-4' />
              <div>
                <Skeleton className='h-12 w-24' />
                <Skeleton className='h-6 w-48 mt-2' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-t border-slate-100 w-full" />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <div className="border-t border-slate-100 w-full mt-4" />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <div className="border-t border-slate-100 w-full mt-4" />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
            <Skeleton className='h-6 w-full mt-4' />
          </CardContent>
        </Card>
        <div className='col-span-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-8 w-48 mt-2' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-48 w-full mt-2' />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <Skeleton className='h-8 w-48 mt-2' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-48 w-full mt-2' />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <Skeleton className='h-8 w-48 mt-2' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-48 w-full mt-2' />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}