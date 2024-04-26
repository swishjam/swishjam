import AdvancedSettingsSection from '@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection';
import { Card } from '@/components/ui/card';
import ChartTypeSelector from './ChartTypeSelector';
import { Input } from '@/components/ui/input';
import QueryBuilder from './QueryBuilder';
import { useEffect, useState } from 'react'

import ComponentPreviewer from './ComponentPreviewer';
import BarChartDashboardComponent from '../../RenderingEngines/BarChart';
import BarListDashboardComponent from '../../RenderingEngines/BarList';
import LineChartRenderingEngine from '../../RenderingEngines/LineChart';
import PieChartDashboardComponent from '../../RenderingEngines/PieChart';
import ValueCardRenderingEngine from '../../RenderingEngines/ValueCard';

import BarChartAdditionalSettings from './AdditionalSettings/BarChart';

const COMPONENT_RENDERING_ENGINE_DICT = {
  BarChart: BarChartDashboardComponent,
  BarList: BarListDashboardComponent,
  LineChart: LineChartRenderingEngine,
  PieChart: PieChartDashboardComponent,
  ValueCard: ValueCardRenderingEngine,
}

const ADDITIONAL_SETTINGS_DICT = {
  BarChart: BarChartAdditionalSettings,
  BarList: BarChartAdditionalSettings,
  LineChart: BarChartAdditionalSettings,
  PieChart: BarChartAdditionalSettings,
  ValueCard: BarChartAdditionalSettings,
}

export default function ComponentBuilder({
  configuration,
  chartTypeSelector = true,
  includePropertiesDropdown = true,
  includeUserProperties = true,
  onConfigurationChange,
  onComponentTypeChange,
  onFormSubmit,
}) {
  const [componentType, setComponentType] = useState('BarChart');
  const [errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    onComponentTypeChange(componentType);
  }, [componentType])

  const updateConfiguration = newConfig => {
    onConfigurationChange({ ...configuration, ...newConfig });
  }

  const sanitizedWhereClauseGroups = (configuration.whereClauseGroups || [{}]).map(group => {
    const completedQueries = (group.queries || []).filter(query => query.property && query.operator && (query.value || ['is_defined', 'is_not_defined'].includes(query.operator)));
    return { ...group, queries: completedQueries };
  })

  const AdditionalSettingsForSelectedComponentType = ADDITIONAL_SETTINGS_DICT[componentType];
  const RenderingEngineForSelectedComponentType = COMPONENT_RENDERING_ENGINE_DICT[componentType];

  return (
    <form onSubmit={onFormSubmit}>
      {chartTypeSelector && (
        <ChartTypeSelector
          className='mb-2'
          selected={componentType}
          setSelected={setComponentType}
        />
      )}
      <Card className='p-6 mb-2'>
        <Input
          id='title'
          className='w-1/2'
          placeholder='Title *'
          value={configuration.title}
          onChange={e => updateConfiguration({ title: e.target.value })}
        />
        <Input
          id='subtitle'
          className='w-3/4 mt-1'
          placeholder='Subtitle'
          value={configuration.subtitle}
          onChange={e => updateConfiguration({ subtitle: e.target.value })}
        />
        <QueryBuilder
          configuration={configuration}
          includePropertiesDropdown={includePropertiesDropdown}
          includeUserProperties={includeUserProperties}
          onConfigurationChange={updateConfiguration}
        />
        <AdvancedSettingsSection
          className='mb-2'
          includeDataSourceSelector={false}
          selectedDataSource='all'
        >
          {AdditionalSettingsForSelectedComponentType
            ? (
              <AdditionalSettingsForSelectedComponentType
                onConfigurationChange={newConfig => updateConfiguration(newConfig)}
                {...configuration}
              />
            ) : <></>
          }
        </AdvancedSettingsSection>
      </Card>
      <ComponentPreviewer
        {...configuration}
        ComponentRenderingEngine={RenderingEngineForSelectedComponentType}
        whereClauseGroups={sanitizedWhereClauseGroups}
      />
      <div className='border-t border-gray-200 py-4 mt-4'>
        {errorMessage && <p className='text-red-500 text-sm mb-2'>{errorMessage}</p>}
        <div className='flex justify-end'>
          <button
            className='ml-2 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
            type='submit'
          >
            Save
          </button>
        </div>
      </div>
    </form>
  )
}