import BarList from '@/components/Dashboards/Components/BarList';
import { randomNumberBetween } from '@/lib/utils/numberHelpers';

export default function BarListOption({ onClick }) {
  return (
    <div className='cursor-pointer transition-all hover:scale-105' onClick={() => { onClick && onClick() }}>
      <BarList
        title='Bar List Card'
        items={[
          { name: 'A category', value: randomNumberBetween(75, 100) },
          { name: 'Some other category', value: randomNumberBetween(50, 75) },
          { name: 'A third category', value: randomNumberBetween(25, 50) },
          { name: 'A fourth category', value: randomNumberBetween(0, 25) },
        ]} />
    </div>
  )
}