import { AreaChart } from "@tremor/react";
import { useState, useEffect } from "react";
import { GetCWVTimeSeriesData } from '@lib/api';


export default function WebVitalTimeSeries({ metric, siteId }) {
  const [chartData, setChartData] = useState([{}]);

  useEffect(() => {
    GetCWVTimeSeriesData({ siteId, metric }).then(res => {
      const formattedResults = res.results.map(result => {
        return { 
          timestamp: `${new Date(result.hour).getMonth() + 1}/${new Date(result.hour).getDate()} ${new Date(result.hour).getHours()}:00`, 
          Good: parseFloat(result.percent_good_records),
          "Needs Improvement": parseFloat(result.percent_medium_records),
          Poor: parseFloat(result.percent_bad_records)
        }
      });
      setChartData(formattedResults);
    })
  }, []);

  return (
    <>
      <AreaChart
        data={chartData}
        dataKey="timestamp"
        categories={['Good','Needs Improvement','Poor']}
        colors={['emerald', 'yellow','rose']}
        showYAxis={false}
        maxValue={100}
        showLegend={false}
        startEndOnly={true}
        valueFormatter={valueFormatter}
        height="h-48"
        marginTop="mt-10"
        stack={true} 
      />
    </>
  )
}