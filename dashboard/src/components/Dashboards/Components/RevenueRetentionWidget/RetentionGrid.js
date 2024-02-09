import { BsArrowsAngleExpand, BsArrowsAngleContract } from 'react-icons/bs'
import { formatMoney } from '@/lib/utils/numberHelpers';
import LoadingState from "./LoadingGrid";
import { LONG_MONTHS } from '@/lib/utils/timeHelpers';
import RetentionGridCell from './RetentionGridCell';
import { useState } from 'react'

const monthFormatter = (d, includeYear = false) => {
  const date = new Date(d);
  const month = LONG_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${month}${includeYear ? `, ${year}` : ''}`;
}

export default function RetentionGrid({ retentionCohorts, isExpandable }) {
  if (!retentionCohorts) return <LoadingState />

  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = isExpandable && Object.keys(retentionCohorts).length > 4;

  const cohortDates = Object.keys(retentionCohorts).sort((a, b) => new Date(a) - new Date(b));
  const maxNumMonths = cohortDates.length > 0 ? retentionCohorts[cohortDates[0]].retention_periods.length : 0;

  return (
    <div className='relative'>
      <div className={`no-scrollbar overflow-scroll min-w-full relative transition-all ${isExpanded ? '' : 'max-h-96'}`}>
        <table>
          <thead>
            <tr className='font-normal'>
              <th className="text-left text-sm text-gray-700 font-normal pr-4" style={{ fontSize: '0.75rem' }}>
                Cohort
              </th>
              <th className="text-left text-sm text-gray-700 font-normal pr-4" style={{ fontSize: '0.75rem' }}>
                Starting MRR
              </th>
              <th className="text-left text-sm text-gray-700 font-normal pr-4" style={{ fontSize: '0.75rem' }}>
                # Subscriptions
              </th>
              {Array.from({ length: maxNumMonths }).map((_, i) => (
                <th key={i} className="text-left text-sm text-gray-700 text-center font-normal" style={{ fontSize: '0.75rem' }}>
                  Month {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {cohortDates.map(cohortDate => {
              const { starting_mrr_in_cents, starting_num_subscriptions, retention_periods } = retentionCohorts[cohortDate];
              return (
                <tr key={cohortDate}>
                  <>
                    <td className="whitespace-nowrap text-sm pr-4">
                      <span className='block' style={{ fontSize: '0.85rem' }}>{monthFormatter(cohortDate, true)}</span>
                    </td>
                    <td className="whitespace-nowrap text-sm pr-4">
                      <span className='text-xs text-gray-400 block' style={{ fontSize: '0.7rem' }}>{formatMoney(starting_mrr_in_cents)}</span>
                    </td>
                    <td className="whitespace-nowrap text-sm pr-4">
                      <span className='text-xs text-gray-400 block' style={{ fontSize: '0.7rem' }}>{starting_num_subscriptions}</span>
                    </td>
                    {retention_periods.map(({ retention_date, mrr_in_cents }, i) => {
                      return (
                        <td className="whitespace-nowrap text-sm" key={`${cohortDate}-${i}`}>
                          <RetentionGridCell
                            cohortDate={cohortDate}
                            retentionDate={retention_date}
                            mrrGeneratedForPeriod={mrr_in_cents}
                            startingMrrForCohort={starting_mrr_in_cents}
                            isPending={i === retention_periods.length - 1}
                          />
                        </td>
                      )
                    })}
                  </>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {canExpand && (
        <div className='absolute bottom-0 right-0 bg-white p-2 rounded-full bg-opacity-50 duration-500 cursor-pointer transition-all hover:bg-gray-100' onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <BsArrowsAngleContract className='h-4 w-4 text-gray-700' /> : <BsArrowsAngleExpand className='h-4 w-4 text-gray-700' />}
        </div>
      )}
    </div>
  )
}