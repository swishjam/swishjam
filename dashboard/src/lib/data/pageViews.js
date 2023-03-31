import db from '@lib/db';

export default class PageViews {
  static async getCount({ projectKey, urlHost, urlPath, startTs }) {
    if (!projectKey) throw new Error('Missing `projectKey` query param');
    if (!urlHost) throw new Error('Missing `urlHost` query param');
    if (urlPath) {
      const query = `
        SELECT 
          COUNT(*) AS count
        FROM 
          page_views
        WHERE 
          project_key = $1
          AND url_host = $2
          AND url_path = $3
          AND page_view_ts >= $4
      `;
      return (await db.query(query, [projectKey, urlHost, urlPath, new Date(startTs)])).rows[0];
    } else {
      const query = `
        SELECT 
          COUNT(*) AS count
        FROM 
          page_views
        WHERE 
          project_key = $1
          AND url_host = $2
          AND page_view_ts >= $3
      `;
      return (await db.query(query, [projectKey, urlHost, new Date(startTs)])).rows[0];
    }
  }
}