'use client';

import { useState } from 'react';
import AuthenticatedView from "@/components/AuthenticatedView";
import { API } from "@/lib/api-client/base";

export default function DeployPage() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [successMessage, setSuccessMessage] = useState();

  const deploy = async () => {
    setIsDeploying(true);
    await API.post('/api/instrumentation/deploy');
    setSuccessMessage('Instrumentation deployed successfully.');
    setIsDeploying(false);
  }

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-lg font-medium text-gray-700 mb-0">Re-deploy SwishjamJS with most update-to-date logic.</h1>
        <div className='p-8 text-center'>
          {successMessage && <div className='text-green-500 mb-4 text-md'>{successMessage}</div>}
          <button
            onClick={deploy}
            className={`m-auto text-lg bg-swishjam rounded-md text-white px-4 py-2 rounded hover:bg-swishjam-dark ${isDeploying ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDeploying}
          >
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </button>
        </div>
      </main>    
    </AuthenticatedView>
  )
}