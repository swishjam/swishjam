'use client'

import { useEffect, useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";

import DashboardNameDisplayEditor from "@/components/Dashboards/DashboardNameDisplayEditor";
import RenderingEngine from "@/components/Dashboards/RenderingEngine";
import ComponentOptionsSlideout from "@/components/Dashboards/Builder/ComponentOptions/OptionsSlideout";
import LineChartConfiguration from "@/components/Dashboards/Builder/Configurations/LineChart";
import PieChartConfiguration from "@/components/Dashboards/Builder/Configurations/PieChart";
import BarListConfiguration from "@/components/Dashboards/Builder/Configurations/BarList";
import ValueCardConfiguration from "@/components/Dashboards/Builder/Configurations/ValueCard";

import Modal from "@/components/utils/Modal";
import { ChartPieIcon, PencilSquareIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import Timefilter from "@/components/Timefilter";

const DEFAULT_GRID_CONFIGURATIONS = {
  LineChart: { w: 10, h: 8, y: 0, x: 0 },
  PieChart: { w: 4, h: 4, y: 0, x: 0 },
  BarList: { w: 4, h: 4, y: 0, x: 0 },
  ValueCard: { w: 4, h: 2, y: 0, x: 0 },
}

const ConfigureDashboardComponentModal = ({ componentType, eventOptions, onSave, onClose }) => {
  const ConfigurationComponent = {
    LineChart: LineChartConfiguration,
    PieChart: PieChartConfiguration,
    BarList: BarListConfiguration,
    ValueCard: ValueCardConfiguration
  }[componentType];
  return (
    <Modal onClose={onClose} isOpen={true} size="large">
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
  const [currentTimeframe, setCurrentTimeframe] = useState('this_month');
  const [dashboardComponents, setDashboardComponents] = useState();
  const [dashboardComponentToConfigure, setDashboardComponentToConfigure] = useState();
  const [dashboardName, setDashboardName] = useState();
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [pendingDashboardLayoutUpdates, setPendingDashboardLayoutUpdates] = useState([]);
  const [uniqueEvents, setUniqueEvents] = useState();

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
    const otherPendingUpdates = pendingDashboardLayoutUpdates.filter(pendingUpdateComponent => changedDashboardComponents.includes(({ id }) => id === pendingUpdateComponent.id));
    setPendingDashboardLayoutUpdates([...otherPendingUpdates, ...changedDashboardComponents]);
  }

  const updateDashboardComponents = async components => {
    const formattedComponents = components.map(({ configuration, id }) => ({ id, configuration }));
    return SwishjamAPI.DashboardComponents.bulkUpdate(formattedComponents).then(({ errors, updated_components }) => {
      if (errors) {

      }
      const updatedDashboardComponents = dashboardComponents.map(component => {
        const updatedComponent = updated_components.find(({ id }) => id === component.id);
        if (updatedComponent) return { ...updatedComponent, configuration: { x: 0, y: 0, w: 4, h: 4, ...updatedComponent.configuration } };
        return component;
      });
      setDashboardComponents(updatedDashboardComponents);
    })
  }

  const createDashboardComponent = async componentConfiguration => {
    const formattedConfiguration = { ...DEFAULT_GRID_CONFIGURATIONS[componentConfiguration.type], ...componentConfiguration };
    return SwishjamAPI.DashboardComponents.create(dashboardId, formattedConfiguration).then(result => {
      if (result.error) {

      } else {
        setDashboardComponents([...dashboardComponents, result]);
      }
    });
  }

  const saveDashboard = async dashboardName => {
    API.patch(`/api/v1/dashboards/${dashboardId}`, { dashboard: { name: dashboardName } }).then(({ error, dashboard }) => {
      if (error) {

      } else {
        setDashboardName(dashboard.name);
      }
    });
  }

  const deleteDashboardComponent = id => {
    setDashboardComponents(dashboardComponents.filter(({ id: componentId }) => componentId !== id));
    API.delete(`/api/v1/dashboard_components/${id}`).then(({ error }) => {
      if (error) {

      }
    });
  }

  const duplicateDashboardComponent = ({ id, configuration }) => {
    const newConfiguration = { ...configuration, ...DEFAULT_GRID_CONFIGURATIONS[configuration.type], title: `${configuration.title} (copy)` };
    API.post('/api/v1/dashboard_components', {
      dashboard_id: dashboardId,
      dashboard_component: { configuration: newConfiguration }
    }).then(({ error, dashboard_component }) => {
      if (error) {
      } else {
        setDashboardComponents([...dashboardComponents, dashboard_component]);
      }
    });
  }

  const updatePendingDashboardLayoutUpdates = () => {
    if (pendingDashboardLayoutUpdates.length > 0) {
      updateDashboardComponents(pendingDashboardLayoutUpdates).then(() => setPendingDashboardLayoutUpdates([]));
    }
  }

  useEffect(() => {
    SwishjamAPI.Dashboards.retrieve(dashboardId).then(({ name }) => setDashboardName(name));
    SwishjamAPI.DashboardComponents.list(dashboardId).then(setDashboardComponents);
    SwishjamAPI.Events.listUnique().then(events => {
      setUniqueEvents(events);
    });
  }, []);

  // TODO: the setInterval doesnt have access to the latest state of pendingDashboardLayoutUpdates, so it never updates
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     updatePendingDashboardLayoutUpdates()
  //   }, 10_000);
  //   return () => clearInterval(interval);
  // }, [pendingDashboardLayoutUpdates]);

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <ComponentOptionsSlideout
        isOpen={componentSlideoutIsOpen}
        onClose={() => setComponentSlideoutIsOpen(false)}
        onSelect={componentType => {
          setComponentSlideoutIsOpen(false);
          setDashboardComponentToConfigure(componentType);
        }}
      />
      {dashboardComponentToConfigure && (
        <ConfigureDashboardComponentModal
          componentType={dashboardComponentToConfigure}
          onClose={() => setDashboardComponentToConfigure()}
          eventOptions={uniqueEvents}
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
                saveDashboard({ dashboardName: newDashboardName })
              }}
            />
          }
        </div>
        <div className='flex items-center justify-end'>
          <Timefilter selection={currentTimeframe} onSelection={setCurrentTimeframe} />
          {isInEditMode
            ? (
              <>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
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
                  Save
                </button>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
                  onClick={() => {
                    setIsInEditMode(false);
                    setPendingDashboardLayoutUpdates([])
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
                onClick={() => setIsInEditMode(true)}
              >
                Edit <PencilSquareIcon className='h-4 w-4 ml-1' />
              </button>
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
                onDashboardComponentDelete={deleteDashboardComponent}
              // TODO: onDashboardComponentDuplicate breaks the rendering engine upon duplication currently
              // onDashboardComponentDuplicate={duplicateDashboardComponent}
              />
            ) : <EmptyState onClick={() => setComponentSlideoutIsOpen(true)} />
          : <LoadingState />
        }
      </div>
    </main>
  )
}