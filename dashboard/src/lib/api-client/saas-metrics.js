import Base from "./base";
import ChurnRate from "./saas-metrics/churn-rate";
import MrrMovement from "./saas-metrics/mrr-movement";

export class SaasMetrics extends Base {
  static ChurnRate = ChurnRate;
  static MrrMovement = MrrMovement;
}

Object.assign(SaasMetrics, Base);
export default SaasMetrics;
