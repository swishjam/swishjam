import { cwvMetricBounds } from '@/lib/cwvCalculations';
import db from '@lib/db';

export default async ({ projectKey, metric, deviceTypes, groupBy, urlHost, urlPath }) => {
  if (!cwvMetricBounds[metric]) throw new Error(`Invalid metric: ${metric}`);
  if (!urlHost) throw new Error(`Missing required parameter: \`urlHost\``);
  if (!deviceTypes || deviceTypes === 'all') deviceTypes = ['desktop', 'mobile', 'tablet', 'phablet'];
  const oneDay = 1000 * 60 * 60 * 24;
  const startTimestamp = groupBy === 'month' 
                          ? new Date(Date.now() - (oneDay * 30 * 5))
                          : groupBy === 'week' 
                            ? new Date(Date.now() - (oneDay * 7 * 5))
                            : new Date(Date.now() - (oneDay * 7));
  if (urlPath) {
    const query = `
        SELECT
          metric_name,
          date_trunc('${groupBy}', page_views.page_view_ts) AS date,
          CAST(COUNT(*) AS int) AS total_num_records,
          CAST(
            COUNT(CASE WHEN metric_value <= ${cwvMetricBounds[metric].good} THEN 1 END)
          AS int) AS num_good_records,
          CAST(
            COUNT(
              CASE WHEN 
                metric_value > ${cwvMetricBounds[metric].good} AND 
                metric_value <= ${cwvMetricBounds[metric].medium} 
              THEN 1 END
            )
          AS int) AS num_needs_improvement_records,
          CAST(
            COUNT(CASE WHEN metric_value > ${cwvMetricBounds[metric].medium} THEN 1 END) 
          AS int) AS num_bad_records
        FROM
          performance_metrics
        LEFT JOIN 
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          performance_metrics.project_key = $1 AND
          metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_host = $4 AND
          page_views.url_path = $5 AND
          page_views.device_type IN (${deviceTypes.map((_, i) => `$${i + 6}`).join(',')})
        GROUP BY
          date, metric_name
        ORDER BY
          date
    `;
    return (await db.query(query, [projectKey, metric, new Date(startTimestamp), decodeURIComponent(urlHost), decodeURIComponent(urlPath), ...deviceTypes])).rows;
  } else {
    const query = `
        SELECT
          metric_name,
          date_trunc('${groupBy}', page_views.page_view_ts) AS date,
          CAST(COUNT(*) AS int) AS total_num_records,
          CAST(
            COUNT(CASE WHEN metric_value <= ${cwvMetricBounds[metric].good} THEN 1 END)
          AS int) AS num_good_records,
          CAST(
            COUNT(
              CASE WHEN 
                metric_value > ${cwvMetricBounds[metric].good} AND 
                metric_value <= ${cwvMetricBounds[metric].medium} 
              THEN 1 END
            )
          AS int) AS num_needs_improvement_records,
          CAST(
            COUNT(CASE WHEN metric_value > ${cwvMetricBounds[metric].medium} THEN 1 END) 
          AS int) AS num_bad_records
        FROM
          performance_metrics
        LEFT JOIN 
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          performance_metrics.project_key = $1 AND
          metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_host = $4 AND
          page_views.device_type IN (${deviceTypes.map((_, i) => `$${i + 5}`).join(',')})
        GROUP BY
          date, metric_name
        ORDER BY
          date
    `;
    return (await db.query(query, [projectKey, metric, new Date(startTimestamp), decodeURIComponent(urlHost), ...deviceTypes])).rows;
  }
}