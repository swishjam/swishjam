const { Swishjam } = require('../src/swishjam');

(function() {
  const reportingUrl = document.currentScript.getAttribute('swishjam-reporting-url');
  const publicApiKey = document.currentScript.getAttribute('swishjam-public-api-key');
  if (!reportingUrl) throw new Error('Swishjam Error: You must specify your Swishjam reporting URL in the `swishjam-reporting-url` attribute of the script tag.');
  if (!publicApiKey) throw new Error('Swishjam Error: You must specify your Swishjam public API key in the `swishjam-public-api-key` attribute of the script tag.');
  const sampleRate = parseFloat(document.currentScript.getAttribute('swishjam-sample-rate') || 1.0);
  const mockApiCalls = document.currentScript.getAttribute('swishjam-mock-api-calls') === 'true';
  const includeSwishjamResourcesEntries = document.currentScript.getAttribute('swishjam-include-swishjam-resources-entries') === 'true';
  if (document.readyState === 'complete') {
    Swishjam.init({ reportingUrl, publicApiKey, sampleRate, mockApiCalls, includeSwishjamResourcesEntries });
  } else {
    window.addEventListener('load', () => {
      Swishjam.init({ reportingUrl, publicApiKey, sampleRate, mockApiCalls, includeSwishjamResourcesEntries });
    });
  }
})();