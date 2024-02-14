import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import Combobox from "../utils/Combobox";

export default function OperatorDropdown({ selectedOperator, onSelectionChange, options }) {
  if (options) {
    options = options.map(option => {
      if (typeof option === 'string') {
        return { label: option, value: option }
      }
      return option
    })
  }
  return (
    <Combobox selectedValue={selectedOperator} onSelectionChange={onSelectionChange} options={options} placeholder="Select an operator" />
  )
}

// export default function OperatorDropdown({ selectedOperator, onSelectionChange, options }) {
//   if (options) {
//     options = options.map(option => {
//       if (typeof option === 'string') {
//         return { label: option, value: option }
//       }
//       return option
//     })
//   }
//   return (
//     <DropdownMenu className='max-h-40 overflow-y-scroll'>
//       <DropdownMenuTrigger>
//         <button className="w-full text-left border border-gray-200 rounded-md px-2 py-1 text-sm text-gray-700 flex items-center">
//           {selectedOperator ? selectedOperator : "Select an operator"}
//           <ChevronDownIcon className="ml-2 h-4 w-4 inline-block text-gray-700" />
//         </button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className='max-h-[400px] overflow-y-scroll'>
//         <DropdownMenuGroup>
//           <DropdownMenuLabel>Operators</DropdownMenuLabel>
//           {options.map(option => (
//             <DropdownMenuItem
//               key={option.value}
//               className='cursor-pointer hover:bg-gray-100 transition-colors'
//               onSelect={() => onSelectionChange(option.value)}
//               value={option.value}
//             >
//               <CheckIcon className={`mr-2 h-4 w-4 ${selectedOperator && selectedOperator === option.value ? "opacity-100" : "opacity-0"}`} />
//               {option.label}
//             </DropdownMenuItem>
//           ))}
//         </DropdownMenuGroup>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }