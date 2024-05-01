import { Button } from "@/components/ui/button"
import ConfigurationModal from "./ConfigurationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LineChartWithValue from "@/components/DataVisualizations/AreaChartWithValue";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import Toggle from "@/components/utils/Toggle";
import { useState } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

export default function LineChartConfiguration({ onConfigurationSave = () => { } }) {
  const [hideAxisConfig, setHideAxisConfig] = useState(false);
  const [includeSettingsDropdownConfig, setIncludeSettingsDropdownConfig] = useState(true);
  const [includeComparisonDataConfig, setIncludeComparisonDataConfig] = useState(true);
  const [timeseriesData, setTimeseriesData] = useState();
  const [valueFormatterConfig, setValueFormatterConfig] = useState('number');

  const getTimeseriesData = ({ eventName, propertyName, calculation, dataSource, includeComparisonData }) => {
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
      }
    );
  }

  const onConfigurationChange = ({ eventName, propertyName, calculation, dataSource, includeComparisonData }) => {
    setTimeseriesData();
    if (!eventName || !calculation) {
      return;
    } else if (calculation === 'count') {
      getTimeseriesData({ eventName, calculation, dataSource, includeComparisonData });
      // the remaining calculation all require a property name
    } else if (propertyName) {
      getTimeseriesData({ eventName, propertyName, calculation, dataSource, includeComparisonData });
    }
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
      <div className='flex items-center gap-x-2'>
        <div className='mt-2 text-sm text-gray-700'>Value formatter.</div>
        <div className='mt-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className='font-normal text-gray-700'>
                {valueFormatterConfig[0].toUpperCase() + valueFormatterConfig.slice(1)}
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit">
              <DropdownMenuLabel>Value Formatter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={valueFormatterConfig} onValueChange={setValueFormatterConfig}>
                <DropdownMenuRadioItem
                  value="number"
                  className='hover:bg-gray-100 cursor-pointer'
                >
                  Number (2,000)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="currency"
                  className='hover:bg-gray-100 cursor-pointer'
                >
                  Currency ($20)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="percent"
                  className='hover:bg-gray-100 cursor-pointer'
                >
                  Percent (20%)
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )

  const onSave = componentConfiguration => {
    onConfigurationSave({
      include_comparison: includeComparisonDataConfig,
      include_settings_dropdown: includeSettingsDropdownConfig,
      value_formatter: valueFormatterConfig,
      // hide_axis: hideAxisConfig,
      ...componentConfiguration
    })
  }

  return (
    <ConfigurationModal
      calculationOptions={['count', 'sum', 'avg', 'min', 'max']}
      type='Line Chart'
      includeCalculationsDropdown={true}
      includePropertiesDropdown={true}
      onSave={onSave}
      previewDashboardComponent={(title, subtitle) => (
        <LineChartWithValue
          includeSettingsDropdown={includeSettingsDropdownConfig}
          includeComparisonData={includeComparisonDataConfig}
          includeCard={true}
          previousValue={timeseriesData?.previousValue}
          previousValueDate={timeseriesData?.previousValueDate}
          showAxis={!hideAxisConfig}
          data={timeseriesData?.timeseries}
          title={title}
          subtitle={subtitle}
          value={timeseriesData?.value}
          valueFormatter={val => {
            try {
              if (valueFormatterConfig === 'currency') {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(val) / 100)
              } else if (valueFormatterConfig === 'percent') {
                return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(val)
              } else if (valueFormatterConfig === 'number') {
                return parseFloat(val).toLocaleString('en-US', { maximumFractionDigits: 2 })
              } else {
                return val
              }
            } catch (error) {
              return val
            }
          }}
        />
      )}
      AdditionalSettings={<AdditionalSettings />}
      onConfigurationChange={config => { onConfigurationChange({ ...config, includeComparisonData: includeComparisonDataConfig }) }}
    />
  )
}