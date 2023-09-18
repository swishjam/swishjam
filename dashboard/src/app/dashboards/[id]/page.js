'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView"
import { API } from "@/lib/api-client/base";
import GridLayout from "react-grid-layout";

import DashboardNameDisplayEditor from "@/components/Dashboards/DashboardNameDisplayEditor";
import RenderingEngine from "@/components/Dashboards/RenderingEngine";
import ComponentOptionsSlideout from "@/components/Dashboards/Builder/ComponentOptions/OptionsSlideout";
import LineChartConfiguration from "@/components/Dashboards/Builder/Configurations/LineChart";
import PieChartConfiguration from "@/components/Dashboards/Builder/Configurations/PieChart";
import BarListConfiguration from "@/components/Dashboards/Builder/Configurations/BarList";
import ValueCardConfiguration from "@/components/Dashboards/Builder/Configurations/ValueCard";

import Modal from "@/components/utils/Modal";
import { ChartPieIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import Timefilter from "@/components/Timefilter";

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

const DashboardBuilder = ({ params }) => {
  const { id: dashboardId } = params;
  const [dashboardName, setDashboardName] = useState();
  const [dashboardComponents, setDashboardComponents] = useState();
  const [dashboardComponentToConfigure, setDashboardComponentToConfigure] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [componentSlideoutIsOpen, setComponentSlideoutIsOpen] = useState(false);
  const [currentTimeframe, setCurrentTimeframe] = useState('this_month');

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
          was: component,
          is: { ...component, configuration: { ...component.configuration, x: layoutItemForComponent.x, y: layoutItemForComponent.y, w: layoutItemForComponent.w, h: layoutItemForComponent.h }}
        }
      }
    }).filter(Boolean);
    if (changedDashboardComponents.length > 0) {
      updateDashboardComponents(changedDashboardComponents.map(({ is }) => is));
    }
  }

  const updateDashboardComponent = componentConfig => {
    return updateDashboardComponents([componentConfig]);
  }

  const updateDashboardComponents = components => {
    console.log('UPDATING COMPONENTS!!!')
    API.patch(`/api/v1/dashboard_components/bulk_update`, { 
      dashboard_components: components.map(({ configuration, id }) => ({ id, configuration })) 
    }).then(({ errors, updated_components }) => {
      if (errors) {

      }
      const updatedDashboardComponents = dashboardComponents.map(component => {
        const updatedComponent = updated_components.find(({ id }) => id === component.id);
        if (updatedComponent) return { ...updatedComponent, configuration: { x: 0, y: 0, w: 4, h: 4, ...updatedComponent.configuration }};
        return component;
      });
      setDashboardComponents(updatedDashboardComponents);
    })
  }

  const createDashboardComponent = componentConfiguration => {
    API.post('/api/v1/dashboard_components', { dashboard_id: dashboardId, dashboard_component: { configuration: componentConfiguration }}).then(result => {
      if (result.error) {

      } else {
        const newDashboardComponents = [...dashboardComponents, { ...result, configuration: { x: 0, y: 0, w: 4, h: 4, ...result.configuration } }];
        setDashboardComponents(newDashboardComponents);
      }
    });
  }

  const saveDashboard = async dashboardName => {
    API.patch(`/api/v1/dashboards/${dashboardId}`, { dashboard: { name: dashboardName }}).then(({ error, dashboard }) => {
      if (error) {

      } else {
        setDashboardName(dashboard.name);
      }
    });
  }

  useEffect(() => {
    API.get('/api/v1/events/unique').then(setUniqueEvents);
    API.get(`/api/v1/dashboards/${dashboardId}`).then(({ name }) => setDashboardName(name));
    API.get(`/api/v1/dashboard_components`, { dashboard_id: dashboardId }).then(dashboard_components => {
      const parsedComponents = (dashboard_components || []).map(component => {
        return { ...component, configuration: { x: 0, y: 0, w: 4, h: 4, ...component.configuration } }
      });
      setDashboardComponents(parsedComponents);
    });
  }, []);

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
                saveDashboard({ dashboardName: newDashboardName, dashboardComponents })
              }} 
            />
          }
        </div>
        <div className='flex items-center justify-end'>
          <Timefilter selection={currentTimeframe} onSelection={setCurrentTimeframe} />
          <button
            type="button"
            className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
            onClick={() => setComponentSlideoutIsOpen(true)}
          >
            Add Component <PlusCircleIcon className='h-4 w-4 ml-1' />
          </button>
        </div>
      </div>
      <div className="mt-8">
        {dashboardComponents 
          ? dashboardComponents.length > 0
            ? (
              <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4'>
                <RenderingEngine 
                  components={dashboardComponents} 
                  timeframe={currentTimeframe} 
                  onLayoutChange={detectChangedComponentsFromLayoutAndSave} 
                />
              </div>
            ) : <EmptyState onClick={() => setComponentSlideoutIsOpen(true)} />
          : <LoadingState />
        }
      </div>
    </main>
  )
}

export default AuthenticatedView(DashboardBuilder, LoadingState);