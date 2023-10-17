import { ShieldAlert } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const PowerUserBadge = ({ className, size }) => (
  <div className={className}>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ShieldAlert className={`w-${size} h-${size} text-rose-600`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Churn Warning! This users usage is low and is a churn risk. Consider reaching out to this user</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

export default PowerUserBadge