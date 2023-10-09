import Ingestion from "./admin/ingestion";
import Base from "./base";

export class Admin extends Base {
  static Ingestion = Ingestion;
}

Object.assign(Admin, Base);
export default Admin;