const TRANSACTION_ID_MAP = {
  USER_INVITATION: 'clhrv3a44001wl30fx4gyqz2s',
}

export class Mailer {
  static async send({ to, type, variables = {} }) {
    const transactionalId = TRANSACTION_ID_MAP[type];
    if (!to) throw new Error('Missing required attribute: `to`.');
    if (!transactionalId) throw new Error(`Unrecognized template provided: ${type}`);
    if (!process.env.LOOPS_API_KEY) throw new Error(`Loops API key not found in environment.`);
    const body = { email: to, transactionalId, dataVariables: variables };

    if (process.env.DISABLE_TRANSACTION_EMAILS) {
      console.log(`Bypassing sending ${type} email to ${to} because DISABLE_TRANSACTION_EMAILS ENV is enabled.`);
      console.log(body);
      return { success: true };
    } else {        
      const response = await fetch('https://app.loops.so/api/v1/transactional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`
        },
        body: JSON.stringify(body)
      })
      return await response.json();
    }
  }
}