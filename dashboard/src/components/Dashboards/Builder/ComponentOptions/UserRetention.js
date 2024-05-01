import RetentionWidget from '@/components/Dashboards/DataVisualizations/RetentionWidget'

const DUMMY_RETENTION_DATA = {
  '2023-07-10': {
    'num_users_in_cohort': 100,
    'activity_periods': {
      '2023-07-10': {
        'num_active_users': 100,
        'num_periods_after_cohort': 0
      },
      '2023-07-17': {
        'num_active_users': 50,
        'num_periods_after_cohort': 1
      },
      '2023-07-24': {
        'num_active_users': 25,
        'num_periods_after_cohort': 2
      },
      '2023-07-31': {
        'num_active_users': 12,
        'num_periods_after_cohort': 3
      },
    }
  },
  '2023-07-17': {
    'num_users_in_cohort': 50,
    'activity_periods': {
      '2023-07-17': {
        'num_active_users': 50,
        'num_periods_after_cohort': 0
      },
      '2023-07-24': {
        'num_active_users': 25,
        'num_periods_after_cohort': 1
      },
      '2023-07-31': {
        'num_active_users': 12,
        'num_periods_after_cohort': 2
      },
    }
  },
  '2023-07-24': {
    'num_users_in_cohort': 25,
    'activity_periods': {
      '2023-07-24': {
        'num_active_users': 25,
        'num_periods_after_cohort': 0
      },
      '2023-07-31': {
        'num_active_users': 12,
        'num_periods_after_cohort': 1
      },
    }
  },
  '2023-07-31': {
    'num_users_in_cohort': 12,
    'activity_periods': {
      '2023-07-31': {
        'num_active_users': 12,
        'num_periods_after_cohort': 0
      },
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