'use client'

import PageWithHeader from "@/components/utils/PageWithHeader"
import { useEffect, useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import ComponentPreviewer from "@/components/Dashboards/Configurations/V2/DataVisualizationPreviewer";
import AreaChartRenderingEngine from "@/components/DataVisualizations/RenderingEngines/AreaChart";
import BarChartDashboardComponent from "@/components/DataVisualizations/RenderingEngines/BarChart";
import Timefilter from "@/components/Timefilter";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PencilIcon } from "lucide-react";
import ValueCardRenderingEngine from "@/components/DataVisualizations/RenderingEngines/ValueCard";

const COMPONENT_RENDERING_ENGINE_DICT = {
  AreaChart: AreaChartRenderingEngine,
  BarChart: BarChartDashboardComponent,
  // BarList: BarListDashboardComponent,
  // PieChart: PieChartDashboardComponent,
  ValueCard: ValueCardRenderingEngine,
}

export default function NewDashboardComponentPage({ params }) {
  const { id: dashboardComponentId } = params;
  const [dashboardComponent, setDashboardComponent] = useState();
  const [selectedTimeRange, setSelectedTimeRange] = useState('seven_days');

  useEffect(() => {
    SwishjamAPI.DataVizualizations.retrieve(dashboardComponentId).then(setDashboardComponent)
  }, [])

  return (
    <PageWithHeader
      title='Dashboard Component'
      buttons={
        <>
          <Timefilter onSelection={setSelectedTimeRange} selection={selectedTimeRange} />
          <Link
            href={`/dashboards/components/${dashboardComponentId}/edit`}
            className={`flex items-center space-x-1 ${buttonVariants({ variant: 'outline' })}`}
          >
            <PencilIcon className='h-4 w-4' />
            <span>Edit</span>
          </Link>
        </>
      }
    >
      {dashboardComponent
        ? (
          <ComponentPreviewer
            {...dashboardComponent.config}
            title={dashboardComponent.title}
            subtitle={dashboardComponent.subtitle}
            includeCard={dashboardComponent.visualization_type === 'ValueCard'}
            className={dashboardComponent.visualization_type === 'ValueCard' ? 'py-12 px-72' : ''}
            ComponentRenderingEngine={COMPONENT_RENDERING_ENGINE_DICT[dashboardComponent.visualization_type]}
            timeframe={selectedTimeRange}
          />
        ) : <Skeleton className='w-full h-96' />
      }
    </PageWithHeader>
  )
}