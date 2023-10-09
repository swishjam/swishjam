import { useState } from 'react'
import { LineChart, CartesianGrid, XAxis, Legend, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';

const COLORS = [
  '#FF0000', // - Bright Red
  '#00FF00', // - Bright Green
  '#0000FF', // - Bright Blue
  '#FFFF00', // - Yellow
  '#FF00FF', // - Magenta
  '#00FFFF', // - Cyan
  '#FF6600', // - Orange
  '#6600FF', // - Purple
  '#006600', // - Dark Green
  '#FF0066', // - Pink
  '#6666FF', // - Light Blue
  '#FFCC00', // - Gold
  '#CC00FF', // - Violet
  '#00CCFF', // - Sky Blue
  '#FF9900', // - Amber
  '#009999', // - Teal
  '#9933FF', // - Lavender
  '#FF6699', // - Rose
  '#3366FF', // - Azure
  '#CC9900', // - Bronze
  '#9900CC', // - Indigo
  '#66FFCC', // - Aquamarine
  '#CC3366', // - Maroon
  '#0099FF', // - Capri
  '#FFCC66', // - Peach
  '#006699', // - Slate Blue
]

const weekFormatter = dateFormatterForGrouping('week');

const CustomTooltip = ({ active, payload, colorsDictionary }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <span className='block text-sm font-medium'>Week {data.numPeriodsAfterCohort}</span>
          {Object.keys(data).filter(key => key !== 'numPeriodsAfterCohort').map(cohortDate => (
            <div className='flex items-center justify-center w-fit px-2 py-1'>
              <div
                className='rounded-full h-2 w-2 mr-2'
                style={{ backgroundColor: colorsDictionary[cohortDate] }}
              />
              <span className='text-xs text-gray-700'>
                {weekFormatter(cohortDate)}: <span className='font-medium'>{parseFloat(data[cohortDate]).toFixed(2)}%</span>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  return null;
}

const LegendItem = ({ entry, onMouseOver, onMouseOut, isDisabled, onDisable, onEnable }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${isDisabled ? 'bg-gray-50 hover:bg-white' : 'hover:bg-gray-50'} inline-flex items-center justify-center w-fit cursor-pointer rounded-md transition-all px-2 py-1`}
      onClick={() => isDisabled ? onEnable(entry.value) : onDisable(entry.value)}
      onMouseOver={() => {
        setIsHovered(true)
        onMouseOver(entry.value);
      }}
      onMouseOut={() => {
        setIsHovered(false);
        onMouseOut();
      }}
    >
      <div
        className={`transition-all rounded-full h-2 w-2 mr-2 ${isDisabled && !isHovered ? 'bg-gray-300' : ''}`}
        style={{ backgroundColor: isDisabled && !isHovered ? '' : entry.color }}
      />
      <span className={`transition-all text-xs ${isDisabled && !isHovered ? 'text-gray-300' : 'text-gray-700'}`}>
        {weekFormatter(entry.value)}
      </span>
    </div>
  )
}

export default function RetentionLineChart({ retentionCohorts }) {
  if (retentionCohorts.length === 0) {
    return (
      <div className='text-center p-10 text-sm text-gray-700'>
        Retention data is only available for identified users, begin identifying users in order to get retention data.
      </div>
    )
  }
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
  });

  const [disabledCohortDates, setDisabledCohortDates] = useState([]);
  const [hoveredCohortLegendItemDate, setHoveredCohortLegendItemDate] = useState();

  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <LineChart width={730} height={250} data={lineChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
          // horizontalPoints={[25, 50, 75, 100]}
          />
          <XAxis
            dataKey="numPeriodsAfterCohort"
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          // label='Weeks'
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            tickFormatter={num => `${parseFloat(num).toFixed(0)}%`}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
          // ticks={[25, 50, 75, 100]}
          />
          <Tooltip
            animationBegin={200}
            animationDuration={400}
            wrapperStyle={{ outline: "none" }}
            content={<CustomTooltip colorsDictionary={cohortColorDictionary} />}
            allowEscapeViewBox={{ x: false, y: true }}
            animationEasing='ease-in-out'
          />
          {sortedCohorts.map((cohortData, i) => {
            return (
              <Line
                key={i}
                dataKey={cohortData.time_period}
                type="monotone"
                stroke={cohortColorDictionary[cohortData.time_period]}
                dot={{ r: 0 }}
                activeDot={{ r: 4 }}
                strokeWidth={hoveredCohortLegendItemDate === cohortData.time_period ? 4 : 2}
                hide={disabledCohortDates.includes(cohortData.time_period)}
              />
            )
          })}
          <Legend
            content={({ payload }) => {
              return (
                <div className='flex flex-wrap items-center justify-center gap-4 border border-gray-200 px-4 py-2 mt-4 rounded'>
                  {payload.map((entry, index) => (
                    <LegendItem
                      key={index}
                      entry={entry}
                      isDisabled={disabledCohortDates.includes(entry.value)}
                      onMouseOver={setHoveredCohortLegendItemDate}
                      onMouseOut={() => setHoveredCohortLegendItemDate()}
                      onEnable={cohortDate => {
                        const newDisabledCohorts = disabledCohortDates.filter(date => date !== cohortDate)
                        setDisabledCohortDates(newDisabledCohorts);
                      }}
                      onDisable={cohortDate => {
                        setDisabledCohortDates([...disabledCohortDates, cohortDate])
                      }}
                    />
                  ))}
                </div>
              )
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}