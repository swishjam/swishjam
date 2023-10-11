import { Award } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const PowerUserBadge = ({ className, size = 8 }) => (
  <div className={className}>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Award className={`w-${size} h-${size} text-amber-500`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Power User! Top 10% of user activity or spend</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

export default PowerUserBadge