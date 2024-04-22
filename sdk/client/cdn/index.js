import Swishjam from '@swishjam/core';

(function () {
  const apiKey = document.currentScript.getAttribute('data-api-key');
  const apiEndpoint = document.currentScript.getAttribute('data-api-endpoint');
  const apiHost = document.currentScript.getAttribute('data-api-host');
  const apiPath = document.currentScript.getAttribute('data-api-path');
  const autoIdentify = document.currentScript.getAttribute('data-auto-identify') !== 'false';
  const disabledUrls = (document.currentScript.getAttribute('data-disabled-urls') || '').split(',').filter(Boolean);
  const includedUrlParams = (document.currentScript.getAttribute('data-included-url-params') || '').split(',').filter(Boolean);
  const maxEventsInMemory = document.currentScript.getAttribute('data-max-events-in-memory');
  const recordClicks = document.currentScript.getAttribute('data-record-clicks') !== 'false';
  const recordFormSubmits = document.currentScript.getAttribute('data-record-form-submits') !== 'false';
  const reportingHeartbeatMs = document.currentScript.getAttribute('data-reporting-heartbeat-ms');
  const sessionTimeoutMinutes = document.currentScript.getAttribute('data-session-timeout-minutes');
  // making segment opt-out for CDN, it's opt-in for the core SDK
  const useSegment = document.currentScript.getAttribute('data-use-segment') !== 'false';

  if (!apiKey) throw new Error('Missing Swishjam API key, you must provide it in the `data-api-key` attribute of the Swishjam CDN script tag.');
  new Swishjam({
    apiKey,
    apiEndpoint,
    apiHost,
    apiPath,
    autoIdentify,
    disabledUrls,
    includedUrlParams,
    maxEventsInMemory,
    recordClicks,
    recordFormSubmits,
    reportingHeartbeatMs,
    sessionTimeoutMinutes,
    useSegment,
  });
})();