import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@radix-ui/react-icons";
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
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from "react";
import ValueCard from "@/components/DataVisualizations/ValueCard";

export default function PieChartConfiguration({ onConfigurationSave = () => { } }) {
  const [valueCardValue, setValueCardValue] = useState();
  const [valueCardPreviousValue, setValueCardPreviousValue] = useState();
  const [valueFormatterConfig, setValueFormatterConfig] = useState('number');

  const onConfigurationChange = ({ eventName, propertyName, calculation, dataSource }) => {
    setValueCardValue();
    setValueCardPreviousValue();
    if (!eventName || !calculation) {
      return;
    } else if (calculation === 'count') {
      SwishjamAPI.Events.count(eventName, { dataSource }).then(({ count, comparison_count }) => {
        setValueCardValue(count);
        setValueCardPreviousValue(comparison_count);
      });
      // the remaining calculation all require a property name
    } else if (propertyName) {
      switch (calculation) {
        case 'sum':
          SwishjamAPI.Events.Properties.sum(eventName, propertyName, { dataSource }).then(({ sum, comparison_sum }) => {
            setValueCardValue(sum);
            setValueCardPreviousValue(comparison_sum);
          });
          break;
        case 'average':
          SwishjamAPI.Events.Properties.average(eventName, propertyName, { dataSource }).then(({ average, comparison_average }) => {
            setValueCardValue(average);
            setValueCardPreviousValue(comparison_average);
          });
          break;
        case 'max':
          SwishjamAPI.Events.Properties.maximum(eventName, propertyName, { dataSource }).then(({ maximum, comparison_maximum }) => {
            setValueCardValue(maximum);
            setValueCardPreviousValue(comparison_maximum);
          });
          break;
        case 'min':
          SwishjamAPI.Events.Properties.minimum(eventName, propertyName, { dataSource }).then(({ minimum, comparison_minimum }) => {
            setValueCardValue(minimum);
            setValueCardPreviousValue(comparison_minimum);
          });
          break;
        default:
          break;
      }
    }
  }

  const AdditionalSettings = () => (
    <>
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

  return (
    <ConfigurationModal
      AdditionalSettings={<AdditionalSettings />}
      title='Value Card Configuration'
      calculationOptions={['count', 'sum', 'average', 'max', 'min']}
      type='Value Card'
      includeCalculationsDropdown={true}
      includePropertiesDropdown={true}
      onSave={configuration => onConfigurationSave({ ...configuration, value_formatter: valueFormatterConfig })}
      previewDashboardComponent={(title, subtitle) => (
        <ValueCard
          title={title}
          subtitle={subtitle}
          value={valueCardValue}
          previousValue={valueCardPreviousValue}
          valueFormatter={value => {
            try {
              if (valueFormatterConfig === 'currency') {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value) / 100)
              } else if (valueFormatterConfig === 'percent') {
                return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value)
              } else if (valueFormatterConfig === 'number') {
                return parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 2 })
              } else {
                return value
              }
            } catch (error) {
              return value
            }
          }}
        />
      )}
      onConfigurationChange={onConfigurationChange}
    />
  )
}