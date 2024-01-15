import Base from "../base";

export class FreeTrials extends Base {
  static async timeseries({ timeframe }) {
    return await this._get('/api/v1/saas_metrics/free_trials/timeseries', { timeframe });
  }
}

Object.assign(FreeTrials, Base);
export default FreeTrials;