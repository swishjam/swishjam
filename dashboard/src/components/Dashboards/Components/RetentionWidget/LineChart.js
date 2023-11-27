import { useState } from 'react'
import { LineChart, CartesianGrid, XAxis, Legend, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { COLORS } from '@/lib/utils/colorHelpers';

const weekFormatter = dateFormatterForGrouping('week');

const CustomTooltip = ({ active, payload, colorsDictionary, disabledCohortDates }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <span className='block text-sm font-medium'>Week {data.numPeriodsAfterCohort}</span>
          {Object.keys(data).filter(key => ![...disabledCohortDates, 'numPeriodsAfterCohort'].includes(key)).map(cohortDate => (
            isNaN(data[cohortDate]) ? null : (
              <div className='flex items-center justify-center w-fit px-2 py-1'>
                <div
                  className='rounded-full h-2 w-2 mr-2'
                  style={{ backgroundColor: colorsDictionary[cohortDate] }}
                />
                <span className='text-xs text-gray-700'>
                  {weekFormatter(cohortDate)} Cohort: <span className='font-medium'>{parseFloat(data[cohortDate]).toFixed(2)}%</span>
                </span>
              </div>
            )
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
  const [disabledCohortDates, setDisabledCohortDates] = useState([]);
  const [hoveredCohortLegendItemDate, setHoveredCohortLegendItemDate] = useState();

  // we assume these are always sorted, but not sure if that's a safe assumption
  const cohortPeriods = Object.keys(retentionCohorts);
  const allRetentionActivityPeriods = Object.keys(retentionCohorts[cohortPeriods[0]].activity_periods);

  const cohortColorDictionary = {};
  cohortPeriods.forEach((cohortPeriod, i) => cohortColorDictionary[cohortPeriod] = COLORS[i])

  // results in:
  // [ { numPeriodsAfterCohort: 0, '11-13-2023': 100 }, { numPeriodsAfterCohort: 1, '11-20-2023': 84.2 } ...]
  const lineChartData = allRetentionActivityPeriods.sort((a, b) => new Date(b) - new Date(a)).map((activityPeriodDate, i) => {
    const lineChartItem = { numPeriodsAfterCohort: i };
    cohortPeriods.forEach(cohortPeriodDate => {
      const cohortData = retentionCohorts[cohortPeriodDate];
      const retentionDataForCohortsRetentionPeriod = cohortData.activity_periods[activityPeriodDate]
      if (retentionDataForCohortsRetentionPeriod) {
        lineChartItem[cohortPeriodDate] = (retentionDataForCohortsRetentionPeriod.num_active_users / cohortData.num_users_in_cohort) * 100;
      }
    });
    return lineChartItem;
  });

  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <LineChart width={730} height={250} data={lineChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="numPeriodsAfterCohort"
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            tickLine={false}
            stroke='#ccc'
            strokeDasharray="3 3"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            tickFormatter={num => `${parseFloat(num).toFixed(0)}%`}
            domain={[0, 100]}
            tickLine={false}
            stroke='#ccc'
            strokeDasharray="3 3"
          // ticks={[25, 50, 75, 100]}
          />
          <Tooltip
            animationBegin={200}
            animationDuration={400}
            wrapperStyle={{ outline: "none" }}
            content={<CustomTooltip colorsDictionary={cohortColorDictionary} disabledCohortDates={disabledCohortDates} />}
            allowEscapeViewBox={{ x: false, y: true }}
            animationEasing='ease-in-out'
          />
          {cohortPeriods.map((cohortPeriod, i) => {
            return (
              <Line
                key={i}
                dataKey={cohortPeriod}
                type="monotone"
                stroke={cohortColorDictionary[cohortPeriod]}
                dot={{ r: 0 }}
                activeDot={{ r: 4 }}
                strokeWidth={hoveredCohortLegendItemDate === cohortPeriod ? 4 : 2}
                hide={disabledCohortDates.includes(cohortPeriod)}
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
                      onDisable={cohortDate => setDisabledCohortDates([...disabledCohortDates, cohortDate])}
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