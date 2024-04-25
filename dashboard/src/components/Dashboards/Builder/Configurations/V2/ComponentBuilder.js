import AdvancedSettingsSection from '@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection';
import { Input } from '@/components/ui/input';
import QueryBuilder from './QueryBuilder';
import { useState } from 'react'

import ChartTypeSelector from './ChartTypeSelector';
import BarChartDashboardComponent from '../../RenderingEngines/BarChart';
import BarListDashboardComponent from '../../RenderingEngines/BarList';
import LineChartRenderingEngine from '../../RenderingEngines/LineChart';
import PieChartDashboardComponent from '../../RenderingEngines/PieChart';
import ValueCardRenderingEngine from '../../RenderingEngines/ValueCard';
import BarChartBuilder from './Previewers/BarChartPreviewer';
import BlurIfScrollable from '@/components/utils/BlurIfScrollable';

const COMPONENT_PREVIEW_DICT = {
  BarChart: BarChartBuilder,
  BarList: BarChartBuilder,
  LineChart: BarChartBuilder,
  PieChart: BarChartBuilder,
  ValueCard: BarChartBuilder,
}

export default function ComponentBuilder({
  AdditionalSettings = <></>,
  configuration = {},
  operatorOptions = ['count', 'sum', 'avg', 'min', 'max'],
  chartTypeSelector = true,
  includeOperatorsDropdown,
  includePropertiesDropdown = true,
  includeUserProperties = true,
  onConfigurationChange,
  onFormSubmit,
}) {
  const [componentType, setComponentType] = useState('BarChart');
  const [errorMessage, setErrorMessage] = useState();

  const updateConfiguration = newConfig => {
    onConfigurationChange({ ...configuration, ...newConfig });
  }

  const SelectedComponentPreview = COMPONENT_PREVIEW_DICT[componentType];

  return (
    <form onSubmit={onFormSubmit}>
      {chartTypeSelector && (
        <ChartTypeSelector
          className='mb-2'
          selected={componentType}
          setSelected={setComponentType}
        />
      )}
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
        operatorOptions={includeOperatorsDropdown ? operatorOptions : []}
        dataSource={configuration.dataSource}
        includePropertiesDropdown={includePropertiesDropdown}
        includeUserProperties={includeUserProperties}
        onConfigurationChange={updateConfiguration}
      />
      <AdvancedSettingsSection
        className='mb-2'
        selectedDataSource={configuration.dataSource}
        onDataSourceSelected={dataSource => updateConfiguration({ dataSource })}
      >
        {AdditionalSettings}
      </AdvancedSettingsSection>
      <SelectedComponentPreview
        {...configuration}
        whereClauseGroups={(configuration.whereClauseGroups || []).map(group => {
          const completedQueries = group.queries.filter(query => query.property && query.operator && (query.value || ['is_defined', 'is_not_defined'].includes(query.operator)));
          return { ...group, queries: completedQueries };
        })}
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