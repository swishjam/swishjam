import CruxMetricGoodNeedsImprovementPoorChart from "./CruxMetricGoodNeedsImprovementPoorChart"
import { AreaChart } from "@tremor/react";
import { formattedMsOrSeconds } from "@/lib/utils";
// import { cwvMetricBounds } from "@/lib/cwvCalculations";

// const METRIC_NAME_TO_ACCRONYM_DICT = {
//   cumulative_layout_shift: 'CLS',
//   first_contentful_paint: 'FCP',
//   first_input_delay: 'FID',
//   largest_contentful_paint: 'LCP',
//   experimental_time_to_first_byte: 'TTFB',
//   experimental_interaction_to_next_paint: 'INP'
// };

export default function CruxMetricsGroup({ metric, maxYValue, timeperiods, histogramTimeseriesData, p75TimeseriesData, isExpanded }) {
  const mostRecentLastDate = timeperiods[timeperiods.length - 1].lastDate;
  const formattedP75TimeseriesData = p75TimeseriesData.map((val, i) => ({
    P75: val,
    // Good: cwvMetricBounds[METRIC_NAME_TO_ACCRONYM_DICT[metric]].good,
    // 'Needs Improvement': cwvMetricBounds[METRIC_NAME_TO_ACCRONYM_DICT[metric]].medium,
    // Poor: cwvMetricBounds[METRIC_NAME_TO_ACCRONYM_DICT[metric]].medium + (cwvMetricBounds[METRIC_NAME_TO_ACCRONYM_DICT[metric]].medium - cwvMetricBounds[METRIC_NAME_TO_ACCRONYM_DICT[metric]].good),
    date: `${timeperiods[i].lastDate.month}/${timeperiods[i].lastDate.day}`
  }));
  return (
    <>
      <AreaChart 
        height="h-40"
        data={formattedP75TimeseriesData} 
        dataKey="date"
        maxValue={maxYValue}
        showLegend={false}
        categories={['P75', 'Good', 'Needs Improvement', 'Poor']} 
        colors={['blue', 'green', 'yellow', 'red']}
        valueFormatter={val => metric === 'cumulative_layout_shift' ? val : formattedMsOrSeconds(val)}
      />
      {timeperiods.map(({ lastDate }, i) => (
        <div 
          key={i} 
          className={`flex items-center mx-2 my-6 ${
          (lastDate.month !== mostRecentLastDate.month 
            || lastDate.day !== mostRecentLastDate.day 
            || lastDate.year !== mostRecentLastDate.year)
            && !isExpanded ? 'hidden' : ''}`}
        >
          <div className='w-[10%] flex items-center justify-end pr-1'>
            <div>
              <span className='text-xs text-gray-500 block'>
                {lastDate.month}/{lastDate.day}
              </span>
            </div>
          </div>
          <div className='w-[90%]'>
            <CruxMetricGoodNeedsImprovementPoorChart 
              metric={metric}
              indexToVisualize={i} 
              histogramTimeseries={histogramTimeseriesData} 
              p75Value={p75TimeseriesData[i]} 
            />
          </div>
        </div>
      ))}
    </>
  )
}