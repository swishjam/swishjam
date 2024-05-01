import PieChartComponent from '@/components/Dashboards/DataVisualizations/PieChart'

export default function PieChartOption({ onClick }) {
  return (
    <div className='cursor-pointer hover:scale-105 transition-all' onClick={onClick}>
      <PieChartComponent
        title='Pie Chart'
        data={[
          { name: 'Group A', value: 400 },
          { name: 'Group B', value: 300 },
          { name: 'Group C', value: 300 },
          { name: 'Group D', value: 200 },
        ]}
        sizeMultiplier={0.5}
        height={100}
        width={300}
      />
    </div>
  )
}