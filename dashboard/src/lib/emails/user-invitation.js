import { Mailer } from './base.js';

export class UserInvitation  {
  static async send({ to, variables = {} }) {
    return await Mailer.send({ to, type: 'USER_INVITATION', variables });
  }
}