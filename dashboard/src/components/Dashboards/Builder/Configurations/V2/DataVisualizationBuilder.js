import AdvancedSettingsSection from '@/components/Dashboards/Builder/Configurations/AdvancedSettingsSection';
import { Card } from '@/components/ui/card';
import ChartTypeSelector from './ChartTypeSelector';
import { Input } from '@/components/ui/input';
import QueryBuilder from './QueryBuilder';
import { useEffect, useState } from 'react'

import ComponentPreviewer from './DataVisualizationPreviewer';
import BarChartDashboardComponent from '../../../DataVisualizations/RenderingEngines/BarChart';
import BarListDashboardComponent from '../../../DataVisualizations/RenderingEngines/BarList';
import AreaChartRenderingEngine from '../../../DataVisualizations/RenderingEngines/AreaChart';
import PieChartDashboardComponent from '../../../DataVisualizations/RenderingEngines/PieChart';
import ValueCardRenderingEngine from '../../../DataVisualizations/RenderingEngines/ValueCard';

import BarChartAdditionalSettings from './AdditionalSettings/BarChart';
import AreaChartAdditionalSettings from './AdditionalSettings/AreaChart';
import ValueCardAdditionalSettings from './AdditionalSettings/ValueCard';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

const COMPONENT_RENDERING_ENGINE_DICT = {
  AreaChart: AreaChartRenderingEngine,
  BarChart: BarChartDashboardComponent,
  BarList: BarListDashboardComponent,
  PieChart: PieChartDashboardComponent,
  ValueCard: ValueCardRenderingEngine,
}

const ADDITIONAL_SETTINGS_DICT = {
  AreaChart: AreaChartAdditionalSettings,
  BarChart: BarChartAdditionalSettings,
  BarList: BarChartAdditionalSettings,
  PieChart: BarChartAdditionalSettings,
  ValueCard: ValueCardAdditionalSettings,
}

export default function DataVisualizationBuilder({
  componentType: initialComponentType = 'BarChart',
  config,
  displayDataVisualizationTypeSelector = true,
  includePropertiesDropdown = true,
  includeUserProperties = true,
  isLoading,
  onConfigChange,
  onDataVisualizationTypeChange,
  onSave,
}) {
  const [componentType, setComponentType] = useState(initialComponentType);
  const [errorMessage, setErrorMessage] = useState();

  const saveComponent = e => {
    e.preventDefault();
    setErrorMessage('');
    const { title } = config;
    if (!title) {
      setErrorMessage('Enter a title for the component.');
    } else {
      onSave();
    }
  }

  useEffect(() => {
    onDataVisualizationTypeChange(componentType);
  }, [componentType])

  const updateConfig = newConfig => {
    onConfigChange({ ...config, ...newConfig });
  }

  const sanitizedWhereClauseGroups = (config.whereClauseGroups || [{}]).map(group => {
    const completedQueries = (group.queries || []).filter(query => query.property && query.operator && (query.value || ['is_defined', 'is_not_defined'].includes(query.operator)));
    return { ...group, queries: completedQueries };
  })

  const AdditionalSettingsForSelectedComponentType = ADDITIONAL_SETTINGS_DICT[componentType];
  const RenderingEngineForSelectedComponentType = COMPONENT_RENDERING_ENGINE_DICT[componentType];

  return (
    <>
      {displayDataVisualizationTypeSelector && (
        <ChartTypeSelector
          className='mb-2'
          selected={componentType}
          setSelected={setComponentType}
        />
      )}
      <form onSubmit={saveComponent}>
        <Card className='p-6 mb-2'>
          <Input
            id='title'
            className='w-1/2'
            placeholder='Title *'
            value={config.title}
            onChange={e => updateConfig({ title: e.target.value })}
          />
          <Input
            id='subtitle'
            className='w-3/4 mt-1'
            placeholder='Subtitle'
            value={config.subtitle}
            onChange={e => updateConfig({ subtitle: e.target.value })}
          />
          <QueryBuilder
            config={config}
            includePropertiesDropdown={includePropertiesDropdown}
            includeUserProperties={includeUserProperties}
            onConfigChange={updateConfig}
            propertyIsRequired={componentType === 'BarChart' || !['count', 'users', 'organizations'].includes(config.aggregationMethod)}
          />
          <AdvancedSettingsSection
            className='mb-2'
            includeDataSourceSelector={false}
            selectedDataSource='all'
          >
            {AdditionalSettingsForSelectedComponentType
              ? (
                <AdditionalSettingsForSelectedComponentType
                  onConfigChange={newConfig => updateConfig(newConfig)}
                  {...config}
                />
              ) : <></>
            }
          </AdvancedSettingsSection>
        </Card>
        <ComponentPreviewer
          {...config}
          className={componentType === 'ValueCard' ? 'py-12 px-72' : ''}
          ComponentRenderingEngine={RenderingEngineForSelectedComponentType}
          includeCard={componentType === 'ValueCard'}
          propertyIsRequired={componentType === 'BarChart' || !['count', 'users', 'organizations'].includes(config.aggregationMethod)}
          whereClauseGroups={sanitizedWhereClauseGroups}
        />
        <div className='border-t border-gray-200 py-4 mt-4'>
          {errorMessage && <p className='text-red-500 text-sm font-medium text-center mb-2'>{errorMessage}</p>}
          <div className='flex justify-end'>
            <Button variant='swishjam' type='submit' disabled={isLoading}>
              {isLoading && <LoadingSpinner center={true} color='white' />}
              {!isLoading && 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}