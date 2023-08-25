import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover"

const options = [
  { name: 'hour', value: 'hour' },
  { name: 'today', value: 'today' },
  { name: '24 hours', value: '24_hours' },
  { name: 'this week', value: 'this_week' },
  { name: 'seven days', value: 'seven_days' },
  { name: 'this month', value: 'this_month' },
  { name: 'thirty days', value: 'thirty_days' },
  { name: 'sixty days', value: 'sixty_days' },
  { name: 'two months', value: 'two_months' },
  { name: 'ninety days', value: 'ninety_days' },
  { name: 'three months', value: 'three_months' },
  { name: 'six months', value: 'six_months' },
  { name: 'this year', value: 'this_year' },
  { name: 'one year', value: 'one_year' }
];

const getNameByValue = (value) => {
  const option = options.find((opt) => opt.value === value);
  if (option) {
    return option.name;
  }
}

export default function Timefilter({ selection = 'this_month', onSelection }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="capitalize">{getNameByValue(selection)}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 grid grid-cols-2 gap-4" align={'end'} >
        {options.map((opt) => (
          <PopoverClose
            key={opt.value} 
            asChild
          >
            <div
              onClick={() => onSelection(opt.value)}
              className={`${selection == opt.value ? 'bg-gray-100':null} group w-full rounded-md p-2 text-center hover:bg-gray-100 transition duration-500 cursor-pointer`}
            >
              <Label className="width capitalize group-hover:cursor-pointer group-hover:text-swishjam duration-500 transition">{opt.name}</Label>
            </div>
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  )
}