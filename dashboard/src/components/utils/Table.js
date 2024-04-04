import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Skeleton } from '../ui/skeleton'

export default function TableComponent({ headers, rows, noDataMessage = 'No data.', numRowsWhileLoading = 10 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className='hover:bg-white'>
          {headers?.length > 0
            ? headers.map((header, i) => <TableHead key={i} className='cursor-default'>{header}</TableHead>)
            : Array.from({ length: 4 }).map((_, i) => <TableHead key={i} className='cursor-default'><Skeleton className='h-6 w-18' /></TableHead>)
          }
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
            Array.from({ length: numRowsWhileLoading }).map((_, i) => (
              <TableRow key={i}>
                {(headers?.length > 0 ? headers : Array.from({ length: 4 })).map((_, j) => (
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