import Base from "./base";

export class DoNotEnrichUserProfileRule extends Base {
  static create = async ({ emailDomain }) => {
    return await this._post('/api/v1/do_not_enrich_user_profile_rules', { email_domain: emailDomain });
  }

  static delete = async id => {
    return this._delete(`/api/v1/do_not_enrich_user_profile_rules/${id}`);
  }
}

Object.assign(DoNotEnrichUserProfileRule, Base)
export default DoNotEnrichUserProfileRule;