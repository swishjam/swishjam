import Swishjam from '@swishjam/core';

(function() {
  const apiKey = document.currentScript.getAttribute('data-api-key');
  const apiEndpoint = document.currentScript.getAttribute('data-api-endpoint');
  const maxEventsInMemory = document.currentScript.getAttribute('data-max-events-in-memory');
  const reportingHeartbeatMs = document.currentScript.getAttribute('data-reporting-heartbeat-ms');
  
  if (!apiKey) throw new Error('Missing Swishjam API key, you must provide it in the `data-api-key` attribute of the Swishjam CDN script tag.');
  Swishjam.init({ apiKey, apiEndpoint, maxEventsInMemory, reportingHeartbeatMs });
})();