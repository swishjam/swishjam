'use client'

import { useAuth } from "@/components/AuthProvider";
import AuthenticatedView from "@/components/AuthenticatedView"
import SnippetInstall from "@/components/SnippetInstall/SnippetInstall"

export default function InstallScript() {
  const { currentProject } = useAuth();

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">SwishjamJS Install Script</h1>
          <h2 className='text-sm text-gray-400 mb-8'>Use this JS snippet to collect your real user performance data.</h2>

          {currentProject
            ? <SnippetInstall projectId={currentProject.public_id} />
            : <div className='w-full rounded bg-gray-200 animate-pulse h-42' />}
          
        </div>
      </main>
    </AuthenticatedView>
  )
}