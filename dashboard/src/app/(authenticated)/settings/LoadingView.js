import WorkspaceForm from "@/components/Settings/WorkspaceForm";
import NewAnalyticsFamilyConfigurationForm from "@/components/Settings/AnalyticsFamilyConfigurationForm";
import { Skeleton } from "@/components/ui/skeleton";

const Divider = () => <div className="my-6 w-full border-t border-gray-300" />;

export default function LoadingView() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 my-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
        </div>
      </div>

      <WorkspaceForm isSubmittable={false} />
      <Divider />
      <NewAnalyticsFamilyConfigurationForm isSubmittable={false} />

      <div className='mt-4 space-x-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="inline-flex items-center gap-x-0.5 rounded-md animate-pulse bg-gray-200 w-48 h-10 ring-1 ring-inset ring-gray-500/10" />
        ))}
      </div>

      <Divider />
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
          Workspace public key
        </label>
        <div className="mt-2 flex">
          <Skeleton className='w-48 h-10 bg-gray-200' />
        </div>
      </div>
    </main>
  )
}