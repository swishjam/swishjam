
import BarList from '@/components/Dashboards/Builder/RenderingEngines/BarList';
import BarChart from '@/components/Dashboards/Builder/RenderingEngines/BarChart';
import { Card } from '@/components/ui/card';
import ContextMenuableComponent from '@/components/Dashboards/Builder/DashboardComponentContextMenu';
import EventsByUserList from '@/components/Dashboards/Builder/RenderingEngines/EventsByUserList';
import LineChart from '@/components/Dashboards/Builder/RenderingEngines/LineChart';
import PieChart from '@/components/Dashboards/Builder/RenderingEngines/PieChart';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import UserRetention from '@/components/Dashboards/Builder/RenderingEngines/RetentionWidget';
import { useMemo } from 'react';
import ValueCard from '@/components/Dashboards/Builder/RenderingEngines/ValueCard';

const RENDERING_ENGINE_DASHBOARD_COMPONENT_FOR_CONFIGURATION_TYPE = {
  BarList,
  BarChart,
  EventsByUserList,
  LineChart,
  PieChart,
  ValueCard,
  UserRetention,
}

export default function RenderingEngine({
  components,
  timeframe,
  editable,
  onDashboardComponentEdit = () => { },
  onDashboardComponentDelete = () => { },
  onDashboardComponentDuplicate = () => { },
  onLayoutChange = () => { }
}) {
  const ResponsiveGridLayout = useMemo(() => WidthProvider(ReactGridLayout), []);
  // the grid layout hangs when not given in this format
  const sanitizedLayout = components.map(({ i, configuration }) => ({ i, ...configuration }));
  return (
    <ResponsiveGridLayout
      className={editable ? 'border-2 border-gray-400 border-dashed rounded' : ''}
      layout={sanitizedLayout}
      cols={30}
      rowHeight={10}
      width={1200}
      onLayoutChange={onLayoutChange}
      isDraggable={editable}
      isResizable={editable}
    >
      {components.map(({ i, configuration }) => {
        const RenderingEngineDashboardComponent = RENDERING_ENGINE_DASHBOARD_COMPONENT_FOR_CONFIGURATION_TYPE[configuration.type];
        if (!RenderingEngineDashboardComponent) {
          throw Error(`Unrecognized configuration.type provided to Dashboard RenderingEngine: ${configuration.type}`);
        }
        // retention grid should scroll, BarChart has a tooltip that often overflows :/
        const allowOverflow = ['UserRetention', 'BarChart'].includes(configuration.type);
        return (
          // All RenderingEngineDashboardComponents re-fetch its data each time editable switches and we use the prop below, disabling until we solve it.
          <Card key={i} className={`p-4 ${false ? 'cursor-grab' : ''} ${allowOverflow ? '' : 'overflow-hidden'}`}>
            <ContextMenuableComponent
              isTriggerable={true}
              onEdit={() => onDashboardComponentEdit({ id: configuration.i, configuration })}
              onDelete={() => onDashboardComponentDelete(i)}
              onDuplicate={() => onDashboardComponentDuplicate({ id: configuration.i, configuration })}
            >
              <RenderingEngineDashboardComponent
                // title={configuration.title}
                // event={configuration.event}
                // property={configuration.property}
                // calculation={configuration.calculation}
                // dataSource={configuration.dataSource || 'all'}
                configuration={configuration}
                timeframe={timeframe}
              />
            </ContextMenuableComponent>
          </Card>
        )
      })}
    </ResponsiveGridLayout>
  )
}