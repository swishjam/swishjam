import NewCohort from '@/components/Cohorts/NewCohortView'
import PageWithHeader from '@/components/utils/PageWithHeader'

export default function NewOrganizationCohortPage() {
  return (
    <PageWithHeader title='New Organization Cohort'>
      <NewCohort profileType='organization' />
    </PageWithHeader>
  )
}