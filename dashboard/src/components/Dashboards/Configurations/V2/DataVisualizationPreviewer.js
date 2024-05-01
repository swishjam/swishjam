import { Card } from "@/components/ui/card"
import ConditionalCardWrapper from "@/components/DataVisualizations/utils/ConditionalCardWrapper";
import { TriangleAlertIcon } from "lucide-react";

const MissingDataMessage = ({ className, text }) => (
  <div className={`flex items-center justify-center border border-dashed border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-500 ${className}`}>
    <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
      <TriangleAlertIcon className='h-4 w-4 mx-auto' />
    </div>
    <span>{text}</span>
  </div>
)

export default function ComponentPreviewer({
  aggregationMethod,
  dataSource,
  event,
  property,
  subtitle,
  title,
  whereClauseGroups,
  ComponentRenderingEngine,
  propertyIsRequired,
  ...componentSpecificProps
}) {
  let missingRequiredFields = [];
  if (!aggregationMethod) missingRequiredFields.push('an aggregationMethod method');
  if (!event) missingRequiredFields.push('an event');
  if (propertyIsRequired && !property) missingRequiredFields.push('a property');
  return (
    <Card className={componentSpecificProps.className}>
      {missingRequiredFields.length > 0
        ? (
          <ConditionalCardWrapper
            includeCard={false}
            title={title || <MissingDataMessage className='w-fit' text='Input a Title' />}
            subtitle={subtitle}
            includeSettingsDropdown={false}
            isEnlargable={false}
          >
            <MissingDataMessage
              className='w-full h-72'
              text={`Select ${missingRequiredFields.slice(0, -1).join(', ')}${missingRequiredFields.length > 1 ? ',' : ''}${missingRequiredFields.length > 1 ? ' and ' : ''}${missingRequiredFields[missingRequiredFields.length - 1]} to preview your visualization.`}
            />
          </ConditionalCardWrapper>
        ) : (
          <ComponentRenderingEngine
            aggregationMethod={aggregationMethod}
            dataSource={dataSource}
            event={event}
            property={property}
            subtitle={subtitle}
            timeframe='7_days'
            title={title || <MissingDataMessage className='w-fit' text='Input a Title' />}
            whereClauseGroups={whereClauseGroups}
            {...componentSpecificProps}
          />
        )}
    </Card>
  )
}