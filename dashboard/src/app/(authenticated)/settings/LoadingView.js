import WorkspaceForm from "@/components/Settings/WorkspaceForm";
import ApiKeysTable from "@/components/Settings/ApiKeysTable";

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
      <ApiKeysTable />
    </main>
  )
}