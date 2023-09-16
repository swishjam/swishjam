'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView"
import { API } from "@/lib/api-client/base";
import RenderingEngine from "@/components/DashboardComponents/Builder/RenderingEngine";
import LineChartConfiguration from "@/components/DashboardComponents/Builder/Configurations/LineChart";
import ComponentOptionsSlideout from "@/components/DashboardComponents/Builder/ComponentOptions/OptionsSlideout";
import { ChartPieIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/utils/Modal";
import PieChartConfiguration from "@/components/DashboardComponents/Builder/Configurations/PieChart";
import BarListConfiguration from "@/components/DashboardComponents/Builder/Configurations/BarList";

const ConfigureDashboardComponent = ({ componentType, eventOptions, onSave, onClose }) => {
  const ConfigurationComponent = {
    LineChart: LineChartConfiguration,
    PieChart: PieChartConfiguration,
    BarList: BarListConfiguration,
  }[componentType];
  return (
    <Modal onClose={onClose} isOpen={true} size="large">
      <ConfigurationComponent eventOptions={eventOptions} onSaveClick={onSave} />
    </Modal>
  )
}

const EmptyState = ({ onClick }) => {
  return (
    <button
      type="button"
      className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
      onClick={onClick}
    >
      <ChartPieIcon className="mx-auto h-12 w-12 text-gray-400" />
      <span className="mt-2 block text-sm font-semibold text-gray-400">Add a dashboard component.</span>
    </button>
  )
}

const DashboardBuilder = () => {
  const [dashboardComponents, setDashboardComponents] = useState([]);
  const [dashboardComponentToConfigure, setDashboardComponentToConfigure] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [componentSlideoutIsOpen, setComponentSlideoutIsOpen] = useState(false);

  const saveDashboard = async ({ dashboardName, dashboardComponents }) => {
    const { data } = await API.post('/api/v1/dashboards', { name: dashboardName, components: dashboardComponents });
    console.log('Saved dashboard!', data);
  }

  useEffect(() => {
    API.get('/api/v1/events/unique').then(setUniqueEvents);
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
            setDashboardComponents([...dashboardComponents, { type: dashboardComponentToConfigure, ...component }])
          }}
        />
      )}
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">New Dashboard</h1>
        </div>
        <div className='text-right'>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
            onClick={() => setComponentSlideoutIsOpen(true)}
          >
            Add Component <PlusCircleIcon className='h-4 w-4 ml-1' />
          </button>
        </div>
      </div>
      <div className="mt-8">
        {dashboardComponents.length > 0
          ? <RenderingEngine components={dashboardComponents} />
          : <EmptyState onClick={() => setComponentSlideoutIsOpen(true)} />
        }
      </div>
    </main>
  )
}

export default AuthenticatedView(DashboardBuilder);