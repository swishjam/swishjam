import Base from "./base";

export class Auth extends Base {
  static async logout() {
    return await this._post('/auth/logout');
  }

  static async login({ email, password }) {
    return this._post('/auth/login', { email, password });
  }

  static async register({ email, password, companyUrl, inviteCode }) {
    return await this._post('/auth/register', { email, password, company_url: companyUrl, invite_code: inviteCode })
  }
}

Object.assign(Auth, Base)
export default Auth;