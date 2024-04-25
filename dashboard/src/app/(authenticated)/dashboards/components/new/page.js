'use client'

import ComponentBuilder from "@/components/Dashboards/Builder/Configurations/V2/ComponentBuilder";
import CommonQueriesProvider from "@/providers/CommonQueriesProvider";
import PageWithHeader from "@/components/utils/PageWithHeader"
import { useState } from "react";

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
    console.log('configuration changed!', configuration);
    setConfiguration(configuration);
  }

  return (
    <CommonQueriesProvider queriesToInclude={['uniqueEventsAndCounts', 'uniqueUserProperties', 'uniqueOrganizationProperties']}>
      <PageWithHeader title='New Dashboard Component'>
        <ComponentBuilder
          configuration={configuration}
          onConfigurationChange={onConfigurationChange}
          previewDashboardComponent={console.log}
          onFormSubmit={onFormSubmit}
        />
      </PageWithHeader>
    </CommonQueriesProvider>
  )
}