import BarListCard from '@/components/Dashboards/Components/BarListCard';
import { randomNumberBetween } from '@/lib/utils/numberHelpers';

export default function BarListCardOption({ onClick }) {
  return (
    <div className='cursor-pointer transition-all hover:scale-105' onClick={() => { onClick && onClick() }}>
      <BarListCard 
        title='Bar List Card' 
        items={[
        { name: 'A category', value: randomNumberBetween(75, 100) },
        { name: 'Some other category', value: randomNumberBetween(50, 75) },
        { name: 'A third category', value: randomNumberBetween(25, 50) },
        { name: 'A third category', value: randomNumberBetween(0, 25) },
      ]} />
    </div>
  )
}