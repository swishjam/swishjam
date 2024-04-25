import { Card } from "@/components/ui/card"
import BarChartDashboardComponent from "../../../RenderingEngines/BarChart"
import ConditionalCardWrapper from "@/components/Dashboards/Components/ConditionalCardWrapper";
import { TriangleAlertIcon } from "lucide-react";

const MissingDataMessage = ({ className, text }) => (
  <div className={`flex items-center justify-center border border-dashed border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-500 ${className}`}>
    <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
      <TriangleAlertIcon className='h-4 w-4 mx-auto' />
    </div>
    <span>{text}</span>
  </div>
)

export default function BarChartPreviewer({
  title,
  subtitle,
  event,
  property,
  dataSource,
  whereClauseGroups,
}) {
  console.log('BarChartPreviewer', { whereClauseGroups })
  return (
    <Card>
      {!event || !property
        ? (
          <ConditionalCardWrapper
            includeCard={false}
            title={title || <MissingDataMessage className='w-fit' text='Input a Title' />}
            subtitle={subtitle}
            includeSettingsDropdown={false}
            isEnlargable={false}
          >
            <MissingDataMessage className='w-full h-72' text='Select an event and property to visualize.' />
          </ConditionalCardWrapper>
        ) : (
          <BarChartDashboardComponent
            configuration={{
              title: title || <MissingDataMessage className='w-fit' text='Input a Title' />,
              subtitle,
              event,
              property,
              dataSource,
              whereClauseGroups,
            }}
            timeframe='7_days'
          />
        )}
    </Card>
  )
}