import { Card } from "@/components/ui/card"
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

export default function ComponentPreviewer({
  aggregation,
  dataSource,
  event,
  property,
  subtitle,
  title,
  whereClauseGroups,
  ComponentRenderingEngine,
  ...componentSpecificProps
}) {
  const isValid = event && aggregation && (property || aggregation === 'count');
  console.log('ComponentPreviewer', { event, property, aggregation })
  return (
    <Card>
      {!isValid
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
          <ComponentRenderingEngine
            aggregation={aggregation}
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