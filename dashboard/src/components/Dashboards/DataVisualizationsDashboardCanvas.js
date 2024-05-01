import { Card } from '@/components/ui/card';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { useMemo, useState } from 'react';
import DataVisualizationRenderingEngine from '../DataVisualizations/RenderingEngines/DataVisualizationRenderingEngine';
import { TrashIcon } from '@heroicons/react/24/outline';

const GRID_DIMENSION_LIMITATIONS = {
  BarChart: { minH: 12, minW: 2 },
  BarList: { minH: 8, minW: 2 },
  AreaChart: { minH: 12, minW: 2 },
  PieChart: { minH: 10, minW: 2 },
  UserRetention: { minH: 24, maxH: 24, minW: 3 },
  ValueCard: { minH: 4, minW: 1 },
}

export default function DataVisualizationsDashboardCanvas({
  dashboardDataVisualizations,
  editable,
  onDashboardDataVisualizationDelete = () => { },
  onLayoutChange = () => { },
  timeframe,
}) {
  const [currentlyMovingGridItemData, setCurrentlyMovingGridItemData] = useState({ id: null });
  const ResponsiveGridLayout = useMemo(() => WidthProvider(ReactGridLayout), []);
  // the grid layout hangs when not given in this format
  const sanitizedLayout = dashboardDataVisualizations.map(({ i, position_config, data_visualization }) => ({
    i, maxW: 8, ...position_config, ...GRID_DIMENSION_LIMITATIONS[data_visualization.visualization_type]
  }));
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
        cols={4}
        // cols={{ lg: 8, md: 6, sm: 4, xs: 2 }}
        isDraggable={editable}
        isResizable={editable}
        layout={sanitizedLayout}
        onDrag={(_l, _i, d) => setCurrentlyMovingGridItemData({ id: d.i, ...d, isDragging: true })}
        onDragStop={() => setCurrentlyMovingGridItemData({ id: null })}
        onLayoutChange={onLayoutChange}
        onResize={(_l, _i, d) => setCurrentlyMovingGridItemData({ id: d.i, ...d, isResizing: true })}
        onResizeStop={() => setCurrentlyMovingGridItemData({ id: null })}
        resizeHandles={['sw', 'nw', 'se', 'ne']}
        // resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
        rowHeight={30}
      >
        {dashboardDataVisualizations.map(({ i, data_visualization }) => {
          return (
            <Card key={i} className={`relative transition duration-500 ${editable ? 'cursor-grab hover:bg-gray-50' : ''}`}>
              {i === currentlyMovingGridItemData.id && (
                <div className='shadow-lg absolute p-1 text-xs top-5 right-5 bg-gray-200 border-gray-400 text-gray-700 font-mono z-50 rounded-sm flex flex-col justify-center'>
                  <div>x: {currentlyMovingGridItemData.x}</div>
                  <div>y: {currentlyMovingGridItemData.y}</div>
                  <div>w: {currentlyMovingGridItemData.w}</div>
                  <div>h: {currentlyMovingGridItemData.h}</div>
                </div>
              )}
              <DataVisualizationRenderingEngine
                includeCard={false}
                type={data_visualization.visualization_type}
                title={data_visualization.title}
                subtitle={data_visualization.subtitle}
                dataVisualizationId={data_visualization.id}
                {...data_visualization.config}
                timeframe={timeframe}
                includeSettingsDropdown={editable ? false : data_visualization.config.includeSettingsDropdown}
                isEnlargable={editable ? false : data_visualization.config.isEnlargable}
                onDelete={() => onDashboardDataVisualizationDelete(i)}
                AdditionalHeaderActions={editable ? (
                  <button
                    onClick={() => onDashboardDataVisualizationDelete(i)}
                    className='p-2 flex items-center justify-center outline-0 ring-0 duration-300 transition text-gray-500 cursor-pointer  rounded-md hover:bg-gray-100 hover:text-red-500'
                  >
                    <TrashIcon className='h-4 w-4' />
                  </button>
                ) : <></>}
              />
            </Card>
          )
        })}
      </ResponsiveGridLayout>
    </div>
  )
}