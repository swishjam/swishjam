import DataSyncs from "./admin/data-syncs";
import Ingestion from "./admin/ingestion";
import Base from "./base";

export class Admin extends Base {
  static Ingestion = Ingestion;
  static DataSyncs = DataSyncs;
}

Object.assign(Admin, Base);
export default Admin;