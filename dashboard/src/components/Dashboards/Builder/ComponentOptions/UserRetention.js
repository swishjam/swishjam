import RetentionWidget from '@/components/Dashboards/Components/RetentionWidget'

const DUMMY_RETENTION_DATA = {
  '2023-07-10': {
    'num_users_in_cohort': 100,
    'activity_periods': {
      '2023-07-10': 100,
      '2023-07-17': 90,
      '2023-07-24': 80,
      '2023-07-31': 70,
      '2023-08-07': 60,
    }
  },
  '2023-07-17': {
    'num_users_in_cohort': 50,
    'activity_periods': {
      '2023-07-17': 50,
      '2023-07-24': 46,
      '2023-07-31': 42,
      '2023-08-07': 38,
      '2023-08-14': 32,
    }
  },
  '2023-07-24': {
    'num_users_in_cohort': 100,
    'activity_periods': {
      '2023-07-24': 100,
      '2023-07-31': 100,
      '2023-08-07': 95,
      '2023-08-14': 90,
      '2023-08-21': 85,
    }
  },
  '2023-07-31': {
    'num_users_in_cohort': 75,
    'activity_periods': {
      '2023-07-31': 73,
      '2023-08-07': 50,
      '2023-08-14': 40,
      '2023-08-21': 30,
      '2023-08-28': 30,
    }
  },
  '2023-08-07': {
    'num_users_in_cohort': 100,
    'activity_periods': {
      '2023-08-07': 100,
      '2023-08-14': 100,
      '2023-08-21': 100,
      '2023-08-28': 95,
      '2023-09-04': 80,
    }
  },
}

export default function RetentionWidgetOption({ onClick }) {
  return (
    <div className='cursor-pointer hover:scale-105 transition-all' style={{ width: '400px' }} onClick={onClick}>
      <div className='w-full'>
        <RetentionWidget retentionCohorts={DUMMY_RETENTION_DATA} />
      </div>
    </div>
  )
}