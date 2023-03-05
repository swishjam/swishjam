require('dotenv').config({ path: '../.env' });

const express = require('express');
const app = express();
const cors = require('cors');
const port = 8080;
const { processMessages } = require('../src/index');

app.use(express.json());
app.use(express.text());
app.use(cors({ origin: true, credentials: true }));

app.get('/', (_req, res) => res.send('Local Swishjam server running.'));

app.post('/api/events', async (req, res) => {
  const lambdaFormattedPayload = { Records: [{ body: JSON.stringify(req.body) }]};
  await processMessages(lambdaFormattedPayload);
  res.send({ message: 'Processed messages' });
});

app.listen(port, () => console.log(`Local Swishjam server running on port ${port}!`));