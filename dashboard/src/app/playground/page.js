'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView"
import { API } from "@/lib/api-client/base";
import LineChartOption from "@/components/DashboardComponents/Playground/ComponentOptions/LineChart";
import BarListCardOption from "@/components/DashboardComponents/Playground/ComponentOptions/BarListCard";
import BarChartOption from "@/components/DashboardComponents/Playground/ComponentOptions/BarChart";
import LineChartConfiguration from "@/components/DashboardComponents/Playground/Configurations/LineChart";
import Modal from "@/components/utils/Modal";
import PieChartOption from "@/components/DashboardComponents/Playground/ComponentOptions/PieChart";

const ConfigureDashboardComponent = ({ componentType, eventOptions, onEventSelected, onClose }) => {
  return (
    <Modal onClose={onClose} isOpen={true} size="large">
      {componentType === 'LineChart' && <LineChartConfiguration eventOptions={eventOptions} />}
    </Modal>
  )
}

const Playground = () => {
  const [dashboardComponentToConfigure, setDashboardComponentToConfigure] = useState();
  const [uniqueEvents, setUniqueEvents] = useState();

  useEffect(() => {
    API.get('/api/v1/events/unique').then(setUniqueEvents);
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
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
      <div className='mt-8 grid grid-cols-4 gap-4'>
        <LineChartOption onClick={() => setDashboardComponentToConfigure('LineChart')} />
        <BarListCardOption onClick={() => setDashboardComponentToConfigure('BarListCard')} />
        <BarChartOption onClick={() => setDashboardComponentToConfigure('BarChart')} />
        <PieChartOption onClick={() => setDashboardComponentToConfigure('PieChart')} />
      </div>
    </main>
  )
}

export default AuthenticatedView(Playground);