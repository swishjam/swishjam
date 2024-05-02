import { Tooltipable } from "@/components/ui/tooltip";
import Combobox from "@/components/utils/Combobox";
import { AreaChartIcon, BarChart2Icon, FileDigitIcon, PieChartIcon } from "lucide-react"

const VISUALIZATIONS_DICT = {
  BarChart: {
    Icon: BarChart2Icon,
    name: 'Stacked Bar Chart',
  },
  AreaChart: {
    Icon: AreaChartIcon,
    name: 'Area Chart',
  },
  PieChart: {
    Icon: PieChartIcon,
    name: 'Pie Chart',
  },
  ValueCard: {
    Icon: FileDigitIcon,
    name: 'Value Card',
  },
}

export default function VisualizationTypeSelector({ options = ['BarChart', 'AreaChart', 'PieChart', 'ValueCard'], selected, setSelected, ...props }) {
  return (
    <Combobox
      selectedValue={selected}
      onSelectionChange={setSelected}
      options={options.map(option => {
        const { Icon, name } = VISUALIZATIONS_DICT[option];
        return {
          value: option,
          label: (
            <div className='flex items-center space-x-4'>
              <Icon className='h-4 w-4 text-gray-700' strokeWidth={1.5} />
              <span>{name}</span>
            </div>
          ),
        }
      })}
    />
  )
}

// export default function ChartTypeSelector({ options = ['BarChart', 'AreaChart', 'PieChart', 'ValueCard'], selected, setSelected, ...props }) {
//   return (
//     <div {...props} className={`max-w-xl mx-auto flex items-center justify-around ${props.className || ''}`}>
//       {options.map(option => {
//         const { Icon, name } = VISUALIZATIONS_DICT[option];
//         return (
//           <Tooltipable key={option} content={name}>
//             <button
//               onClick={e => {
//                 e.preventDefault();
//                 setSelected(option)
//               }}
//               className={`group w-12 h-12 rounded-md flex items-center justify-center transition-colors duration-500 hover:bg-gray-200 ${selected === option ? 'bg-swishjam-light' : 'hover:border-swishjam-light'}`}
//               data-value={option}
//             >
//               <Icon className='h-6 w-6 mx-auto text-gray-700 group-hover:text-swishjam' strokeWidth={1.5} />
//             </button>
//           </Tooltipable>
//         )
//       })}
//     </div>
//   )
// }