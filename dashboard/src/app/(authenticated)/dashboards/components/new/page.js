'use client'

import ComponentBuilder from "@/components/Dashboards/Builder/Configurations/V2/ComponentBuilder";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import PageWithHeader from "@/components/utils/PageWithHeader"
import { useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export default function NewDashboardComponentPage() {
  const [configuration, setConfiguration] = useState(DEFAULT_CONFIGURATIONS_DICT.BarChart);
  const [componentType, setComponentType] = useState('BarChart');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSave = async e => {
    setIsLoading(true);
    const { title, subtitle, ...rest } = configuration;
    const response = await SwishjamAPI.DashboardComponents.create({ title, subtitle, configuration: { ...rest, type: componentType } });
    if (response.error) {
      setIsLoading(false);
      toast.error('Failed to create dashboard component', {
        description: response.error,
        duration: 15_000,
      })
    } else {
      toast.success('Dashboard component created successfully');
      router.push(`/dashboards/components/${response.id}`);
    }
  }

  const onConfigurationChange = async configuration => {
    setConfiguration(configuration);
  }

  return (
    <CommonQueriesProvider queriesToInclude={['uniqueEventsAndCounts', 'uniqueUserProperties', 'uniqueOrganizationProperties']}>
      <PageWithHeader title='New Dashboard Component'>
        <ComponentBuilder
          configuration={configuration}
          componentType='BarChart'
          isLoading={isLoading}
          onConfigurationChange={onConfigurationChange}
          onSave={onSave}
          onComponentTypeChange={type => {
            setComponentType(type);
            setConfiguration({ ...configuration, ...DEFAULT_CONFIGURATIONS_DICT[type] });
          }}
        />
      </PageWithHeader>
    </CommonQueriesProvider>
  )
}