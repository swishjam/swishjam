'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView"
import { API } from "@/lib/api-client/base";

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

const ConfigureDashboardComponent = ({ componentType, eventOptions, onSave, onClose }) => {
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

  const saveDashboard = async ({ dashboardName, dashboardComponents }) => {
    API.patch(`/api/v1/dashboards/${dashboardId}`, { dashboard: { name: dashboardName }, dashboard_components: dashboardComponents }).then(({ error, dashboard, dashboard_components }) => {
      if (error) {

      } else {
        setDashboardName(dashboard.name);
        const parsedComponentConfigs = (dashboard_components || []).map(({ configuration }) => JSON.parse(configuration));
        setDashboardComponents(parsedComponentConfigs);
      }
    });
  }

  useEffect(() => {
    API.get('/api/v1/events/unique').then(setUniqueEvents);
    API.get(`/api/v1/dashboards/${dashboardId}`).then(({ dashboard, dashboard_components }) => {
      setDashboardName(dashboard.name);
      const parsedComponentConfigs = (dashboard_components || []).map(({ configuration }) => JSON.parse(configuration));
      setDashboardComponents(parsedComponentConfigs);
    });
  }, [])

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
        <ConfigureDashboardComponent
          componentType={dashboardComponentToConfigure}
          onClose={() => setDashboardComponentToConfigure()}
          eventOptions={uniqueEvents}
          onSave={component => {
            setDashboardComponentToConfigure();
            const newDashboardComponents = [...dashboardComponents, { type: dashboardComponentToConfigure, ...component }];
            setDashboardComponents(newDashboardComponents);
            saveDashboard({ dashboardName, dashboardComponents: newDashboardComponents });
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
                <RenderingEngine components={dashboardComponents} timeframe={currentTimeframe} />
              </div>
            ) : <EmptyState onClick={() => setComponentSlideoutIsOpen(true)} />
          : <LoadingState />
        }
      </div>
    </main>
  )
}

export default AuthenticatedView(DashboardBuilder, LoadingState);