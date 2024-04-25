import { AreaChartIcon, BarChart2Icon, FileDigitIcon, PieChartIcon } from "lucide-react"

const ICONS_DICT = {
  BarChart: BarChart2Icon,
  LineChart: AreaChartIcon,
  PieChart: PieChartIcon,
  ValueCard: FileDigitIcon,
}

export default function ChartTypeSelector({ options = ['BarChart', 'LineChart', 'PieChart', 'ValueCard'], selected, setSelected, ...props }) {
  return (
    <div {...props} className={`flex items-center space-x-2 ${props.className}`}>
      {options.map(option => {
        const Icon = ICONS_DICT[option];
        return (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`flex items-center justify-center p-4 transition-colors duration-500 rounded-t cursor-pointer border-b-4 hover:bg-gray-200 ${selected === option ? 'border-swishjam' : 'border-transparent hover:border-swishjam-light'}`}
            data-value={option}
          >
            <div>
              <Icon className='h-18 w-18 mx-auto' />
              {option.replace('Chart', ' Chart')}
            </div>
          </button>
        )
      })}
    </div>
  )
}