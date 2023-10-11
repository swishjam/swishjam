'use client'

import BarListConfiguration from "@/components/Dashboards/Builder/Configurations/BarList";
import { ChartPieIcon, PencilSquareIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import ComponentOptionsSlideout from "@/components/Dashboards/Builder/ComponentOptions/OptionsSlideout";
import DashboardNameDisplayEditor from "@/components/Dashboards/Builder/DashboardNameDisplayEditor";
import LineChartConfiguration from "@/components/Dashboards/Builder/Configurations/LineChart";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/utils/Modal";
import PieChartConfiguration from "@/components/Dashboards/Builder/Configurations/PieChart";
import RenderingEngine from "@/components/Dashboards/Builder/RenderingEngine";
import { Skeleton } from "@/components/ui/skeleton";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import Timefilter from "@/components/Timefilter";
import { useEffect, useState, useRef } from "react";
import ValueCardConfiguration from "@/components/Dashboards/Builder/Configurations/ValueCard";

const AUTO_SAVE_CHECK_INTERVAL = 2_500;
const DEFAULT_GRID_CONFIGURATIONS = {
  LineChart: { w: 15, h: 16, y: 0, x: 0, minH: 10, minW: 10 },
  PieChart: { w: 10, h: 10, y: 0, x: 0, minH: 10, minW: 10 },
  BarList: { w: 20, h: 15, y: 0, x: 0, minH: 8, minW: 10 },
  ValueCard: { w: 10, h: 6, y: 0, x: 0, minH: 6, minW: 8 },
  UserRetention: { w: 30, h: 24, y: 0, x: 0, minH: 24, maxH: 24, minW: 20 },
}

const ConfigureDashboardComponentModal = ({ componentType, eventOptions, onSave, onClose }) => {
  const ConfigurationComponent = {
    LineChart: LineChartConfiguration,
    PieChart: PieChartConfiguration,
    BarList: BarListConfiguration,
    ValueCard: ValueCardConfiguration
  }[componentType];
  return (
    <Modal onClose={onClose} isOpen={true} closeOnBackdropClick={false} size="x-large">
      <ConfigurationComponent eventOptions={eventOptions} onSaveClick={onSave} />
    </Modal>
  )
}

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
    <div className='grid grid-cols-2 mt-8 flex items-center'>
      <div>
        <Skeleton className='h-12 w-40' />
      </div>
      <div className='flex items-center justify-end'>
        <Skeleton className='h-12 w-40' />
      </div>
    </div>
    <Skeleton className='h-96 mt-8' />
  </main>
)

const EmptyState = ({ onClick }) => (
  <button
    type="button"
    className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
    onClick={onClick}
  >
    <ChartPieIcon className="mx-auto h-12 w-12 text-gray-400" />
    <span className="mt-2 block text-sm font-semibold text-gray-400">Add a dashboard component.</span>
  </button>
)

export default function Dashboard({ params }) {
  const { id: dashboardId } = params;
  const [componentSlideoutIsOpen, setComponentSlideoutIsOpen] = useState(false);
  const [currentTimeframe, setCurrentTimeframe] = useState('thirty_days');
  const [dashboardComponents, setDashboardComponents] = useState();
  const [dashboardComponentToConfigure, setDashboardComponentToConfigure] = useState();
  const [dashboardName, setDashboardName] = useState();
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDashboardLayoutUpdates, setPendingDashboardLayoutUpdates] = useState([]);

  const detectChangedComponentsFromLayoutAndSave = layout => {
    const changedDashboardComponents = dashboardComponents.map(component => {
      const layoutItemForComponent = layout.find(({ i }) => i === component.id);
      if (!layoutItemForComponent) return;
      if (
        layoutItemForComponent.x !== component.configuration.x ||
        layoutItemForComponent.y !== component.configuration.y ||
        layoutItemForComponent.w !== component.configuration.w ||
        layoutItemForComponent.h !== component.configuration.h
      ) {
        return {
          ...component,
          configuration: {
            ...component.configuration,
            x: layoutItemForComponent.x,
            y: layoutItemForComponent.y,
            w: layoutItemForComponent.w,
            h: layoutItemForComponent.h
          }
        }
      }
    }).filter(Boolean);
    const pendingDashboardUpdatesNotInThisChange = pendingDashboardLayoutUpdates.filter(pendingUpdateComponent => changedDashboardComponents.includes(({ id }) => id === pendingUpdateComponent.id));
    console.log(changedDashboardComponents);
    setPendingDashboardLayoutUpdates([...pendingDashboardUpdatesNotInThisChange, ...changedDashboardComponents]);
  }

  const updateDashboardComponents = async components => {
    const formattedComponents = components.map(({ configuration, id }) => ({ id, configuration }));
    setIsSaving(true);
    return SwishjamAPI.DashboardComponents.bulkUpdate(formattedComponents).then(({ errors, updated_components }) => {
      setIsSaving(false);
      if (errors) {

      }
    })
  }

  const createDashboardComponent = async componentConfiguration => {
    const formattedConfiguration = { ...DEFAULT_GRID_CONFIGURATIONS[componentConfiguration.type], ...componentConfiguration };
    setIsSaving(true);
    return SwishjamAPI.DashboardComponents.create(dashboardId, formattedConfiguration).then(result => {
      setIsSaving(false);
      if (result.error) {

      } else {
        setDashboardComponents([...dashboardComponents, result]);
      }
    });
  }

  const pendingDashboardLayoutUpdatesRef = useRef(pendingDashboardLayoutUpdates);

  const updatePendingDashboardLayoutUpdates = () => {
    if (pendingDashboardLayoutUpdatesRef.current.length > 0) {
      updateDashboardComponents(pendingDashboardLayoutUpdatesRef.current).then(() => setPendingDashboardLayoutUpdates([]));
    }
  }

  useEffect(() => {
    pendingDashboardLayoutUpdatesRef.current = pendingDashboardLayoutUpdates; // needed in order to access within the autosave setInterval
  }, [pendingDashboardLayoutUpdates]);

  useEffect(() => {
    SwishjamAPI.Dashboards.retrieve(dashboardId).then(({ name }) => setDashboardName(name));
    SwishjamAPI.DashboardComponents.list(dashboardId).then(setDashboardComponents);
    const interval = setInterval(() => updatePendingDashboardLayoutUpdates, AUTO_SAVE_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);


  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <ComponentOptionsSlideout
        isOpen={componentSlideoutIsOpen}
        onClose={() => setComponentSlideoutIsOpen(false)}
        onSelect={componentType => {
          setComponentSlideoutIsOpen(false);
          // There is no configuration options for the RetentionWidget, add it to the dashboard immediately
          if (componentType === 'UserRetention') {
            createDashboardComponent({ type: componentType })
          } else {
            setDashboardComponentToConfigure(componentType);
          }
        }}
      />
      {dashboardComponentToConfigure && (
        <ConfigureDashboardComponentModal
          componentType={dashboardComponentToConfigure}
          onClose={() => setDashboardComponentToConfigure()}
          onSave={componentConfiguration => {
            setDashboardComponentToConfigure();
            createDashboardComponent({ type: dashboardComponentToConfigure, ...componentConfiguration });
          }}
        />
      )}
      <div className='grid grid-cols-2 mt-8 flex items-center'>
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
                  onClick={() => setComponentSlideoutIsOpen(true)}
                >
                  Add Component <PlusCircleIcon className='h-4 w-4 ml-1' />
                </button>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
                  onClick={() => {
                    setIsInEditMode(false);
                    updatePendingDashboardLayoutUpdates();
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
        {dashboardComponents
          ? dashboardComponents.length > 0
            ? (
              <RenderingEngine
                components={dashboardComponents}
                timeframe={currentTimeframe}
                onLayoutChange={detectChangedComponentsFromLayoutAndSave}
                editable={isInEditMode}
                onDashboardComponentEdit={({ id, configuration }) => () => setDashboardComponentToConfigure({ id, ...configuration.type })}
                onDashboardComponentDelete={id => {
                  setDashboardComponents(dashboardComponents.filter(({ id: componentId }) => componentId !== id));
                  SwishjamAPI.DashboardComponents.delete(id);
                }}
              />
            ) : <EmptyState onClick={() => setComponentSlideoutIsOpen(true)} />
          : <LoadingState />
        }
      </div>
    </main>
  )
}