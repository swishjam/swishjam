export class Requester {
  constructor({ reportingEndpoint, apiKey }) {
    this.reportingEndpoint = reportingEndpoint;
    this.apiKey = apiKey;
  }

  async send(data) {
    return await fetch(this.reportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Swishjam-Api-Key': this.apiKey,
      },
      body: JSON.stringify(data),
      keepalive: true,
    })
  }
}

export default Requester;