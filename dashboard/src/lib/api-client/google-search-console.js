import Base from "./base";

export class GoogleSearchConsole extends Base {
  static async getAnalytics(siteUrl, { timeframe }) {
    return await this._get("/api/v1/google_search_console/analytics", { site_url: siteUrl, timeframe });
  }

  static async getSites() {
    return await this._get("/api/v1/google_search_console/sites");
  }
}

Object.assign(GoogleSearchConsole, Base);
export default GoogleSearchConsole;