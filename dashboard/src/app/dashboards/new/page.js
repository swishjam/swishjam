'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView"
import { API } from "@/lib/api-client/base";

import LineChartOption from "@/components/DashboardComponents/Builder/ComponentOptions/LineChart";
import BarListCardOption from "@/components/DashboardComponents/Builder/ComponentOptions/BarListCard";
import BarChartOption from "@/components/DashboardComponents/Builder/ComponentOptions/BarChart";
import LineChartConfiguration from "@/components/DashboardComponents/Builder/Configurations/LineChart";
import PieChartOption from "@/components/DashboardComponents/Builder/ComponentOptions/PieChart";
import ComponentOptionsSlideout from "@/components/DashboardComponents/Builder/ComponentOptions/OptionsSlideout";

import { ChartPieIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/utils/Modal";

const ConfigureDashboardComponent = ({ componentType, eventOptions, onEventSelected, onClose }) => {
  return (
    <Modal onClose={onClose} isOpen={true} size="large">
      {componentType === 'LineChart' && <LineChartConfiguration eventOptions={eventOptions} />}
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
      <span className="mt-2 block text-sm font-semibold text-gray-900">Add a dashboard component.</span>
    </button>
  )
}

const DashboardBuilder = () => {
  const [dashboardComponentToConfigure, setDashboardComponentToConfigure] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();
  const [componentSlideoutIsOpen, setComponentSlideoutIsOpen] = useState(false);

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
        />
      )}
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Playground</h1>
        </div>
      </div>
      <div className="mt-8">
        <EmptyState onClick={() => setComponentSlideoutIsOpen(true)} />
      </div>
      <div className='mt-8 grid grid-cols-4 gap-4'>
        <LineChartOption onClick={() => setDashboardComponentToConfigure('LineChart')} />
        <BarListCardOption onClick={() => setDashboardComponentToConfigure('BarListCard')} />
        <BarChartOption onClick={() => setDashboardComponentToConfigure('BarChart')} />
        <PieChartOption onClick={() => setDashboardComponentToConfigure('PieChart')} />
      </div>
    </main>
  )
}

export default AuthenticatedView(DashboardBuilder);