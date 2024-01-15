import { Card, CardContent } from '@/components/ui/card';
import { COLORS } from '@/lib/utils/colorHelpers';
import { LineChart, CartesianGrid, XAxis, Legend, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { LONG_MONTHS } from '@/lib/utils/timeHelpers';
import { useState } from 'react'

const monthFormatter = d => LONG_MONTHS[new Date(d).getUTCMonth()];

const CustomTooltip = ({ active, payload, colorsDictionary, disabledCohortDates }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    const enabledCohortDates = Object.keys(data).filter(key => ![...disabledCohortDates, 'numPeriodsAfterCohort'].includes(key));
    const sortedEnabledCohortDates = enabledCohortDates.sort((a, b) => new Date(a) - new Date(b));

    return (
      <Card className="z-[50000] bg-white">
        <CardContent className="py-2">
          <span className='block text-sm font-medium'>Week {data.numPeriodsAfterCohort}</span>
          {sortedEnabledCohortDates.map(cohortDate => (
            isNaN(data[cohortDate]) ? null : (
              <div className='flex items-center justify-center w-fit px-2 py-1' key={cohortDate}>
                <div
                  className='rounded-full h-2 w-2 mr-2'
                  style={{ backgroundColor: colorsDictionary[cohortDate] }}
                />
                <span className='text-xs text-gray-700'>
                  {monthFormatter(cohortDate)} Cohort: <span className='font-medium'>{parseFloat(data[cohortDate]).toFixed(2)}%</span>
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
        {monthFormatter(entry.value)}
      </span>
    </div>
  )
}

export default function RetentionLineChart({ retentionCohorts }) {
  if (!retentionCohorts) return;
  const [disabledCohortDates, setDisabledCohortDates] = useState([]);
  const [hoveredCohortLegendItemDate, setHoveredCohortLegendItemDate] = useState();

  const cohortDates = Object.keys(retentionCohorts).sort((a, b) => new Date(a) - new Date(b));

  const cohortColorDictionary = {};
  cohortDates.forEach((cohortPeriod, i) => cohortColorDictionary[cohortPeriod] = COLORS[i])

  // results in:
  // { 0: { '11-13-2023': 100, '11-20'2023': 100 }}, 1: {'11-20-2023': 84.2 } ...}
  let lineChartDict = {}
  Object.keys(retentionCohorts).map(cohortDate => {
    const { retention_periods, starting_mrr_in_cents } = retentionCohorts[cohortDate];
    retention_periods.forEach(({ mrr_in_cents }, i) => {
      lineChartDict[i] = lineChartDict[i] || {}
      if (starting_mrr_in_cents === 0) {
        lineChartDict[i][cohortDate] = 0;
      } else {
        lineChartDict[i][cohortDate] = (mrr_in_cents / starting_mrr_in_cents) * 100
      }
    })
  })

  const lineChartData = Object.keys(lineChartDict).map(numPeriodsAfterCohort => {
    return {
      numPeriodsAfterCohort: parseInt(numPeriodsAfterCohort),
      ...lineChartDict[numPeriodsAfterCohort]
    }
  })

  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <LineChart width={730} height={250} data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          {cohortDates.map((cohortDate, i) => {
            return (
              <Line
                key={i}
                dataKey={cohortDate}
                type="monotone"
                stroke={cohortColorDictionary[cohortDate]}
                dot={{ r: 0 }}
                activeDot={{ r: 4 }}
                strokeWidth={hoveredCohortLegendItemDate === cohortDate ? 4 : 2}
                hide={disabledCohortDates.includes(cohortDate)}
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