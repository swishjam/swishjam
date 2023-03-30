import db from '@lib/db';
// import { cwvMetricBounds } from '@/lib/cwvCalculations';

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
          COUNT(*) AS num_records,
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
          COUNT(*) AS num_records,
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
          date_trunc('hour', page_views.page_view_ts) AS hour,
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
          day, hour
      `;
      const results = await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlPath), decodeURIComponent(urlHost)]);
      return results.rows;
    } else {
      const query = `
        SELECT
          PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS percentile_result,
          date_trunc('hour', page_views.page_view_ts) AS hour,
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
          day, hour
      `;
      const results = await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost)]);
      return results.rows;
    }
  };

  // static async getAveragesForAllMetrics({ projectKey, urlPath, urlHost, startTs }) {
  //   const query = `
  //     SELECT
  //       performance_metrics.metric_name AS name,
  //       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY performance_metrics.metric_value ASC) AS average,
  //       COUNT(*) AS num_records
  //     FROM
  //       performance_metrics
  //     JOIN
  //       page_views ON performance_metrics.page_view_uuid = page_views.uuid
  //     WHERE
  //       page_views.project_key = $1 AND
  //       page_views.url_host = $2 AND
  //       page_views.url_path = $3 AND
  //       page_views.page_view_ts >= $4
  //     GROUP BY
  //       performance_metrics.metric_name
  //   `;
  //   const queryOptions = [projectKey, urlHost, urlPath, new Date(startTs)];
  //   return (await db.query(query, queryOptions)).rows;
  // }
  //
  // static async getAverageMetric({ projectKey, metric, startTs, urlPath, urlHost }) {
  //   let query = `
  //     SELECT 
  //       COUNT(*) AS num_records,
  //       AVG(metric_value) AS average
  //     FROM 
  //       performance_metrics 
  //     JOIN
  //       page_views ON performance_metrics.page_view_uuid = page_views.uuid
  //     WHERE 
  //       page_views.project_key = $1 AND
  //       performance_metrics.metric_name = $2 AND 
  //       page_views.page_view_ts >= $3 
  //   `;
  //   let queryOptions = [projectKey, metric, new Date(startTs)];
  //   if(urlPath) {
  //     query += ` AND page_views.url_path = $4`;
  //     queryOptions.push(decodeURIComponent(urlPath))
  //   } else if(urlHost) {
  //     query += ` AND page_views.url_host = $4`;
  //     queryOptions.push(decodeURIComponent(urlHost))
  //   }
  //   const results = await db.query(query, queryOptions);
  //   return { numRecords: results.rows[0].num_records, average: results.rows[0].average };
  // }
  //
  // static async getAveragesGroupedByPages({ projectKey, metric, startTs }) {
  //   const query = `
  //     SELECT
  //       page_views.url_path as name,
  //       AVG(metric_value) AS value
  //     FROM
  //       performance_metrics
  //     INNER JOIN
  //       page_views ON performance_metrics.page_view_uuid = page_views.uuid
  //     WHERE
  //       performance_metrics.metric_name = $1 AND
  //       page_views.project_key = $2 AND
  //       page_views.page_view_ts >= $3
  //     GROUP BY
  //       name
  //     ORDER BY
  //       value DESC
  //   `;
  //   const results = await db.query(query, [metric, projectKey, new Date(startTs)]);
  //   return results.rows;
  // };
  //
  // static async getTimeseriesGoodNeedsWorkBadDataForMetric({ projectKey, metric, startTs }) {
  //   const metricToUpperBoundsDict = cwvMetricBounds;
  //   if (!metricToUpperBoundsDict[metric]) throw new Error(`Invalid metric: ${metric}`);
  //   const query = `
  //     SELECT
  //       date_trunc('hour', page_views.page_view_ts) AS hour,
  //       date_trunc('day', page_views.page_view_ts) AS day,
  //       COUNT(*) AS num_records,
  //       COUNT(CASE WHEN metric_value <= ${metricToUpperBoundsDict[metric].good} THEN 1 END) AS num_good_records,
  //       100.0 * (
  //         (COUNT(CASE WHEN metric_value <= ${metricToUpperBoundsDict[metric].good} THEN 1 END)) / 
  //         (COUNT(*))
  //       ) AS percent_good_records,
  //       COUNT(
  //         CASE WHEN 
  //           metric_value > ${metricToUpperBoundsDict[metric].good} AND 
  //           metric_value <= ${metricToUpperBoundsDict[metric].medium} 
  //         THEN 1 END
  //       ) AS num_medium_records,
  //       100.0 * (
  //         (COUNT(
  //           CASE WHEN 
  //             metric_value > ${metricToUpperBoundsDict[metric].good} AND 
  //             metric_value <= ${metricToUpperBoundsDict[metric].medium} 
  //           THEN 1 END)
  //         ) / 
  //         (COUNT(*))
  //       ) AS percent_medium_records,
  //       COUNT(CASE WHEN metric_value > ${metricToUpperBoundsDict[metric].medium} THEN 1 END) AS num_bad_records,
  //       100.0 * (
  //         (COUNT(CASE WHEN metric_value > ${metricToUpperBoundsDict[metric].medium} THEN 1 END)) / 
  //         (COUNT(*))
  //       ) AS percent_bad_records
  //     FROM
  //       performance_metrics
  //     LEFT JOIN 
  //       page_views ON performance_metrics.page_view_uuid = page_views.uuid
  //     WHERE
  //       performance_metrics.project_key = $1 AND
  //       metric_name = $2 AND
  //       page_views.page_view_ts >= $3
  //     GROUP BY
  //       day, hour
  //     ORDER BY
  //       day, hour
  //   `;
  //   const results = await db.query(query, [projectKey, metric, new Date(startTs)]);
  //   return results.rows;
  // };
}