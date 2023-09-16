import ValueCardComponent from '@/components/DashboardComponents/ValueCard'
import { randomNumberBetween } from '@/lib/utils/numberHelpers';

export default function ValueCardOption({ onClick }) {
  return (
    <div className='cursor-pointer hover:scale-105 transition-all' onClick={onClick}>
      <ValueCardComponent 
        title='Value Card' 
        value={randomNumberBetween(50, 250)} 
        previousValue={randomNumberBetween(50, 250)} 
      />
    </div>
  )
}