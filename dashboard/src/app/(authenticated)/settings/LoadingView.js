import ApiKeysTable from "@/components/Settings/ApiKeysTable";
import EnrichmentSettings from "@/components/Settings/EnrichmentSettings";
import WorkspaceSettingsToggles from "@/components/Settings/WorkspaceSettingsToggles";


export default function LoadingView() {
  return (
    <>
      <div className='mt-8'>
        <WorkspaceSettingsToggles />
      </div>

      <div className='mt-8'>
        <EnrichmentSettings />
      </div>

      <div className='mt-8 space-x-4 space-y-4'>
        <ApiKeysTable />
      </div>
    </>
  )
}