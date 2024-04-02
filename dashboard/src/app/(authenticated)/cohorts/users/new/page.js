import NewCohort from '@/components/Cohorts/NewCohortView'
import PageWithHeader from '@/components/utils/PageWithHeader'

export default function NewOrganizationCohortPage() {
  return (
    <PageWithHeader title='New User Cohort'>
      <NewCohort profileType='user' />
    </PageWithHeader>
  )
}