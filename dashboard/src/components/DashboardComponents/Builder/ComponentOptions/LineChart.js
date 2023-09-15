import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue'
import { randomNumberBetween } from '@/lib/utils/numberHelpers';
import { ONE_DAY_IN_MS } from '@/lib/utils/timeHelpers';

export default function LineChartOption({ onClick }) {
  const currentValue = randomNumberBetween(800, 900);
  return (
    <div className='cursor-pointer transition-all hover:scale-105' onClick={() => { onClick && onClick() }}>
      <LineChartWithValue
        timeseries={[
          { date: new Date() - ONE_DAY_IN_MS * 7, value: randomNumberBetween(0, 100) },
          { date: new Date() - ONE_DAY_IN_MS * 6, value: randomNumberBetween(100, 200) },
          { date: new Date() - ONE_DAY_IN_MS * 5, value: randomNumberBetween(200, 300) },
          { date: new Date() - ONE_DAY_IN_MS * 4, value: randomNumberBetween(300, 400) },
          { date: new Date() - ONE_DAY_IN_MS * 3, value: randomNumberBetween(400, 500) },
          { date: new Date() - ONE_DAY_IN_MS * 2, value: randomNumberBetween(500, 600) },
          { date: new Date() - ONE_DAY_IN_MS * 1, value: randomNumberBetween(700, 800) },
          { date: new Date(), value: currentValue },
        ]}
        value={currentValue}
        title='Line Chart'
        includeSettingsDropdown={false}
        showTooltip={false}
      />
    </div>
  )
}