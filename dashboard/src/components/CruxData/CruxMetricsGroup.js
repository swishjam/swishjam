import CruxMetricGoodNeedsImprovementPoorChart from "./CruxMetricGoodNeedsImprovementPoorChart"
import { AreaChart } from "@tremor/react";
import { formattedMsOrSeconds } from "@/lib/utils";

export default function CruxMetricsGroup({ metric, maxYValue, timeperiods, histogramTimeseriesData, p75TimeseriesData, isExpanded }) {
  const mostRecentLastDate = timeperiods[timeperiods.length - 1].lastDate;
  const formattedP75TimeseriesData = p75TimeseriesData.map((val, i) => ({
    P75: val,
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
        categories={['P75']} 
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
                {`${lastDate.month}/${lastDate.day}`}
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