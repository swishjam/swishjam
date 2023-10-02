import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid'
import PaginationItem from './PaginationItem';

export default function Pagination({ currentPage, lastPageNum, onNewPageSelected }) {
  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
      <div className="-mt-px flex w-0 flex-1">
        <PaginationItem 
          enabled={currentPage > 1} 
          onSelect={() => onNewPageSelected(currentPage - 1)}
          content={
            <>
              <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              Previous
            </>
          }
        />
      </div>
      <div className="flex gap-x-4">
        {currentPage > 2 && (
          <>
            <PaginationItem enabled={true} content={1} onSelect={() => onNewPageSelected(1)} />
            <span className="inline-flex items-center border-t-2 border-transparent px-0 pt-4 text-sm font-medium text-gray-500">
              ...
            </span>
          </>
        )}
        {currentPage === 1 
          ? (
            <>
              <PaginationItem isActive={true} content={1} />
              <PaginationItem enabled={true} content={2} onSelect={() => onNewPageSelected(2)} />
              <PaginationItem enabled={true} content={3} onSelect={() => onNewPageSelected(3)} />
            </>
          ) : (
            <>
              {currentPage === lastPageNum && (
                <PaginationItem enabled={true} content={currentPage - 2} onSelect={() => onNewPageSelected(currentPage - 2)} />
              )}
              <PaginationItem enabled={true} content={currentPage - 1} onSelect={() => onNewPageSelected(currentPage - 1)} />
              <PaginationItem isActive={true} content={currentPage} />
              {currentPage !== lastPageNum && (
                <PaginationItem enabled={true} content={currentPage + 1} onSelect={() => onNewPageSelected(currentPage + 1)} />
              )}
            </>
          )
        }
        {currentPage < lastPageNum - 1 && (
          <>
            <span className="inline-flex items-center border-t-2 border-transparent px-0 pt-4 text-sm font-medium text-gray-500">
              ...
            </span>
            <PaginationItem enabled={true} content={lastPageNum} onSelect={() => onNewPageSelected(lastPageNum)} />
          </>
        )}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <PaginationItem
          enabled={currentPage < lastPageNum}
          onSelect={() => onNewPageSelected(currentPage + 1)}
          content={
            <>
              Next
              <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
            </>
          }
        />
      </div>
    </nav>
  )
}
