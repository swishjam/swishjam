import BarChartComponent from "@/components/Dashboards/DataVisualizations/BarChart";
import ConfigurationModal from "./ConfigurationModal";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from "react";

export default function BarChartConfiguration({ onConfigurationSave = () => { } }) {
  const [barChartResults, setBarChartResults] = useState();

  const onConfigurationChange = ({ eventName, propertyName, dataSource }) => {
    setBarChartResults();
    if (eventName && propertyName) {
      SwishjamAPI.Events.Properties.barChartForProperty(eventName, propertyName, { dataSource }).then(
        ({ bar_chart_data, grouped_by }) => {
          setBarChartResults({ data: bar_chart_data, groupedBy: grouped_by });
        }
      );
    }
  }

  return (
    <ConfigurationModal
      type='Bar Chart'
      includeCalculationsDropdown={false}
      includePropertiesDropdown={true}
      includeUserProperties={true}
      onConfigurationChange={onConfigurationChange}
      onSave={onConfigurationSave}
      previewDashboardComponent={(title, subTitle) => (
        <BarChartComponent
          title={title}
          subTitle={subTitle}
          data={barChartResults?.data}
          groupedBy={barChartResults?.groupedBy}
          includeSettingsDropdown={false}
          includeCard={true}
        />
      )}
    />
  )
}