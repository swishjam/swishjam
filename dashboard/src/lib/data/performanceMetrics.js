import db from '@lib/db';
import { cwvMetricBounds } from '@/lib/utils';

export default class PerformanceMetricsData {
  static async getAverageMetric({ siteId, metric, startTs, urlPath }) {
    if(urlPath) {
      const query = `
        SELECT 
          COUNT(*) AS num_records,
          AVG(metric_value) AS average
        FROM 
          performance_metrics 
        JOIN
          page_views ON performance_metrics.page_view_identifier = page_views.identifier
        WHERE 
          page_views.site_id = $1 AND
          performance_metrics.metric_name = $2 AND 
          page_views.page_view_ts >= $3 AND 
          page_views.url_path = $4
      `;
      const results = await db.query(query, [siteId, metric, new Date(startTs), decodeURIComponent(urlPath)]);
      return {
        numRecords: results.rows[0].num_records,
        average: results.rows[0].average
      };
    } else {
      const query = `
        SELECT 
          COUNT(*) AS num_records,
          AVG(metric_value) AS average
        FROM 
          performance_metrics 
        JOIN
          page_views ON performance_metrics.page_view_identifier = page_views.identifier
        WHERE 
          page_views.site_id = $1 AND
          performance_metrics.metric_name = $2 AND 
          page_views.page_view_ts >= $3 
      `;
      const results = await db.query(query, [siteId, metric, new Date(startTs)]);
      return {
        numRecords: results.rows[0].num_records,
        average: results.rows[0].average
      };
    }
  }

  static async getPercentileMetric({ siteId, metric, percentile = 0.75, startTs }) {
    const query = `
      SELECT
        COUNT(*) AS num_records,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS percentile_result
      FROM
        performance_metrics
      WHERE
        site_id = $1 AND
        metric_name = $2 AND
        created_at >= $3
    `;
    const results = await db.query(query, [siteId, metric, new Date(startTs)]);
    return {
      numRecords: results.rows[0].num_records,
      percentileResult: results.rows[0].percentile_result
    };
  }

  static async getAveragesGroupedByPages({ siteId, metric, startTs }) {
    const query = `
      SELECT
        page_views.url_path as name,
        AVG(metric_value) AS value
      FROM
        performance_metrics
      INNER JOIN
        page_views ON performance_metrics.page_view_identifier = page_views.identifier
      WHERE
        performance_metrics.metric_name = $1 AND
        page_views.site_id = $2 AND
        page_views.page_view_ts >= $3
      GROUP BY
        name
      ORDER BY
        value DESC
    `;
    const results = await db.query(query, [metric, siteId, new Date(startTs)]);
    return results.rows;
  };

  static async getTimeseriesGoodNeedsWorkBadDataForMetric({ siteId, metric, startTs }) {
    const metricToUpperBoundsDict = cwvMetricBounds;
    if (!metricToUpperBoundsDict[metric]) throw new Error(`Invalid metric: ${metric}`);
    const query = `
      SELECT
        date_trunc('hour', page_views.page_view_ts) AS hour,
        date_trunc('day', page_views.page_view_ts) AS day,
        COUNT(*) AS num_records,
        COUNT(CASE WHEN metric_value <= ${metricToUpperBoundsDict[metric].good} THEN 1 END) AS num_good_records,
        100.0 * (
          (COUNT(CASE WHEN metric_value <= ${metricToUpperBoundsDict[metric].good} THEN 1 END)) / 
          (COUNT(*))
        ) AS percent_good_records,
        COUNT(
          CASE WHEN 
            metric_value > ${metricToUpperBoundsDict[metric].good} AND 
            metric_value <= ${metricToUpperBoundsDict[metric].medium} 
          THEN 1 END
        ) AS num_medium_records,
        100.0 * (
          (COUNT(
            CASE WHEN 
              metric_value > ${metricToUpperBoundsDict[metric].good} AND 
              metric_value <= ${metricToUpperBoundsDict[metric].medium} 
            THEN 1 END)
          ) / 
          (COUNT(*))
        ) AS percent_medium_records,
        COUNT(CASE WHEN metric_value > ${metricToUpperBoundsDict[metric].medium} THEN 1 END) AS num_bad_records,
        100.0 * (
          (COUNT(CASE WHEN metric_value > ${metricToUpperBoundsDict[metric].medium} THEN 1 END)) / 
          (COUNT(*))
        ) AS percent_bad_records
      FROM
        performance_metrics
      LEFT JOIN 
        page_views ON performance_metrics.page_view_identifier = page_views.identifier
      WHERE
        performance_metrics.site_id = $1 AND
        metric_name = $2 AND
        page_views.page_view_ts >= $3
      GROUP BY
        day, hour
      ORDER BY
        day, hour
    `;
    const results = await db.query(query, [siteId, metric, new Date(startTs)]);
    return results.rows;
  };

  static async getPercentileTimeseriesDataForMetric({ siteId, metric, startTs, urlPath, percentile = 0.9 }) {
    if(urlPath) {
      const query = `
        SELECT
          PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS percentile_result,
          date_trunc('hour', page_views.page_view_ts) AS hour,
          date_trunc('day', page_views.page_view_ts) AS day
        FROM
          performance_metrics
        LEFT JOIN
          page_views ON performance_metrics.page_view_identifier = page_views.identifier
        WHERE
          page_views.site_id = $1 AND
          metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_path = $4
        GROUP BY
          day, hour
      `;
      const results = await db.query(query, [siteId, metric, new Date(startTs), decodeURIComponent(urlPath)]);
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
          page_views ON performance_metrics.page_view_identifier = page_views.identifier
        WHERE
          page_views.site_id = $1 AND
          metric_name = $2 AND
          page_views.page_view_ts >= $3
        GROUP BY
          day, hour
      `;
      return (await db.query(query, [siteId, metric, new Date(startTs)])).rows;
    }
  };
}