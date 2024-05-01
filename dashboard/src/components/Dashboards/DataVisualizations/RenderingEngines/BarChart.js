import BarChart from "@/components/Dashboards/DataVisualizations/BarChart";
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { humanizeVariable } from "@/lib/utils/misc";
import { useEffect, useState } from "react";
import QueryDetailsComposer from "../utils/QueryDetailsComposer";

export default function BarChartRenderingEngine({
  aggregationMethod,
  dataSource,
  emptyValuePlaceholder,
  event,
  excludeEmptyValues,
  id,
  maxRankingToNotBeConsideredOther,
  property,
  subtitle,
  timeframe,
  title,
  whereClauseGroups = [],
  ...settings
}) {
  const [barChartResults, setBarChartResults] = useState();

  const getData = async () => {
    setBarChartResults();
    if (event && property) {
      const { bar_chart_data, grouped_by } = await SwishjamAPI.DataViz.barChart({
        event,
        property,
        aggregation_method: aggregationMethod,
        query_groups: JSON.stringify(whereClauseGroups || []),
        max_ranking_to_not_be_considered_other: maxRankingToNotBeConsideredOther,
        empty_value_placeholder: emptyValuePlaceholder,
        exclude_empty_values: excludeEmptyValues,
        timeframe,
        data_source: dataSource
      });
      setBarChartResults({ data: bar_chart_data, groupedBy: grouped_by });
    }
  }

  useEffect(() => {
    getData();
  }, [event, property, aggregationMethod, timeframe, maxRankingToNotBeConsideredOther, dataSource, excludeEmptyValues, emptyValuePlaceholder, JSON.stringify(whereClauseGroups.map(group => group.queries))]);

  return (
    <BarChart
      dataVisualizationId={id}
      data={barChartResults?.data}
      groupedBy={barChartResults?.groupedBy}
      includeCard={false}
      QueryDetails={<QueryDetailsComposer event={event} property={property} aggregationMethod={aggregationMethod} whereClauseGroups={whereClauseGroups} />}
      subtitle={subtitle}
      title={title}
      valueHeader={property && humanizeVariable(property.replace(/User./i, 'User\'s '))}
      {...settings}
    />
  )
}
