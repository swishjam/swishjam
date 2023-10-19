
import ConfigurationModal from "./ConfigurationModal";
import BarList from '@/components/Dashboards/Components/BarList';
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from "react";

export default function BarListConfiguration({ OnConfigurationSave = () => { } }) {
  const [barListData, setBarListData] = useState();

  return (
    <ConfigurationModal
      type='Bar List'
      includeCalculationsDropdown={false}
      onSave={OnConfigurationSave}
      previewDashboardComponent={title => <BarList title={title} items={barListData} />}
      onConfigurationChange={({ eventName, propertyName, dataSource }) => {
        if (eventName && propertyName) {
          SwishjamAPI.Events.Properties.getCountsOfPropertyValues(eventName, propertyName, { dataSource }).then(data => {
            setBarListData(data.map(({ value, count }) => ({ name: value, value: count })));
          });
        } else {
          setBarListData();
        }
      }}
    />
  )
}