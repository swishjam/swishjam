'use client'

import DataVisualizationBuilder from "@/components/Dashboards/Configurations/V2/DataVisualizationBuilder";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import PageWithHeader from "@/components/utils/PageWithHeader"
import { useEffect, useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { TriangleAlertIcon } from "lucide-react";
import { DEFAULT_CONFIGURATIONS_DICT, sanitizedConfigDataForVisualizationType } from "@/lib/data-visualizations-helpers";

export default function EditDashboardComponentPage({ params }) {
  const { id: dashboardComponentId } = params;
  const [config, setConfig] = useState();
  const [dataVisualizationType, setDataVisualizationType] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [numDashboards, setNumDashboards] = useState();
  const router = useRouter();

  useEffect(() => {
    SwishjamAPI.DataVizualizations.retrieve(dashboardComponentId).then(({ title, subtitle, visualization_type, config, num_dashboards }) => {
      setConfig({ title, subtitle, ...config });
      setDataVisualizationType(visualization_type);
      setNumDashboards(num_dashboards);
    })
  }, [])


  const onSave = async () => {
    setIsLoading(true);
    const { title, subtitle, ...rest } = config;
    const response = await SwishjamAPI.DataVizualizations.update(dashboardComponentId, {
      title,
      subtitle,
      visualization_type: dataVisualizationType,
      config: sanitizedConfigDataForVisualizationType(dataVisualizationType, rest),
    });
    if (response.error) {
      setIsLoading(false);
      toast.error('Failed to create data visualization', {
        description: response.error,
        duration: 15_000,
      })
    } else {
      toast.success('Data visualization updated successfully');
      router.push(`/dashboards/components/${response.id}`);
    }
  }

  return (
    <CommonQueriesProvider queriesToInclude={['uniqueEventsAndCounts', 'uniqueUserProperties', 'uniqueOrganizationProperties']}>
      <PageWithHeader title='Edit Data Visualization'>
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
              dataVisualizationType={dataVisualizationType}
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