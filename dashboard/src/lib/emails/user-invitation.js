import { Mailer } from './base.js';

export class UserInvitation  {
  static REQUIRED_VARIABLES = ['invited_by_user', 'organization_name', 'invitation_url', 'user_name'];
  static async send({ to, variables = {} }) {
    const missingVariables = this.REQUIRED_VARIABLES.filter(variable => !variables[variable]);
    if (missingVariables.length > 0) throw new Error(`Missing variables: ${missingVariables.join(', ')}`);
    return await Mailer.send({ to, type: 'USER_INVITATION', variables });
  }
}