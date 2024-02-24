import ApiKeys from "./admin/api-keys";
import Base from "./base";
import DataSyncs from "./admin/data-syncs";
import EventTriggers from "./admin/event-triggers";
import Ingestion from "./admin/ingestion";
import Queues from './admin/queues';

export class Admin extends Base {
  static ApiKeys = ApiKeys;
  static DataSyncs = DataSyncs;
  static EventTriggers = EventTriggers
  static Ingestion = Ingestion;
  static Queues = Queues;
}

Object.assign(Admin, Base);
export default Admin;