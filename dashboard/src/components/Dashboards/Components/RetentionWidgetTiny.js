import RetentionGrid from "./RetentionWidgetTiny/RetentionGrid";
import { CardTitle } from "@/components/ui/card";
import ConditionalCardWrapper from './ConditionalCardWrapper';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function RetentionWidgetTiny({ retentionCohorts, isExpandable = true, includeCard = true, className }) {

  console.log(retentionCohorts)
  const lastFourItems = retentionCohorts?.slice(-4);

  return (
    <ConditionalCardWrapper
      className={className}
      includeCard={includeCard}
      title={
        <div className='flex items-center justify-between space-y-0 pb-4'>
          <CardTitle className="text-sm font-medium cursor-default">User Retention</CardTitle>
        </div>
      }
    >
      <RetentionGrid
        retentionCohorts={lastFourItems}
        isExpandable={isExpandable}
      />
    </ConditionalCardWrapper>
  )
}