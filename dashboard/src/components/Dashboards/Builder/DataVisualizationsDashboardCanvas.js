import { Card } from '@/components/ui/card';
import ContextMenuableComponent from '@/components/Dashboards/Builder/DashboardComponentContextMenu';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { useMemo, useState } from 'react';
import DataVisualizationRenderingEngine from '../DataVisualizations/RenderingEngines/DataVisualizationRenderingEngine';

export default function DataVisualizationsDashboardCanvas({
  dashboardDataVisualizations,
  timeframe,
  editable,
  onDataVisualizationDelete = () => { },
  onLayoutChange = () => { }
}) {
  const [currentlyMovingGridItemData, setCurrentlyMovingGridItemData] = useState({ id: null });
  const ResponsiveGridLayout = useMemo(() => WidthProvider(ReactGridLayout), []);
  // the grid layout hangs when not given in this format
  const sanitizedLayout = dashboardDataVisualizations.map(({ i, position_config }) => ({ i, ...position_config }));
  return (
    <div className='relative'>
      {currentlyMovingGridItemData.id && (
        <div className='absolute w-full h-full flex'>
          <div className='w-1/4 h-full border-r border-gray-400 border-dashed' />
          <div className='w-1/4 h-full border-r border-gray-400 border-dashed' />
          <div className='w-1/4 h-full border-r border-gray-400 border-dashed' />
        </div>
      )}
      <ResponsiveGridLayout
        className={editable ? 'border-2 border-gray-400 border-dashed rounded' : ''}
        layout={sanitizedLayout}
        cols={4}
        // cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={onLayoutChange}
        isDraggable={editable}
        isResizable={editable}
        onDrag={(_l, _i, d) => setCurrentlyMovingGridItemData({ id: d.i, ...d })}
        onDragStop={() => setCurrentlyMovingGridItemData({ id: null })}
        onResize={(_l, _i, d) => setCurrentlyMovingGridItemData({ id: d.i, ...d })}
        onResizeStop={() => setCurrentlyMovingGridItemData({ id: null })}
      >
        {dashboardDataVisualizations.map(({ i, data_visualization }) => {
          // retention grid should scroll, BarChart has a tooltip that often overflows :/
          const allowOverflow = ['UserRetention', 'BarChart'].includes(data_visualization.visualization_type);
          return (
            // All RenderingEngineDashboardComponents re-fetch its data each time editable switches and we use the prop below, disabling until we solve it.
            <Card key={i} className={`relative ${false ? 'cursor-grab' : ''} ${(allowOverflow || true) ? '' : 'overflow-hidden'}`}>
              {i === currentlyMovingGridItemData.id && (
                <div className='absolute p-1 text-xs top-5 right-5 bg-gray-200 text-gray-700 font-mono z-50 rounded-sm flex flex-col justify-center'>
                  <div>x: {currentlyMovingGridItemData.x}</div>
                  <div>y: {currentlyMovingGridItemData.y}</div>
                  <div>w: {currentlyMovingGridItemData.w}</div>
                  <div>h: {currentlyMovingGridItemData.h}</div>
                </div>
              )}
              <ContextMenuableComponent isTriggerable={true} onDelete={() => onDataVisualizationDelete(i)}>
                <DataVisualizationRenderingEngine
                  includeCard={false}
                  type={data_visualization.visualization_type}
                  title={data_visualization.title}
                  subtitle={data_visualization.subtitle}
                  dataVisualizationId={data_visualization.id}
                  {...data_visualization.config}
                  timeframe={timeframe}
                />
              </ContextMenuableComponent>
            </Card>
          )
        })}
      </ResponsiveGridLayout>
    </div>
  )
}