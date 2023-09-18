import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConditionalCardWrapper({ title, children, includeCard = true }) {
  if (!includeCard) {
    return (
      <div>
        <CardTitle className="text-sm font-medium cursor-default pb-4">{title}</CardTitle>
        {children}
      </div>
    )
  } else {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    )
  }
}