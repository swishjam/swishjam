import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConditionalCardWrapper({ title, children, className, includeCard = true }) {
  if (!includeCard) {
    return (
      <div className={className}>
        {title && <CardTitle className="text-sm font-medium cursor-default pb-2">{title}</CardTitle>}
        {children}
      </div>
    )
  } else {
    return (
      <Card className={className}>
        <CardHeader className="space-y-0 pb-2">
          {title && <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    )
  }
}