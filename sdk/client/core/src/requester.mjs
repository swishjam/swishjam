export class Requester {
  constructor({ endpoint, apiKey, options = {} }) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.disabledUrls = options.disabledUrls || [];
    this.maxNumFailedRequests = options.maxNumFailedRequests || 3;
    this.numFailedRequests = 0;
  }

  async send(data, onError = async () => { }) {
    if (!this._shouldSendRequest()) {
      console.log(`%cSwishjam is in development mode while in localhost and won't send data to the server`, `color: #7487F7; font-weight: bold;`)  
      console.log(`%cData Captured By Swishjam`, `color: #7487F7; font-weight: bold;`)  
      console.log(`%O`, data)  
      return
    };
    const result = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Swishjam-Api-Key': this.apiKey,
      },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(async err => {
      await onError(err).catch();
      return { ok: false };
    });
    if (!result.ok) {
      this.numFailedRequests++;
      if (this.numFailedRequests >= this.maxNumFailedRequests) console.error('[Swishjam SDK Error]: Max number of failed network requests reached; disabling Swishjam requests.');
    }
    return result.ok;
  }

  _shouldSendRequest() {
    if (this.disabledUrls.find(url => window.location.href.includes(url))) return false;
    if (this.numFailedRequests >= this.maxNumFailedRequests) return false;
    return true;
  }
}

export default Requester;