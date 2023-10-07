import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';

const COLORS = [
  '#FF5733', '#FDE200', '#00FDF9', '#00FD6B', '#008EFD', '#5400FD', '#E600FD',
  '#FD0000', '#C35454', '#92E9DB', '#929293', '#846035', '#35844C',
]

const weekFormatter = dateFormatterForGrouping('week');

const CustomTooltip = ({ active, payload, label, colorsDictionary }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <span className='block text-sm font-medium'>Week {data.numPeriodsAfterCohort}</span>
          {Object.keys(data).filter(key => key !== 'numPeriodsAfterCohort').map(cohortDate => {
            return (
              <span className='block text-xs' style={{ color: colorsDictionary[cohortDate] }}>
                {weekFormatter(cohortDate)}: {parseFloat(data[cohortDate]).toFixed(2)}%
              </span>
            )
          })}
        </CardContent>
      </Card>
    );
  }
  return null;
}

export default function RetentionLineChart({ retentionCohorts }) {
  const sortedCohorts = retentionCohorts.sort((a, b) => new Date(a.time_period) - new Date(b.time_period));
  const allRetentionActivityPeriods = sortedCohorts[0].retention_cohort_activity_periods;

  const cohortColorDictionary = {};
  sortedCohorts.forEach((cohort, i) => {
    cohortColorDictionary[cohort.time_period] = COLORS[i];
  })

  const lineChartData = Array.from({ length: allRetentionActivityPeriods.length }).map((_, i) => {
    const lineChartItem = { numPeriodsAfterCohort: i };
    retentionCohorts.forEach(({ num_users_in_cohort, retention_cohort_activity_periods, time_period: cohortDate }) => {
      const retentionDataForCohortsRetentionPeriod = retention_cohort_activity_periods.find(activityPeriodData => activityPeriodData.num_periods_after_cohort === i);
      if (retentionDataForCohortsRetentionPeriod) {
        lineChartItem[cohortDate] = (retentionDataForCohortsRetentionPeriod.num_active_users / num_users_in_cohort) * 100;
      }
    });
    return lineChartItem;
  })

  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <LineChart width={730} height={250} data={lineChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="numPeriodsAfterCohort"
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            tickFormatter={num => `${parseFloat(num).toFixed(0)}%`}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            animationBegin={200}
            animationDuration={400}
            wrapperStyle={{ outline: "none" }}
            content={<CustomTooltip colorsDictionary={cohortColorDictionary} />}
            allowEscapeViewBox={{ x: false, y: true }}
            animationEasing='ease-in-out'
          />
          {/* <Legend
            content={({ payload }) => {
              return (
                <div className='grid'>
                  {payload.map((entry, index) => (
                    <div
                      className='inline'
                      style={{ fontSize: 12, color: entry.color }}
                      key={`item-${index}`}
                    >
                      {weekFormatter(entry.value)}
                    </div>
                  ))}
                </div>
              )
            }}
          /> */}
          {sortedCohorts.map((cohortData, i) => (
            <Line
              key={i}
              dataKey={cohortData.time_period}
              type="monotone"
              stroke={cohortColorDictionary[cohortData.time_period]}
              dot={{ r: 0 }}
              activeDot={{ r: 2 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}