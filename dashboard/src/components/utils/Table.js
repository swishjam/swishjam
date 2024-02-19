import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Skeleton } from '../ui/skeleton'

export default function TableComponent({ headers, rows, noDataMessage = 'No data.' }) {
  console.log(rows)
  return (
    <Table>
      <TableHeader>
        <TableRow className='hover:bg-white'>
          {headers.map((header, i) => (
            <TableHead key={i} className='cursor-default'>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows
          ? rows.length > 0
            ? (
              rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j} className='cursor-default'>{cell}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length} className='cursor-default text-center text-gray-700'>
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )
          : (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {headers.map((_, j) => (
                  <TableCell key={j} className='cursor-default'>
                    <Skeleton className='h-6 w-18' />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )
        }
      </TableBody>
    </Table>
  )
}