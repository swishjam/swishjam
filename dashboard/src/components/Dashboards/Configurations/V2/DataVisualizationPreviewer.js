import { Card } from "@/components/ui/card"
import ConditionalCardWrapper from "@/components/DataVisualizations/utils/ConditionalCardWrapper";
import { TriangleAlertIcon } from "lucide-react";
import DataVisualizationRenderingEngine from "@/components/DataVisualizations/RenderingEngines/DataVisualizationRenderingEngine";

const MissingDataMessage = ({ className, text }) => (
  <div className={`flex items-center justify-center border border-dashed border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-500 ${className}`}>
    <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
      <TriangleAlertIcon className='h-4 w-4 mx-auto' />
    </div>
    <span>{text}</span>
  </div>
)

export default function DataVisualizationPreviewer({
  aggregationMethod,
  event,
  property,
  subtitle,
  timeframe = '7_days',
  title,
  visualizationType,
  includeSettingsDropdown = true,
  ...props
}) {
  const propertyIsRequired = ['BarChart', 'PieChart'].includes(visualizationType) || !['count', 'users', 'organizations'].includes(aggregationMethod)
  let missingRequiredFields = [];
  if (!aggregationMethod) missingRequiredFields.push('an aggregationMethod method');
  if (!event) missingRequiredFields.push('an event');
  if (propertyIsRequired && !property) missingRequiredFields.push('a property');
  return (
    // <Card className={`${missingRequiredFields.length > 0 ? '' : visualizationType === 'ValueCard' ? 'h-[40vh] py-12 px-44' : 'h-[80vh]'} ${props.className || ''}`}>
    missingRequiredFields.length > 0
      ? (
        <ConditionalCardWrapper
          AdditionalHeaderActions={props.AdditionalHeaderActions}
          includeCard={false}
          includeSettingsDropdown={false}
          isEnlargable={false}
          onlyDisplayHeaderActionsOnHover={false}
          title={title || <MissingDataMessage className='w-fit' text='Input a Title' />}
          subtitle={subtitle}
        >
          <MissingDataMessage
            className='w-full h-72'
            text={`Select ${missingRequiredFields.slice(0, -1).join(', ')}${missingRequiredFields.length > 1 ? ',' : ''}${missingRequiredFields.length > 1 ? ' and ' : ''}${missingRequiredFields[missingRequiredFields.length - 1]} to preview your visualization.`}
          />
        </ConditionalCardWrapper>
      ) : (
        <DataVisualizationRenderingEngine
          {...props}
          aggregationMethod={aggregationMethod}
          event={event}
          includeCard={visualizationType === 'ValueCard'}
          includeContextMenu={false}
          includeSettingsDropdown={false}
          includeQueryDetails={false}
          property={property}
          subtitle={subtitle}
          timeframe={timeframe}
          title={title || <MissingDataMessage className='w-fit' text='Input a Title' />}
          type={visualizationType}
        />
      )
    // </Card>
  )
}