import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DottedUnderline from "@/components/utils/DottedUnderline";
import { humanizeVariable } from "@/lib/utils/misc";
import Link from "next/link";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import Pagination from "@/components/Pagination/Pagination";
import Table from "@/components/utils/Table";
import { UserX2Icon } from "lucide-react";

const rowForUser = ({ user, queryFilterGroups }) => {
  let rows = [
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Avatar className="border border-slate-200">
          <AvatarImage src={user.gravatarUrl()} />
          <AvatarFallback>{user.initials() || user.id().slice(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-4">
        <Link href={`/users/${user.id()}`} className='hover:underline'>
          <span className="block font-medium text-gray-900">{user.fullName() || user.email() || `Anonymous User ${user.anonymousUserIdDisplay()}`}</span>
          {user.fullName() && user.email() ? <span className="text-gray-500">{user.email()}</span> : null}
        </Link>
      </div>
    </div>,
    ...[].concat(...(queryFilterGroups || []).map(filterGroup => {
      return filterGroup.query_filters.map(filter => {
        if (filter.type === 'QueryFilters::UserProperty') {
          if (filter.config.property_name === 'email') {
            return user.email()
          } else if (filter.config.property_name === 'user_unique_identifier') {
            return user.uniqueIdentifier()
          } else {
            return user.metadata()[filter.config.property_name] || '-'
          }
        } else {
          return user.attributes()[`${filter.config.event_name.replace(/\s/g, '_')}_count_for_user`]
        }
      })
    })),
  ]
  if (rows.length < 4) {
    rows.push(prettyDateTime(user.createdAt()))
  }
  return rows;
}

const tableHeadersForQueryFilterGroups = queryFilterGroups => {
  let tableHeaders = [];
  if (queryFilterGroups) {
    tableHeaders = ['User']
    queryFilterGroups.forEach(filterGroup => {
      filterGroup.query_filters.forEach(filter => {
        if (filter.type === 'QueryFilters::UserProperty') {
          tableHeaders.push(humanizeVariable(filter.config.property_name))
        } else if (filter.type === 'QueryFilters::EventCountForUserOverTimePeriod') {
          tableHeaders.push(
            <>
              # of <DottedUnderline className='text-zinc-500 hover:text-zinc-700'>{filter.config.event_name}</DottedUnderline> events last <DottedUnderline className='text-zinc-500 hover:text-zinc-700'>{filter.config.num_lookback_days} days</DottedUnderline>
            </>
          )
        }
      })
    })
    if (queryFilterGroups.reduce((acc, group) => acc + group.query_filters.length, 0) < 3) {
      tableHeaders.push('Created At')
    }
  }
  return tableHeaders;
}

export default function UsersTablePreview({ userProfilesCollection, queryFilterGroups, currentPageNum, lastPageNum, onNewPage }) {
  return (
    <>
      <Table
        headers={tableHeadersForQueryFilterGroups(queryFilterGroups)}
        rows={userProfilesCollection.models().map(user => rowForUser({ user, queryFilterGroups }))}
        noDataMessage={
          <>
            <UserX2Icon className='h-12 w-12 mx-auto text-gray-400' />
            <p className='text-sm text-gray-700 text-center my-4'>No users currently match this segment.</p>
          </>
        }
      />
      {
        userProfilesCollection.models().length > 0 && (
          <Pagination
            currentPage={currentPageNum}
            lastPageNum={lastPageNum}
            onNewPageSelected={onNewPage}
          />
        )}
    </>
  )
}