import BarChart from '@/components/Dashboards/Components/BarChart'
import { randomNumberBetween } from '@/lib/utils/numberHelpers'

export default function BarChartOption({ onClick }) {
  const data = [
    {
      "google.com": randomNumberBetween(250, 500),
      "facebook.com": randomNumberBetween(500, 750),
      "twitter.com": randomNumberBetween(100, 200),
      "date": new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      "google.com": randomNumberBetween(250, 500),
      "facebook.com": randomNumberBetween(500, 750),
      "twitter.com": randomNumberBetween(100, 200),
      "date": new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      "google.com": randomNumberBetween(250, 500),
      "facebook.com": randomNumberBetween(500, 750),
      "twitter.com": randomNumberBetween(100, 200),
      "date": new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ]
  return (
    <div className='cursor-pointer hover:scale-105 transition-all' onClick={onClick}>
      <BarChart title='Bar Chart' data={data} includeTooltip={false} includeSettingsDropdown={false} />
    </div>
  )
}