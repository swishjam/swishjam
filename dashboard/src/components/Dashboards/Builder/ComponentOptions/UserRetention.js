import RetentionWidget from '@/components/Dashboards/Components/RetentionWidget'

const DUMMY_RETENTION_DATA = [
  {
    "id": "d210a96c-5ac1-462c-a611-1ef8c0cef68b",
    "time_granularity": "week",
    "time_period": "2023-07-10",
    "num_users_in_cohort": 100,
    "retention_cohort_activity_periods": [
      {
        "time_period": "2023-07-10",
        "num_active_users": 100,
        "num_periods_after_cohort": 0
      },
      {
        "time_period": "2023-07-17",
        "num_active_users": 90,
        "num_periods_after_cohort": 1
      },
      {
        "time_period": "2023-07-24",
        "num_active_users": 80,
        "num_periods_after_cohort": 2
      },
      {
        "time_period": "2023-07-31",
        "num_active_users": 70,
        "num_periods_after_cohort": 3
      },
      {
        "time_period": "2023-08-07",
        "num_active_users": 60,
        "num_periods_after_cohort": 4
      },
      {
        "time_period": "2023-08-14",
        "num_active_users": 50,
        "num_periods_after_cohort": 5
      },
      {
        "time_period": "2023-08-21",
        "num_active_users": 40,
        "num_periods_after_cohort": 6
      },
      {
        "time_period": "2023-08-28",
        "num_active_users": 30,
        "num_periods_after_cohort": 7
      },
      {
        "time_period": "2023-09-04",
        "num_active_users": 20,
        "num_periods_after_cohort": 8
      },
      {
        "time_period": "2023-09-11",
        "num_active_users": 10,
        "num_periods_after_cohort": 9
      },
      {
        "time_period": "2023-09-18",
        "num_active_users": 5,
        "num_periods_after_cohort": 10
      },
      {
        "time_period": "2023-09-25",
        "num_active_users": 0,
        "num_periods_after_cohort": 11
      }
    ]
  },
  {
    "id": "4664f4dd-a7a9-4e0e-a540-6642ccaaabfa",
    "time_granularity": "week",
    "time_period": "2023-07-17",
    "num_users_in_cohort": 50,
    "retention_cohort_activity_periods": [
      {
        "time_period": "2023-07-17",
        "num_active_users": 50,
        "num_periods_after_cohort": 0
      },
      {
        "time_period": "2023-07-24",
        "num_active_users": 46,
        "num_periods_after_cohort": 1
      },
      {
        "time_period": "2023-07-31",
        "num_active_users": 42,
        "num_periods_after_cohort": 2
      },
      {
        "time_period": "2023-08-07",
        "num_active_users": 38,
        "num_periods_after_cohort": 3
      },
      {
        "time_period": "2023-08-14",
        "num_active_users": 32,
        "num_periods_after_cohort": 4
      },
      {
        "time_period": "2023-08-21",
        "num_active_users": 28,
        "num_periods_after_cohort": 5
      },
      {
        "time_period": "2023-08-28",
        "num_active_users": 23,
        "num_periods_after_cohort": 6
      },
      {
        "time_period": "2023-09-04",
        "num_active_users": 20,
        "num_periods_after_cohort": 7
      },
      {
        "time_period": "2023-09-11",
        "num_active_users": 15,
        "num_periods_after_cohort": 8
      },
      {
        "time_period": "2023-09-18",
        "num_active_users": 10,
        "num_periods_after_cohort": 9
      },
      {
        "time_period": "2023-09-25",
        "num_active_users": 10,
        "num_periods_after_cohort": 10
      },
      {
        "time_period": "2023-10-02",
        "num_active_users": 5,
        "num_periods_after_cohort": 11
      },
      {
        "time_period": "2023-10-09",
        "num_active_users": 5,
        "num_periods_after_cohort": 12
      }
    ]
  },
  {
    "id": "0fd02399-b776-49a6-a094-0130649679fa",
    "time_granularity": "week",
    "time_period": "2023-07-24",
    "num_users_in_cohort": 100,
    "retention_cohort_activity_periods": [
      {
        "time_period": "2023-07-24",
        "num_active_users": 100,
        "num_periods_after_cohort": 0
      },
      {
        "time_period": "2023-07-31",
        "num_active_users": 100,
        "num_periods_after_cohort": 1
      },
      {
        "time_period": "2023-08-07",
        "num_active_users": 95,
        "num_periods_after_cohort": 2
      },
      {
        "time_period": "2023-08-14",
        "num_active_users": 90,
        "num_periods_after_cohort": 3
      },
      {
        "time_period": "2023-08-21",
        "num_active_users": 85,
        "num_periods_after_cohort": 4
      },
      {
        "time_period": "2023-08-28",
        "num_active_users": 80,
        "num_periods_after_cohort": 5
      },
      {
        "time_period": "2023-09-04",
        "num_active_users": 75,
        "num_periods_after_cohort": 6
      },
      {
        "time_period": "2023-09-11",
        "num_active_users": 70,
        "num_periods_after_cohort": 7
      },
      {
        "time_period": "2023-09-18",
        "num_active_users": 65,
        "num_periods_after_cohort": 8
      },
      {
        "time_period": "2023-09-25",
        "num_active_users": 65,
        "num_periods_after_cohort": 9
      },
      {
        "time_period": "2023-10-02",
        "num_active_users": 65,
        "num_periods_after_cohort": 10
      },
      {
        "time_period": "2023-10-09",
        "num_active_users": 60,
        "num_periods_after_cohort": 11
      }
    ]
  },
  {
    "id": "864a4b02-cc24-44ad-a214-b427b5e72ed9",
    "time_granularity": "week",
    "time_period": "2023-07-31",
    "num_users_in_cohort": 75,
    "retention_cohort_activity_periods": [
      {
        "time_period": "2023-07-31",
        "num_active_users": 73,
        "num_periods_after_cohort": 0
      },
      {
        "time_period": "2023-08-07",
        "num_active_users": 50,
        "num_periods_after_cohort": 1
      },
      {
        "time_period": "2023-08-14",
        "num_active_users": 40,
        "num_periods_after_cohort": 2
      },
      {
        "time_period": "2023-08-21",
        "num_active_users": 30,
        "num_periods_after_cohort": 3
      },
      {
        "time_period": "2023-08-28",
        "num_active_users": 30,
        "num_periods_after_cohort": 4
      },
      {
        "time_period": "2023-09-04",
        "num_active_users": 25,
        "num_periods_after_cohort": 5
      },
      {
        "time_period": "2023-09-11",
        "num_active_users": 20,
        "num_periods_after_cohort": 6
      },
      {
        "time_period": "2023-09-18",
        "num_active_users": 20,
        "num_periods_after_cohort": 7
      },
      {
        "time_period": "2023-09-25",
        "num_active_users": 15,
        "num_periods_after_cohort": 8
      },
      {
        "time_period": "2023-10-02",
        "num_active_users": 15,
        "num_periods_after_cohort": 9
      },
      {
        "time_period": "2023-10-09",
        "num_active_users": 10,
        "num_periods_after_cohort": 10
      }
    ]
  },
  {
    "id": "bf1fdccb-2997-4267-a981-414316de0d7c",
    "time_granularity": "week",
    "time_period": "2023-08-07",
    "num_users_in_cohort": 100,
    "retention_cohort_activity_periods": [
      {
        "time_period": "2023-08-07",
        "num_active_users": 100,
        "num_periods_after_cohort": 0
      },
      {
        "time_period": "2023-08-14",
        "num_active_users": 100,
        "num_periods_after_cohort": 1
      },
      {
        "time_period": "2023-08-21",
        "num_active_users": 100,
        "num_periods_after_cohort": 2
      },
      {
        "time_period": "2023-08-28",
        "num_active_users": 95,
        "num_periods_after_cohort": 3
      },
      {
        "time_period": "2023-09-04",
        "num_active_users": 80,
        "num_periods_after_cohort": 4
      },
      {
        "time_period": "2023-09-11",
        "num_active_users": 70,
        "num_periods_after_cohort": 5
      },
      {
        "time_period": "2023-09-18",
        "num_active_users": 30,
        "num_periods_after_cohort": 6
      },
      {
        "time_period": "2023-09-25",
        "num_active_users": 30,
        "num_periods_after_cohort": 7
      },
      {
        "time_period": "2023-10-02",
        "num_active_users": 20,
        "num_periods_after_cohort": 8
      },
      {
        "time_period": "2023-10-09",
        "num_active_users": 10,
        "num_periods_after_cohort": 9
      }
    ]
  },
]

export default function RetentionWidgetOption({ onClick }) {
  return (
    <div className='cursor-pointer hover:scale-105 transition-all' style={{ width: '400px' }} onClick={onClick}>
      <div className='w-full'>
        <RetentionWidget retentionCohorts={DUMMY_RETENTION_DATA} />
      </div>
    </div>
  )
}