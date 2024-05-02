import AdvancedSettingsSection from '@/components/Dashboards/Configurations/AdvancedSettingsSection';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import QueryBuilder from './QueryBuilder';
import { useEffect, useState } from 'react'
import VisualizationTypeSelector from './VisualizationTypeSelector';
import DataVisualizationPreviewer from './DataVisualizationPreviewer';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

import BarChartAdditionalSettings from './AdditionalSettings/BarChart';
import AreaChartAdditionalSettings from './AdditionalSettings/AreaChart';
import ValueCardAdditionalSettings from './AdditionalSettings/ValueCard';
import PieChartAdditionalSettings from './AdditionalSettings/PieChart';

const ADDITIONAL_SETTINGS_DICT = {
  AreaChart: AreaChartAdditionalSettings,
  BarChart: BarChartAdditionalSettings,
  BarList: BarChartAdditionalSettings,
  PieChart: PieChartAdditionalSettings,
  ValueCard: ValueCardAdditionalSettings,
}

export default function DataVisualizationBuilder({
  visualizationType: initialComponentType = 'BarChart',
  config,
  includePropertiesDropdown = true,
  includeUserProperties = true,
  isLoading,
  onConfigChange,
  onDataVisualizationTypeChange,
  onSave,
}) {
  const [visualizationType, setVisualizationType] = useState(initialComponentType);
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
    onDataVisualizationTypeChange(visualizationType);
  }, [visualizationType])

  const updateConfig = newConfig => {
    onConfigChange({ ...config, ...newConfig });
  }

  const sanitizedWhereClauseGroups = (config.whereClauseGroups || [{}]).map(group => {
    const completedQueries = (group.queries || []).filter(query => query.property && query.operator && (query.value || ['is_defined', 'is_not_defined'].includes(query.operator)));
    return { ...group, queries: completedQueries };
  })

  const AdditionalSettingsForSelectedComponentType = ADDITIONAL_SETTINGS_DICT[visualizationType];

  return (
    <>
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
            propertyIsRequired={['BarChart', 'PieChart'].includes(visualizationType) || !['count', 'users', 'organizations'].includes(config.aggregationMethod)}
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
        <Card className={visualizationType === 'ValueCard' ? 'h-[40vh] py-12 px-44' : 'h-[80vh]'}>
          <DataVisualizationPreviewer
            {...config}
            visualizationType={visualizationType}
            whereClauseGroups={sanitizedWhereClauseGroups}
            includeSettingsDropdown={false}
            onlyDisplayHeaderActionsOnHover={false}
            AdditionalHeaderActions={<VisualizationTypeSelector selected={visualizationType} setSelected={setVisualizationType} />}
          />
        </Card>
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