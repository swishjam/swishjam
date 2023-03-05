const { processMessages } = require('../src/index');
const { prepareDb } = require('./db');

describe('processMessages', () => {
  beforeEach(async () => await prepareDb());

  it('loops through the `Records` provided and processes them', async () => {
    const exampleData = { Records: [{ body: JSON.stringify({ siteId: '123', data: [] }) }] };
    await processMessages(exampleData);
  });

  // it('throws an error if the payload is invalid', async () => {
  //   const exampleData = { Records: [{ body: 'invalid' }] };
  //   await expect(processMessages(exampleData)).rejects.toThrow();
  // });
})