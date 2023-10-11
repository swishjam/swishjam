import ConfigurationModal from "./ConfigurationModal";
import ValueCard from "@/components/Dashboards/Components/ValueCard";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from "react";

export default function PieChartConfiguration({ onSaveClick = () => { } }) {
  const [valueCardValue, setValueCardValue] = useState();
  const [valueCardPreviousValue, setValueCardPreviousValue] = useState();

  return (
    <ConfigurationModal
      type='Pie Chart'
      includeCalculationsDropdown={false}
      includePropertiesDropdown={false}
      onSave={onSaveClick}
      previewDashboardComponent={title => <ValueCard title={title} value={valueCardValue} previousValue={valueCardPreviousValue} />}
      onConfigurationChange={({ eventName, propertyName, calculation, dataSource }) => {
        if (eventName) {
          SwishjamAPI.Events.count(eventName, { dataSource }).then(({ count, comparison_count }) => {
            setValueCardValue(count);
            setValueCardPreviousValue(comparison_count);
          });
        } else {
          setValueCardValue();
          setValueCardPreviousValue();
        }
      }}
    />
  )
}