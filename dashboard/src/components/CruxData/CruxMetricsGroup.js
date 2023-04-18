import CruxMetricGoodNeedsImprovementPoorChart from "./CruxMetricGoodNeedsImprovementPoorChart"

export default function CruxMetricsGroup({ metric, timeperiods, histogramTimeseriesData, p75TimeseriesData, isExpanded }) {
  return timeperiods.map(({ lastDate }, i) => (
    <div key={i} className={`flex items-center mx-2 my-6 ${i !== timeperiods.length - 1 && !isExpanded ? 'hidden' : ''}`}>
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
  ))
}