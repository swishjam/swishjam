import { Card, CardContent } from '@/components/ui/card'

export default function CustomTooltip({ active, payload, label, valueFormatter, dateFormatter, includeComparison }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              {data.value} - {data.date}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
}