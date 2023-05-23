import { Mailer } from './base.js';

export class WeeklyCWVReport {
  static async send({ to, variables = {} }) {
    console.log(to)
    console.log(variables)
    return await Mailer.send({ to, type: 'WEEKLY_CWV_REPORT', variables });
  }
}