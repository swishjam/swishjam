'use client'

import ComponentBuilder from "@/components/Dashboards/Builder/Configurations/V2/ComponentBuilder";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import PageWithHeader from "@/components/utils/PageWithHeader"
import { useState } from "react";

const DEFAULT_CONFIGURATIONS_DICT = {
  BarChart: {
    showGridLines: true,
    showLegend: true,
    showTableInsteadOfLegend: true,
    showXAxis: true,
    showYAxis: true,
  },
  AreaChart: {
    showGridLines: true,
    showYAxis: true,
    showXAxis: true,
    includeTable: true,
    primaryColor: '#7dd3fc',
    secondaryColor: "#878b90",
  }
}

export default function NewDashboardComponentPage() {
  const [configuration, setConfiguration] = useState({});

  const onFormSubmit = e => {
    e.preventDefault();
    // if (!selectedCalculation && includeCalculationsDropdown) {
    //   setErrorMessage('Please select a calculation to use from the event dropdown.')
    // } else if (!selectedEventName) {
    //   setErrorMessage('Please select an event to chart from the event dropdown.')
    // } else if (selectedCalculation !== 'count' && !selectedPropertyName) {
    //   setErrorMessage('Please select a property to use from the property dropdown.')
    // } else {
    //   // onSave({ title, subtitle, event: selectedEventName, property: selectedPropertyName, calculation: selectedCalculation, dataSource: dataSourceToPullFrom });
    // }
  }

  const onConfigurationChange = async configuration => {
    setConfiguration(configuration);
  }

  return (
    <CommonQueriesProvider queriesToInclude={['uniqueEventsAndCounts', 'uniqueUserProperties', 'uniqueOrganizationProperties']}>
      <PageWithHeader title='New Dashboard Component'>
        <ComponentBuilder
          configuration={configuration}
          onConfigurationChange={onConfigurationChange}
          onFormSubmit={onFormSubmit}
          onComponentTypeChange={type => setConfiguration({ ...configuration, ...DEFAULT_CONFIGURATIONS_DICT[type] })}
        />
      </PageWithHeader>
    </CommonQueriesProvider>
  )
}