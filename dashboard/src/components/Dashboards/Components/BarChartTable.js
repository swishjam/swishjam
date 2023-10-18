"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DataTable({ headers, barChartData, getColor, ignoredKeys = ['date'] }) {
  let tableData = {};
  (barChartData || []).forEach(dataForDate => {
    Object.keys(dataForDate).forEach(key => {
      if (!ignoredKeys.includes(key)) {
        tableData[key] = (tableData[key] || 0) + dataForDate[key]
      }
    })
  })
  tableData = Object.keys(tableData).map(key => ({ value: key, count: tableData[key] })).sort((a, b) => parseInt(b.count) - parseInt(a.count))

  return (
    <div className="rounded-md border max-h-44 overflow-scroll">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, i) => (
              <TableHead key={i}>
                {header[0].toUpperCase() + header.slice(1)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {barChartData ?
            tableData.length > 0 ? (
              tableData.map((row, i) => (
                <TableRow key={i} className='text-xs text-gray-700 cursor-default'>
                  <TableCell>
                    <div className='flex items-center'>
                      <div
                        className='transition-all rounded-full h-2 w-2 mr-2'
                        style={{ backgroundColor: getColor(row.value) }}
                      />
                      {row.value}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.count}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )
            : <>LOADING</>
          }
        </TableBody>
      </Table>
    </div>
  )
}
