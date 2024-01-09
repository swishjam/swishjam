import Base from "../base";

export class MrrMovement extends Base {
  static async stackedBarChart({ timeframe }) {
    return await this._get('/api/v1/saas_metrics/mrr_movement/stacked_bar_chart', { timeframe });
  }
}

Object.assign(Base, MrrMovement);
export default MrrMovement;