'use client'

import DataVisualizationBuilder from "@/components/Dashboards/Builder/Configurations/V2/DataVisualizationBuilder";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import PageWithHeader from "@/components/utils/PageWithHeader"
import { useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DEFAULT_CONFIGS_DICT = {
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

export default function NewDashboardComponentPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIGS_DICT.BarChart);
  const [dataVisualizationType, setDataVisualizationType] = useState('BarChart');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSave = async () => {
    setIsLoading(true);
    const { title, subtitle, ...rest } = config;
    debugger;
    const response = await SwishjamAPI.DataVizualizations.create({ title, subtitle, visualization_type: dataVisualizationType, config: rest });
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

  console.log('config', config)

  return (
    <CommonQueriesProvider queriesToInclude={['uniqueEventsAndCounts', 'uniqueUserProperties', 'uniqueOrganizationProperties']}>
      <PageWithHeader title='New Dashboard Component'>
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