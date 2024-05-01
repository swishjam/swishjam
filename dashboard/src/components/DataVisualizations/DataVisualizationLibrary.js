import { DialogModal } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import ConditionalCardWrapper from "./utils/ConditionalCardWrapper";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import EmptyState from "@/components/utils/PageEmptyState";

export default function DataVisualizationLibrary({ isOpen, onClose, onDataVisualizationSelected }) {
  const [dataVisualizations, setDataVisualizations] = useState();

  useEffect(() => {
    SwishjamAPI.DataVizualizations.list().then(setDataVisualizations)
  }, [])

  return (
    <DialogModal open={isOpen} onClose={onClose} fullWidth={true} fullHeight={false} title='Data Visualizations Library'>
      {dataVisualizations && dataVisualizations.length > 0 && (
        <div className='flex justify-end'>
          <Link
            href='/data-visualizations/new'
            className={buttonVariants({ variant: 'swishjam' })}
          >
            + New Visualization
          </Link>
        </div>
      )}
      <div className='grid grid-cols-3 gap-4'>
        {!dataVisualizations && Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className='h-44' />)}
        {dataVisualizations && dataVisualizations.length === 0 &&
          <div className='col-span-3'>
            <EmptyState
              title={
                <>
                  <div className='mb-2'>You haven't created any data visualizations yet.</div>
                  <Link
                    href='/data-visualizations/new'
                    className={buttonVariants({ variant: 'swishjam' })}
                  >
                    Create your first
                  </Link>
                </>
              }
            />
          </div>
        }
        {dataVisualizations && dataVisualizations.map(dataVisualization => (
          <button
            key={dataVisualization.id}
            className="h-44"
            onClick={() => onDataVisualizationSelected(dataVisualization)}
          >
            <ConditionalCardWrapper
              className='hover:shadow-lg transition-all cursor-pointer'
              includeCard={true}
              includeSettingsDropdown={false}
              isEnlargable={false}
              subtitle={dataVisualization.subtitle}
              title={dataVisualization.title}
            >
              {dataVisualization.visualization_type}
            </ConditionalCardWrapper>
          </button>
        ))}
      </div>
    </DialogModal>
  )
}