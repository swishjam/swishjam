const TRANSACTION_ID_MAP = {
  'USER_INVITATION': 'clhrv3a44001wl30fx4gyqz2s',
  'WEEKLY_CWV_REPORT': 'clhrutisx008ekx0fv2ij65ts',
}

export class Mailer {
  static async send({ to, type, variables = {} }) {
    const transactionalId = TRANSACTION_ID_MAP[type];
    if (!to) throw new Error('Missing required attribute: `to`.');
    if (!transactionalId) throw new Error(`Unrecognized template provided: ${type}`);
    if (!process.env.LOOPS_API_KEY) throw new Error(`Loops API key not found in environment.`);
    const body = { email: to, transactionalId, dataVariables: variables };

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