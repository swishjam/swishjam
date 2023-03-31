import db from '@lib/db';
import { cwvMetricBounds } from '@/lib/cwvCalculations';

export default class PerformanceMetricsData {
  static async getPercentilesForAllMetrics({ projectKey, urlHost, urlPath, startTs, percentile }) {
    const query = `
      SELECT
        performance_metrics.metric_name AS name,
        COUNT(*) AS num_records,
        PERCENTILE_CONT(${parseFloat(percentile)}) WITHIN GROUP (ORDER BY performance_metrics.metric_value ASC) AS value
      FROM
        performance_metrics
      JOIN
        page_views ON performance_metrics.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        page_views.url_host = $2 AND
        page_views.url_path = $3 AND
        page_views.page_view_ts >= $4
      GROUP BY
        performance_metrics.metric_name
    `;
    const queryOptions = [projectKey, urlHost, urlPath, new Date(startTs)];
    return (await db.query(query, queryOptions)).rows;
  }

  static async getPercentileForMetric({ projectKey, metric, urlHost, urlPath, percentile = 0.75, startTs }) {
    if (!metric) throw new Error('Missing `metric` query param');
    if (!urlHost) throw new Error('Missing `url_host` query param');
    if (urlPath) {
      const query = `
        SELECT
          CAST(COUNT(*) AS int) AS num_records,
          PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS percentile_result
        FROM
          performance_metrics
        JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          performance_metrics.metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_host = $4 AND
          page_views.url_path = $5
      `;
      return (await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost), decodeURIComponent(urlPath)])).rows[0];
    } else {
      const query = `
        SELECT
          CAST(COUNT(*) AS int) AS num_records,
          PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS percentile_result
        FROM
          performance_metrics
        JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          performance_metrics.metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_host = $4
      `;
      return (await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost)])).rows[0];
    }
  }

  static async getPercentileTimeseriesDataForMetric({ projectKey, metric, startTs, urlHost, urlPath, percentile = 0.75 }) {
    if (!urlHost) throw new Error('Missing required parameter: `urlHost`');
    if (urlPath) {
      const query = `
        SELECT
          PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS percentile_result,
          date_trunc('day', page_views.page_view_ts) AS day
        FROM
          performance_metrics
        LEFT JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_path = $4 AND
          page_views.url_host = $5
        GROUP BY
          day
      `;
      const results = await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlPath), decodeURIComponent(urlHost)]);
      return results.rows;
    } else {
      const query = `
        SELECT
          PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS percentile_result,
          date_trunc('day', page_views.page_view_ts) AS day
        FROM
          performance_metrics
        LEFT JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_host = $4
        GROUP BY
          day
      `;
      const results = await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost)]);
      return results.rows;
    }
  };

  static async getTimeseriesgoodNeedsWorkBadChartDataDataForMetric({ projectKey, metric, urlHost, urlPath, startTs }) {
    if (!cwvMetricBounds[metric]) throw new Error(`Invalid metric: ${metric}`);
    if (!urlHost) throw new Error(`Missing required parameter: \`urlHost\``);
    if (urlPath) {
      const query = `
        SELECT
          metric_name,
          date_trunc('day', page_views.page_view_ts) AS date,
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
          AS int) AS num_needs_work_records,
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
          page_views.url_path = $5
        GROUP BY
          date, metric_name
        ORDER BY
          date
    `;
      return (await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost), decodeURIComponent(urlPath)])).rows;
    } else {
      const query = `
        SELECT
          metric_name,
          date_trunc('day', page_views.page_view_ts) AS date,
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
          AS int) AS num_needs_work_records,
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
          page_views.url_host = $4
        GROUP BY
          date, metric_name
        ORDER BY
          date
    `;
      return (await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost)])).rows;
    }
  };
}