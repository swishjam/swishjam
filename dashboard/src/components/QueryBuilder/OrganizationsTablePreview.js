import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DottedUnderline from "@/components/utils/DottedUnderline";
import { humanizeVariable } from "@/lib/utils/misc";
import Link from "next/link";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import Pagination from "@/components/Pagination/Pagination";
import Table from "@/components/utils/Table";
import { UserX2Icon } from "lucide-react";

const rowForOrganization = ({ organization, queryFilterGroups }) => {
  let rows = [
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Avatar className="border border-slate-200">
          <AvatarFallback>{organization.initials() || organization.id().slice(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-4">
        <Link href={`/organizations/${organization.id()}`} className='hover:underline'>
          <span className="block font-medium text-gray-900">{organization.name()}</span>
        </Link>
      </div>
    </div>
  ]
  let dynamicRows = [];
  (queryFilterGroups || []).forEach(filterGroup => {
    filterGroup.query_filters.forEach(filter => {
      if (filter.type === 'QueryFilters::ProfileProperty') {
        const shouldInclude = !['name', 'organization_unique_identifier'].includes(filter.config.property_name) && !dynamicRows.includes(filter.config.property_name)
        if (shouldInclude) {
          dynamicRows.push(filter.config.property_name)
          rows.push(organization.metadata()[filter.config.property_name] ?? '-')
        }
      } else {
        const attrKey = `${filter.config.event_name.replace(/\s/g, '_').replace(/\./g, '_')}_count_for_organization`
        if (!dynamicRows.includes(attrKey)) {
          dynamicRows.push(attrKey)
          rows.push(organization.attributes()[attrKey] ?? '-')
        }
      }
    })
  })
  if (rows.length < 4) {
    rows.push(prettyDateTime(organization.createdAt()))
  }
  return rows;
}

const tableHeadersForQueryFilterGroups = queryFilterGroups => {
  let tableHeaders = [];
  if (queryFilterGroups) {
    tableHeaders = ['Organization']
    queryFilterGroups.forEach(filterGroup => {
      filterGroup.query_filters.forEach(filter => {
        if (filter.type === 'QueryFilters::ProfileProperty' && !['name', 'organization_unique_identifier'].includes(filter.config.property_name)) {
          tableHeaders.push(humanizeVariable(filter.config.property_name))
        } else if (filter.type === 'QueryFilters::EventCountForProfileOverTimePeriod') {
          tableHeaders.push(
            <>
              # of <DottedUnderline className='text-zinc-500 hover:text-zinc-700'>{filter.config.event_name}</DottedUnderline> events last <DottedUnderline className='text-zinc-500 hover:text-zinc-700'>{filter.config.num_lookback_days} days</DottedUnderline>
            </>
          )
        }
      })
    })
    if (tableHeaders.length < 4) {
      tableHeaders.push('Created At')
    }
  }
  return tableHeaders.filter((value, index, self) => self.indexOf(value) === index)
}

export default function OrganizationsTablePreview({ organizationProfilesCollection, queryFilterGroups, currentPageNum, lastPageNum, onNewPage }) {
  return (
    <>
      <Table
        headers={tableHeadersForQueryFilterGroups(queryFilterGroups)}
        rows={organizationProfilesCollection?.models()?.map(organization => rowForOrganization({ organization, queryFilterGroups }))}
        noDataMessage={
          <>
            <UserX2Icon className='h-12 w-12 mx-auto text-gray-400' />
            <p className='text-sm text-gray-700 text-center my-4'>No organizations currently match this cohort.</p>
          </>
        }
      />
      {lastPageNum && lastPageNum > 1 ? (
        <Pagination
          currentPage={currentPageNum}
          lastPageNum={lastPageNum}
          onNewPageSelected={onNewPage}
        />
      ) : <></>}
    </>
  )
}