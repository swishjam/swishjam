import { Card, CardContent } from "@/components/ui/card"
import { useEffect } from 'react';

export default function CustomTooltip({
  active,
  additionalDataFormatter,
  comparisonDateKey = 'comparisonDate',
  comparisonValueKey,
  dateFormatter,
  dateKey,
  onDisplay = () => { },
  payload,
  primaryColor,
  primaryColorFill,
  secondaryColor,
  secondaryColorFill,
  valueKey,
  valueFormatter,
}) {
  useEffect(() => {
    if (active) {
      onDisplay(payload[0]?.payload)
    }
  }, [active, payload])

  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <Card className="z-[50000] bg-white shadow-xl">
        <CardContent className="py-2">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className='rounded-full h-[10px] w-[10px] mr-1' style={{ border: `2px solid ${primaryColor}`, backgroundColor: primaryColorFill }} />
              {dateFormatter(data[dateKey])}: {valueFormatter(data[valueKey])}
            </div>
          </div>
          {data[comparisonValueKey] >= 0
            ? (
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className='rounded-full h-[10px] w-[10px] mr-1' style={{ border: `2px dashed ${secondaryColor}`, backgroundColor: secondaryColorFill }} />
                  {dateFormatter(data[comparisonDateKey])}: {valueFormatter(data[comparisonValueKey])}
                </div>
              </div>
            ) : <></>
          }
          {additionalDataFormatter && (
            <div className='text-xs text-muted-foreground mt-2 pt-2 border-t border-gray-200'>
              {additionalDataFormatter(data)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  return null;
}