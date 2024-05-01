'use client'

import { ChartPieIcon, PencilSquareIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import DashboardNameDisplayEditor from "@/components/Dashboards/Builder/DashboardNameDisplayEditor";
import LoadingSpinner from "@/components/LoadingSpinner";
import DataVisualizationsDashboardCanvas from "@/components/Dashboards/Builder/DataVisualizationsDashboardCanvas";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import Timefilter from "@/components/Timefilter";
import { useEffect, useState, useRef } from "react";
import { swishjam } from "@swishjam/react";
import DataVisualizationLibrary from "@/components/Dashboards/DataVisualizations/DataVisualizationLibrary";
import { toast } from "sonner";

const AUTO_SAVE_CHECK_INTERVAL = 2_500;
const DEFAULT_GRID_CONFIGURATIONS = {
  BarChart: { w: 2, h: 16, y: 0, x: 0, minH: 6, minW: 2 },
  BarList: { w: 2, h: 16, y: 0, x: 0, minH: 8, minW: 2 },
  AreaChart: { w: 2, h: 16, y: 0, x: 0, minH: 10, minW: 2 },
  PieChart: { w: 2, h: 10, y: 0, x: 0, minH: 10, minW: 2 },
  UserRetention: { w: 4, h: 24, y: 0, x: 0, minH: 24, maxH: 24, minW: 4 },
  ValueCard: { w: 1, h: 4, y: 0, x: 0, minH: 2, minW: 1 },
}

const EmptyState = ({ onClick }) => (
  <button
    type="button"
    className="relative block w-full h-[80vh] rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
    onClick={onClick}
  >
    <ChartPieIcon className="mx-auto h-16 w-16 text-gray-400" />
    <span className="mt-2 block text-md font-semibold text-gray-400">Add a data visualization.</span>
  </button>
)

export default function Dashboard({ params }) {
  const { id: dashboardId } = params;
  const [dataVisualizationLibraryIsOpen, setDataVisualizationLibraryIsOpen] = useState(false);
  const [currentTimeframe, setCurrentTimeframe] = useState('seven_days');
  const [dashboardDataVisualizations, setDashboardDataVisualizations] = useState();
  const [dashboardName, setDashboardName] = useState();
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDashboardLayoutUpdates, setPendingDashboardLayoutUpdates] = useState([]);

  const detectChangedDashboardDataVisualizationsFromLayoutAndSave = layout => {
    const changedDashboardDataVisualizations = dashboardDataVisualizations.map(dashboardDataVisualization => {
      const layoutItemForDashboardDataVisualization = layout.find(({ i }) => i === dashboardDataVisualization.id);
      if (!layoutItemForDashboardDataVisualization) return;
      if (
        layoutItemForDashboardDataVisualization.x !== dashboardDataVisualization.position_config.x ||
        layoutItemForDashboardDataVisualization.y !== dashboardDataVisualization.position_config.y ||
        layoutItemForDashboardDataVisualization.w !== dashboardDataVisualization.position_config.w ||
        layoutItemForDashboardDataVisualization.h !== dashboardDataVisualization.position_config.h
      ) {
        console.log("CHANGED!", {
          ...dashboardDataVisualization,
          position_config: {
            ...dashboardDataVisualization.position_config,
            x: layoutItemForDashboardDataVisualization.x,
            y: layoutItemForDashboardDataVisualization.y,
            w: layoutItemForDashboardDataVisualization.w,
            h: layoutItemForDashboardDataVisualization.h
          }
        })
        return {
          ...dashboardDataVisualization,
          position_config: {
            ...dashboardDataVisualization.position_config,
            x: layoutItemForDashboardDataVisualization.x,
            y: layoutItemForDashboardDataVisualization.y,
            w: layoutItemForDashboardDataVisualization.w,
            h: layoutItemForDashboardDataVisualization.h
          }
        }
      }
    }).filter(Boolean);
    const pendingDashboardUpdatesNotInThisChange = pendingDashboardLayoutUpdates.filter(dashboardDataVisualizationWithPendingUpdates => changedDashboardDataVisualizations.includes(({ id }) => id === dashboardDataVisualizationWithPendingUpdates.id));
    setPendingDashboardLayoutUpdates([...pendingDashboardUpdatesNotInThisChange, ...changedDashboardDataVisualizations]);
  }

  const updateDashboardDataVisualizations = async dashboardDataVisualizations => {
    const formattedDashboardDataVisualizations = dashboardDataVisualizations.map(({ id, position_config }) => ({ id, position_config }));
    setIsSaving(true);
    return SwishjamAPI.DashboardDataVizualizations.bulkUpdate(dashboardId, formattedDashboardDataVisualizations).then(({ errors }) => {
      setIsSaving(false);
      if (errors) {

      }
    })
  }

  const addDataVisualizationToDashboard = async dataVisualization => {
    const response = await SwishjamAPI.DashboardDataVizualizations.create(dashboardId, dataVisualization.id, DEFAULT_GRID_CONFIGURATIONS[dataVisualization.visualization_type])
    if (response.error) {
      toast.error('Error adding visualization to dashboard', {
        description: response.error,
        duration: 15_000,
      })
    } else {
      setDashboardDataVisualizations([...dashboardDataVisualizations, response]);
    }
  }

  const pendingDashboardLayoutUpdatesRef = useRef(pendingDashboardLayoutUpdates);

  const savePendingDashboardLayoutUpdatesIfNecessary = () => {
    if (pendingDashboardLayoutUpdatesRef.current.length > 0) {
      updateDashboardDataVisualizations(pendingDashboardLayoutUpdatesRef.current).then(() => setPendingDashboardLayoutUpdates([]));
    }
  }

  useEffect(() => {
    pendingDashboardLayoutUpdatesRef.current = pendingDashboardLayoutUpdates; // needed in order to access within the autosave setInterval
  }, [pendingDashboardLayoutUpdates]);

  useEffect(() => {
    SwishjamAPI.Dashboards.retrieve(dashboardId).then(({ name }) => setDashboardName(name));
    SwishjamAPI.DashboardDataVizualizations.list(dashboardId).then(setDashboardDataVisualizations);
    const saveHotKeyListener = window.addEventListener('keydown', event => {
      if (event.metaKey && event.key === 's') {
        event.preventDefault();
        toast.info('Swishjam Dashboards are auto-saved.', {
          description: 'No need to manually save your changes!',
          duration: 10_000,
        })
      }
    });
    const autoSaveInterval = setInterval(() => savePendingDashboardLayoutUpdatesIfNecessary(), AUTO_SAVE_CHECK_INTERVAL);
    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('keydown', saveHotKeyListener);
    }
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <DataVisualizationLibrary
        isOpen={dataVisualizationLibraryIsOpen}
        onClose={() => setDataVisualizationLibraryIsOpen(false)}
        onDataVisualizationSelected={dataVisualization => {
          setDataVisualizationLibraryIsOpen(false);
          addDataVisualizationToDashboard(dataVisualization);
        }}
      />
      <div className='grid grid-cols-2 mt-8 items-center'>
        <div>
          {dashboardName === undefined
            ? <Skeleton className='h-12 w-40' />
            : <DashboardNameDisplayEditor
              dashboardName={dashboardName || 'Untitled Dashboard'}
              onDashboardNameSave={newDashboardName => {
                if (newDashboardName === dashboardName) return;
                setDashboardName(newDashboardName)
                SwishjamAPI.Dashboards.update(dashboardId, { name: newDashboardName })
              }}
            />
          }
        </div>
        <div className='flex items-center justify-end'>
          {isInEditMode
            ? (
              <>
                {isSaving && (
                  <span className='text-xs text-gray-400 inline-flex items-center'>
                    Saving changes...
                    <LoadingSpinner center={true} color='gray-400' className='h-1 w-1 mx-1 inline-block' />
                  </span>
                )}
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
                  onClick={() => {
                    swishjam.event('data_visualization_library_modal_opened')
                    setDataVisualizationLibraryIsOpen(true)
                  }}
                >
                  Add Visualization <PlusCircleIcon className='h-4 w-4 ml-1' />
                </button>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
                  onClick={() => {
                    setIsInEditMode(false);
                    savePendingDashboardLayoutUpdatesIfNecessary();
                  }}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <Timefilter selection={currentTimeframe} onSelection={setCurrentTimeframe} />
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
                  onClick={() => setIsInEditMode(true)}
                >
                  Edit <PencilSquareIcon className='h-4 w-4 ml-1' />
                </button>
              </>
            )
          }
        </div>
      </div>
      <div className="mt-8">
        {dashboardDataVisualizations
          ? dashboardDataVisualizations.length > 0
            ? (
              <DataVisualizationsDashboardCanvas
                dashboardDataVisualizations={dashboardDataVisualizations}
                timeframe={currentTimeframe}
                onLayoutChange={detectChangedDashboardDataVisualizationsFromLayoutAndSave}
                editable={isInEditMode}
                onDataVisualizationDelete={id => {
                  setDashboardDataVisualizations(dashboardDataVisualizations.filter(({ id: dashboardDataVisualizations }) => dashboardDataVisualizations !== id));
                  SwishjamAPI.DashboardDataVizualizations.delete(dashboardId, id);
                }}
              />
            ) : (
              <EmptyState
                onClick={() => {
                  swishjam.event('data_visualization_library_modal_opened')
                  setDataVisualizationLibraryIsOpen(true)
                }}
              />
            )
          : <Skeleton className='h-96' />
        }
      </div>
    </main>
  )
}