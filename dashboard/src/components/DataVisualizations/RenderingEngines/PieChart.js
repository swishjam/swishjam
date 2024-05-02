import { useState, useEffect } from 'react';
import PieChartVisualization from '@/components/DataVisualizations/PieChart';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import QueryDetailsComposer from '../utils/QueryDetailsComposer';

export default function PieChart({
  aggregationMethod,
  dataSource,
  emptyValuePlaceholder,
  excludeEmptyValues,
  event,
  maxRankingToNotBeConsideredOther,
  property,
  subtitle,
  timeframe,
  title,
  whereClauseGroups,
  ...settings
}) {
  const [pieChartData, setPieChartData] = useState();

  // TODO: figure out why useEffect is getting triggered on additional setting changes...
  useEffect(() => {
    setPieChartData();
    SwishjamAPI.DataViz.pieChart({
      event,
      property,
      aggregation_method: aggregationMethod,
      query_groups: JSON.stringify(whereClauseGroups || []),
      max_ranking_to_not_be_considered_other: maxRankingToNotBeConsideredOther,
      empty_value_placeholder: emptyValuePlaceholder,
      exclude_empty_values: excludeEmptyValues,
      timeframe,
      data_source: dataSource
    }).then(setPieChartData)
  }, [event, property, dataSource, whereClauseGroups, maxRankingToNotBeConsideredOther, emptyValuePlaceholder, excludeEmptyValues, timeframe]);

  return (
    <PieChartVisualization
      {...settings}
      data={pieChartData}
      dataKey={aggregationMethod}
      nameKey={property}
      includeCard={false}
      QueryDetails={<QueryDetailsComposer event={event} property={property} aggregationMethod={aggregationMethod} whereClauseGroups={whereClauseGroups} />}
      title={title}
      subtitle={subtitle}
    />
  )
}