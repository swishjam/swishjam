import ConfigurationModal from "./ConfigurationModal";
import PieChart from "@/components/Dashboards/Components/PieChart";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from "react";

export default function PieChartConfiguration({ onSaveClick = () => { } }) {
  const [pieChartData, setPieChartData] = useState();

  return (
    <ConfigurationModal
      type='Pie Chart'
      includeCalculationsDropdown={false}
      onSave={onSaveClick}
      previewDashboardComponent={title => <PieChart title={title} data={pieChartData} />}
      onConfigurationChange={({ eventName, propertyName, dataSource }) => {
        if (eventName && propertyName) {
          SwishjamAPI.Events.Properties.getCountsOfPropertyValues(eventName, propertyName, { dataSource }).then(data => {
            setPieChartData(data.map(({ value, count }) => ({ name: value, value: count })));
          });
        } else {
          setPieChartData();
        }
      }}
    />
  )
}