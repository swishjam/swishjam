// import { AreaChart } from "@tremor/react";
// import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from "recharts";
import MetricChart from "@/components/LabTests/MetricChart";
import { formattedDate, formattedMsOrSeconds } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

const formattedMetric = (value, metric) => {
  if (typeof value === 'undefined') return;
  if (metric === 'cumulative_layout_shift') return parseFloat(value).toFixed(4);
  return formattedMsOrSeconds(value);
}

const GOOD_NEEDS_IMPROVEMENT_POOR_TIERS = {
  largest_contentful_paint: { 
    good: 2_500, 
    needsImprovement: 4_000
  },
  total_blocking_time: {
    good: 300,
    needsImprovement: 600
  },
  max_first_input_delay: {
    good: 100,
    needsImprovement: 300
  },
  cumulative_layout_shift: {
    good: 0.1,
    needsImprovement: 0.25
  },
  speed_index: {
    good: 1_000,
    needsImprovement: 3_000
  },
  time_to_first_byte: {
    good: 800,
    needsImprovement: 1_800
  }
}

export default function PerformanceMetricCard({ labTests, title, metric, description }) {
  const formattedLabTestsData = (labTests || [])
    .filter(test => test[metric] !== null)
    .map(test => ({ [title]: test[metric], completed_at: formattedDate(test.completed_at) }));
  return (
    <div className="bg-white overflow-hidden p-4">
      <div className='mb-4'>
        <h3 className='text-2xl font-medium'>{title}</h3>
        {/* <p className='text-sm text-gray-500'>{description}</p> */}
      </div>
      {labTests === undefined
        ? <div className="h-72 animate-pulse bg-gray-200 rounded-md" />
        : formattedLabTestsData.length === 0
          ? (
            <div className='h-72 flex items-center justify-center'>
              <div className='text-center'>
                <h2 className='text-gray-700 text-md'>No lab tests data.</h2>
                <p className='text-gray-500 text-sm'>
                  Manage your lab test configurations <Link href='/lab-tests/manage' className='cursor-pointer underline hover:text-swishjam'>here</Link>.
                </p>
              </div>
            </div>
          ) : (
            <div className='relative'>
              <MetricChart 
                data={formattedLabTestsData} 
                metric={title} 
                xAxisKey='completed_at' 
                goodNeedsImprovementPoorTiers={GOOD_NEEDS_IMPROVEMENT_POOR_TIERS[metric]}
              />
            </div>
          )
      }
    </div>
  )
}