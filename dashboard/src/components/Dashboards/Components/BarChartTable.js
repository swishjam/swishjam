"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { Skeleton } from "@/components/ui/skeleton";

export default function BarChartTable({
  tableTitle,
  barChartData,
  getColor,
  rowTitleFormatter = v => v,
  rowValueFormatter = v => v,
  displayIndividualDates = true,
  ignoredRowKeys = [],
  dateKey = 'date',
  ...props
}) {
  if (!barChartData) {
    return <Skeleton className='w-full h-96' />
  }
  let dates = [];
  let tableDataByValueAndDate = {};
  (barChartData || []).forEach(data => {
    const { [dateKey]: date, ...dataForDate } = data;
    dates.push(date);
    Object.keys(dataForDate).forEach(rowValue => {
      if (ignoredRowKeys.includes(rowValue)) return;
      tableDataByValueAndDate[rowValue] = tableDataByValueAndDate[rowValue] || { total: 0 }
      tableDataByValueAndDate[rowValue].total += dataForDate[rowValue]
      if (displayIndividualDates) {
        tableDataByValueAndDate[rowValue][date] = dataForDate[rowValue]
      }
    })
  })
  // `tableDataByValueAndDate` results in:
  // {
  //   'direct': {
  //     'Total Count': 1,
  //     '2021-09-10T00:00:00.000Z': 1
  //   }
  // }


  // if the difference between the first two dates is less than a day, include the time
  const includeTime = dates[1] && dates[0] && new Date(dates[1]) - new Date(dates[0]) < 1000 * 60 * 60 * 24;
  const isEmpty = Object.keys(tableDataByValueAndDate).length === 0;
  const sortedRowValues = Object.keys(tableDataByValueAndDate).sort((a, b) => tableDataByValueAndDate[b].total - tableDataByValueAndDate[a].total)
  const descendingDates = dates.sort((a, b) => new Date(b) - new Date(a));

  return (
    // <ScrollArea {...props} className={`rounded-sm border h-96 w-full overflow-x-scroll mt-4 ${props.className}`}>
    <div className={`w-full border rounded-sm ${props.className}`}>
      <Table {...props} className='w-full max-h-96 rounded-sm'>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className='capitalize whitespace-nowrap'>
              {tableTitle || 'Value'}
            </TableHead>
            <TableHead className='capitalize whitespace-nowrap'>
              Total
            </TableHead>
            {displayIndividualDates
              ? (
                dates.map((date, i) => (
                  <TableHead key={i} className='capitalize whitespace-nowrap'>
                    {prettyDateTime(date, { month: 'short', day: '2-digit', year: 'none', hour: includeTime ? undefined : 'none', minute: includeTime ? undefined : 'none', seconds: 'none', milliseconds: 'none' })}
                  </TableHead>
                ))
              ) : <></>
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {isEmpty ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            sortedRowValues.map((rowValue, i) => {
              return (
                <TableRow key={i} className='text-xs text-gray-700 cursor-default overflow-x-scroll'>
                  <TableCell>
                    <div className='flex items-center'>
                      <div
                        className='transition-all rounded-full h-2 w-2 mr-2'
                        style={{ backgroundColor: getColor(rowValue) }}
                      />
                      <span>
                        {rowTitleFormatter(rowValue)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {rowValueFormatter(tableDataByValueAndDate[rowValue].total)}
                  </TableCell>
                  {displayIndividualDates
                    ? (
                      descendingDates.map((date, i) => (
                        <TableCell key={i}>
                          {rowValueFormatter(tableDataByValueAndDate[rowValue][date] || 0)}
                        </TableCell>
                      ))
                    ) : <></>}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
    // </ScrollArea>
  )
}
