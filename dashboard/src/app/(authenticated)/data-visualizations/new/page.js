'use client'

import DataVisualizationBuilder from "@/components/Dashboards/Configurations/V2/DataVisualizationBuilder";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import PageWithHeader from "@/components/utils/PageWithHeader"
import { sanitizedConfigDataForVisualizationType, DEFAULT_CONFIGS_DICT } from "@/lib/data-visualizations-helpers";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewDashboardComponentPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIGS_DICT.BarChart);
  const [dataVisualizationType, setDataVisualizationType] = useState('BarChart');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSave = async () => {
    setIsLoading(true);
    const { title, subtitle, ...rest } = config;
    debugger;
    const response = await SwishjamAPI.DataVizualizations.create({
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
      toast.success('Data visualization created successfully');
      router.push(`/data-visualizations/${response.id}`);
    }
  }

  return (
    <CommonQueriesProvider queriesToInclude={['uniqueEventsAndCounts', 'uniqueUserProperties', 'uniqueOrganizationProperties']}>
      <PageWithHeader title='New Data Visualization'>
        <DataVisualizationBuilder
          config={config}
          dataVisualizationType='BarChart'
          isLoading={isLoading}
          onConfigChange={setConfig}
          onSave={onSave}
          onDataVisualizationTypeChange={type => {
            setDataVisualizationType(type);
            setConfig({ ...config, ...DEFAULT_CONFIGS_DICT[type] });
          }}
        />
      </PageWithHeader>
    </CommonQueriesProvider>
  )
}