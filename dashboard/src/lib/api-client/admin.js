import Base from "./base";
import DataSyncs from "./admin/data-syncs";
import EventTriggers from "./admin/event-triggers";
import Ingestion from "./admin/ingestion";

export class Admin extends Base {
  static DataSyncs = DataSyncs;
  static EventTriggers = EventTriggers
  static Ingestion = Ingestion;
}

Object.assign(Admin, Base);
export default Admin;