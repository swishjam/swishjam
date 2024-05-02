'use client'

import PageWithHeader from "@/components/utils/PageWithHeader"
import { useEffect, useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import Timefilter from "@/components/Timefilter";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PencilIcon } from "lucide-react";
import DataVisualizationRenderingEngine from "@/components/DataVisualizations/RenderingEngines/DataVisualizationRenderingEngine";

export default function NewdataVisualizationPage({ params }) {
  const { id: dataVisualizationId } = params;
  const [dataVisualization, setdataVisualization] = useState();
  const [selectedTimeRange, setSelectedTimeRange] = useState('seven_days');

  useEffect(() => {
    SwishjamAPI.DataVizualizations.retrieve(dataVisualizationId).then(setdataVisualization)
  }, [])

  return (
    <PageWithHeader
      title='Data Visualization'
      buttons={
        <>
          <Timefilter onSelection={setSelectedTimeRange} selection={selectedTimeRange} />
          <Link
            href={`/data-visualizations/${dataVisualizationId}/edit`}
            className={`flex items-center space-x-1 ${buttonVariants({ variant: 'outline' })}`}
          >
            <PencilIcon className='h-4 w-4' />
            <span>Edit</span>
          </Link>
        </>
      }
    >
      {dataVisualization
        ? (
          <div className={`${dataVisualization.visualization_type === 'ValueCard' ? 'h-96' : 'h-[80vh]'} w-full`}>
            <DataVisualizationRenderingEngine
              {...dataVisualization.config}
              title={dataVisualization.title}
              subtitle={dataVisualization.subtitle}
              type={dataVisualization.visualization_type}
              timeframe={selectedTimeRange}
              includeCard={true}
            />
          </div>
        ) : <Skeleton className='w-full h-96' />
      }
    </PageWithHeader>
  )
}