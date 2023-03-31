'use client';
import { useState } from 'react';
import { Card } from '@tremor/react';
import CdnInstallInstructions from './CdnInstallInstructions';
import NpmInstallInstructions from './NpmInstallInstructions';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SnippetInstall({ projectId }) {
  const [currentTab, setCurrentTab] = useState('npm');

  return (
    <Card>
      <div>
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <span onClick={() => setCurrentTab('npm')}
              className={classNames(
                currentTab === 'npm'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium cursor-pointer'
              )}
            >
              Via NPM
            </span>
            <span onClick={() => setCurrentTab('cdn')}
              className={classNames(
                currentTab === 'cdn'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium cursor-pointer'
              )}
            >
              Via CDN
            </span>
          </nav>
        </div>
      </div>

      <h1 className="text-lg font-medium mb-2">Installation Instructions</h1>
      <div className="flex ">
        {currentTab === 'npm' ? (
          <>
            <NpmInstallInstructions projectId={projectId} />
          </>
        ) : (
          <>
            <CdnInstallInstructions projectId={projectId} />
          </>
        )}
     </div >
    </Card>
  )  

}