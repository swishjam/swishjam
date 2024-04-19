import Swishjam from '@swishjam/core';

(function () {
  const apiKey = document.currentScript.getAttribute('data-api-key');
  const apiEndpoint = document.currentScript.getAttribute('data-api-endpoint');
  const apiHost = document.currentScript.getAttribute('data-api-host');
  const apiPath = document.currentScript.getAttribute('data-api-path');
  const autoIdentify = document.currentScript.getAttribute('data-auto-identify') === 'true';
  const disabledUrls = (document.currentScript.getAttribute('data-disabled-urls') || '').split(',');
  const includedUrlParams = (document.currentScript.getAttribute('data-included-url-params') || '').split(',');
  const maxEventsInMemory = document.currentScript.getAttribute('data-max-events-in-memory');
  const recordClicks = document.currentScript.getAttribute('data-record-clicks') === 'true';
  const recordFormSubmits = document.currentScript.getAttribute('data-record-form-submits') === 'true';
  const reportingHeartbeatMs = document.currentScript.getAttribute('data-reporting-heartbeat-ms');
  const sessionTimeoutMinutes = document.currentScript.getAttribute('data-session-timeout-minutes');
  const useSegment = document.currentScript.getAttribute('data-use-segment') === 'true';

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