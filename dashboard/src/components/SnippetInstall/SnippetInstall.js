'use client';
import { useState } from 'react';
import { Card } from '@tremor/react';
import TabButtons from './tabButtons';
import CdnInstallInstructions from './CdnInstallInstructions';
import NpmInstallInstructions from './NpmInstallInstructions';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SnippetInstall({ projectId }) {
  const [currentTab, setCurrentTab] = useState('npm');

  return (
    <Card>

      <div className="flex">
        <div className="grow">
          <h1 className="text-lg font-medium mb-2 inline-block">Installation Instructions</h1>
        </div>
        <TabButtons currentTab={currentTab} setTab={setCurrentTab} /> 
      </div>
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