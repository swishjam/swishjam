'use client';
import { Card } from '@tremor/react';
import CdnInstallInstructions from './CdnInstallInstructions';

export default function SnippetInstall({ projectId }) {
  return (
    <Card>
      <div className="flex">
        <div className="grow">
          <h1 className="text-lg font-medium mb-2 inline-block">SwishjamJS Installation Instructions</h1>
        </div>
      </div>
      <div className="flex ">
        <CdnInstallInstructions projectId={projectId} />
      </div>
    </Card>
  )  

}