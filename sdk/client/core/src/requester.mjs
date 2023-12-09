export class Requester {
  constructor({ endpoint, apiKey, options = {} }) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.maxNumFailedRequests = options.maxNumFailedRequests || 3;
    this.numFailedRequests = 0;
    this.hasPendingRequest = false;
  }

  async send(data, onError = async () => { }) {
    if (this.numFailedRequests >= this.maxNumFailedRequests || this.hasPendingRequest) {
      return false;
    }
    this.hasPendingRequest = true;
    const result = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Swishjam-Api-Key': this.apiKey,
      },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(async err => {
      this.hasPendingRequest = false;
      await onError(err).catch();
      return { ok: false };
    });
    this.hasPendingRequest = false;
    if (!result.ok) {
      this.numFailedRequests++;
      if (this.numFailedRequests >= this.maxNumFailedRequests) console.error('[Swishjam SDK Error]: Max number of failed network requests reached; disabling Swishjam requests.');
    }
    return result.ok;
  }
}

export default Requester;