import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BarListNoCard from "./BarListNoCard"
import EmptyState from "@components/EmptyState"

export default function BarListCard({ title, items, ...props }) {
  
  return (
    <Card {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items?.length > 0 && <BarListNoCard items={items}/>}
        {items?.length == 0 && <EmptyState border/>}
      </CardContent>
    </Card>
  )
}