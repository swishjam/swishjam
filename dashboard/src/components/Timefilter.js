import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const options = [
  { name: 'this hour', value: 'hour' },
  { name: 'today', value: 'today' },
  { name: 'last 24 hours', value: '24_hours' },
  { name: 'this week', value: 'this_week' },
  { name: 'last seven days', value: 'seven_days' },
  { name: 'this month', value: 'this_month' },
  { name: 'last thirty days', value: 'thirty_days' },
  { name: 'last sixty days', value: 'sixty_days' },
  { name: 'last two months', value: 'two_months' },
  { name: 'last ninety days', value: 'ninety_days' },
  { name: 'last three months', value: 'three_months' },
  { name: 'last six months', value: 'six_months' },
  { name: 'this year', value: 'this_year' },
  { name: 'last tweleve months', value: 'one_year' }
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
        <Button variant="outline" className="capitalize">
          <CalendarDaysIcon className="w-5 h-5 mr-2" />
          {getNameByValue(selection)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 grid grid-cols-2 gap-4" align={'end'} >
        {options.map((opt) => (
          <PopoverClose key={opt.value} asChild>
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