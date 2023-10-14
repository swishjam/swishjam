import BarChart from '@/components/Dashboards/Components/BarChart'

export default function BarChartOption({ onClick }) {
  const data = [
    {
      "name": "Page A",
      "uv": 100,
      "pv": 50
    },
    {
      "name": "Page B",
      "uv": 75,
      "pv": 45
    },
    {
      "name": "Page C",
      "uv": 90,
      "pv": 25
    }
  ]
  return (
    <div className='cursor-pointer hover:scale-105 transition-all' onClick={onClick}>
      <BarChart title='Bar Chart' data={data} includeTooltip={false} includeLegend={false} />
    </div>
  )
}