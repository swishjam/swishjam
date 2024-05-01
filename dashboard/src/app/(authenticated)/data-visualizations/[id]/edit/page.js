'use client'

import DataVisualizationBuilder from "@/components/Dashboards/Builder/Configurations/V2/DataVisualizationBuilder";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import PageWithHeader from "@/components/utils/PageWithHeader"
import { useEffect, useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { TriangleAlertIcon } from "lucide-react";

const DEFAULT_CONFIGURATIONS_DICT = {
  BarChart: {
    showGridLines: true,
    showLegend: true,
    showTableInsteadOfLegend: true,
    showXAxis: true,
    showYAxis: true,
    maxRankingToNotBeConsideredOther: 10,
    excludeEmptyValues: false,
    emptyValuePlaceholder: 'EMPTY',
  },
  AreaChart: {
    showGridLines: true,
    showYAxis: true,
    showXAxis: true,
    includeTable: true,
    primaryColor: '#7dd3fc',
    primaryColorFill: '#bde7fd',
    secondaryColor: "#878b90",
    secondaryColorFill: "#bfc3ca",
  }
}

export default function EditDashboardComponentPage({ params }) {
  const { id: dashboardComponentId } = params;
  const [config, setConfig] = useState();
  const [componentType, setDataVisualizationType] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [numDashboards, setNumDashboards] = useState();
  const router = useRouter();

  useEffect(() => {
    SwishjamAPI.DataVizualizations.retrieve(dashboardComponentId).then(({ title, subtitle, config, num_dashboards }) => {
      setConfig({ title, subtitle, ...config });
      setDataVisualizationType(config.type)
      setNumDashboards(num_dashboards);
    })
  }, [])


  const onSave = async () => {
    setIsLoading(true);
    const { title, subtitle, ...rest } = config;
    const response = await SwishjamAPI.DataVizualizations.update(dashboardComponentId, { title, subtitle, config: { ...rest, type: componentType } });
    if (response.error) {
      setIsLoading(false);
      toast.error('Failed to create dashboard component', {
        description: response.error,
        duration: 15_000,
      })
    } else {
      toast.success('Dashboard component updated successfully');
      router.push(`/dashboards/components/${response.id}`);
    }
  }

  return (
    <CommonQueriesProvider queriesToInclude={['uniqueEventsAndCounts', 'uniqueUserProperties', 'uniqueOrganizationProperties']}>
      <PageWithHeader title='Edit Dashboard Component'>
        {numDashboards && numDashboards > 0 ? (
          <div className='bg-yellow-100 text-yellow-600 w-full p-4 mb-4 flex items-center rounded-md'>
            <TriangleAlertIcon className='w-6 h-6 mr-2' />
            <span>This component is being used in {numDashboards} dashboards. Changing the config will affect all dashboards.</span>
          </div>
        ) : <></>}
        {config
          ? (
            <DataVisualizationBuilder
              config={config}
              dataVisualizationType={componentType}
              isLoading={isLoading}
              onConfigChange={setConfig}
              onSave={onSave}
              onDataVisualizationTypeChange={type => {
                setDataVisualizationType(type);
                setConfig({ ...config, ...DEFAULT_CONFIGURATIONS_DICT[type] });
              }}
            />
          ) : (
            <div className='space-y-2'>
              <Skeleton className='w-full h-20' />
              <Skeleton className='w-full h-44' />
              <Skeleton className='w-full h-96' />
            </div>
          )}
      </PageWithHeader>
    </CommonQueriesProvider>
  )
}