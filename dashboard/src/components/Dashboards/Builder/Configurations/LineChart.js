import ConfigurationModal from "./ConfigurationModal";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import Toggle from "@/components/utils/Toggle";
import { useState } from "react";

export default function LineChartConfiguration({ onSaveClick = () => { } }) {
  const [hideAxisConfig, setHideAxisConfig] = useState(false);
  const [includeSettingsDropdownConfig, setIncludeSettingsDropdownConfig] = useState(true);
  const [includeComparisonDataConfig, setIncludeComparisonDataConfig] = useState(true);
  const [timeseriesData, setTimeseriesData] = useState();

  const onConfigurationChange = ({ eventName, propertyName, calculation, dataSource, includeComparisonData }) => {
    setTimeseriesData();
    SwishjamAPI.Events.timeseries(eventName, propertyName, { calculation, dataSource, include_comparison: includeComparisonData }).then(
      ({ timeseries, comparison_timeseries, current_count, comparison_count, comparison_end_time, grouped_by }) => {
        setTimeseriesData({
          value: current_count,
          previousValue: comparison_count,
          previousValueDate: comparison_end_time,
          valueChange: current_count - comparison_count,
          groupedBy: grouped_by,
          timeseries: timeseries.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value
          }))
        });
      });
  }

  const AdditionalSettings = () => (
    <>
      <Toggle
        className='mt-2'
        text={<span className='text-sm text-gray-700'>Include comparison data.</span>}
        checked={includeComparisonDataConfig}
        onChange={() => setIncludeComparisonDataConfig(!includeComparisonDataConfig)}
      />
      <Toggle
        className='mt-2'
        text={<span className='text-sm text-gray-700'>Include settings dropdown (on hover of card).</span>}
        checked={includeSettingsDropdownConfig}
        onChange={() => setIncludeSettingsDropdownConfig(!includeSettingsDropdownConfig)}
      />
      {/* <Toggle
        className='mt-2'
        text={<span className='text-sm text-gray-700'>Hide axis.</span>}
        checked={hideAxisConfig}
        onChange={() => setHideAxisConfig(!hideAxisConfig)}
      /> */}
    </>
  )

  const onSave = componentConfiguration => {
    onSaveClick({
      include_comparison: includeComparisonDataConfig,
      include_settings_dropdown: includeSettingsDropdownConfig,
      // hide_axis: hideAxisConfig,
      ...componentConfiguration
    })
  }

  return (
    <ConfigurationModal
      type='Line Chart'
      includeCalculationsDropdown={false}
      includePropertiesDropdown={false}
      onSave={onSave}
      previewDashboardComponent={title => (
        <LineChartWithValue
          includeSettingsDropdown={includeSettingsDropdownConfig}
          includeComparisonData={includeComparisonDataConfig}
          includeCard={true}
          previousValue={timeseriesData?.previousValue}
          previousValueDate={timeseriesData?.previousValueDate}
          showAxis={!hideAxisConfig}
          timeseries={timeseriesData?.timeseries}
          title={title}
          value={timeseriesData?.value}
        />
      )}
      AdditionalSettings={<AdditionalSettings />}
      onConfigurationChange={config => { onConfigurationChange({ ...config, includeComparisonData: includeComparisonDataConfig }) }}
    />
  )
}