import { Swishjam } from '../src/swishjam';

(function() {
  const reportingUrl = document.currentScript.getAttribute('swishjam-reporting-url');
  const publicApiKey = document.currentScript.getAttribute('swishjam-public-api-key');
  if (!reportingUrl) throw new Error('Swishjam Error: You must specify your Swishjam reporting URL in the `swishjam-reporting-url` attribute of the script tag.');
  if (!publicApiKey) throw new Error('Swishjam Error: You must specify your Swishjam public API key in the `swishjam-public-api-key` attribute of the script tag.');
  const sampleRate = parseFloat(document.currentScript.getAttribute('swishjam-sample-rate') || 1.0);
  if (document.readyState === 'complete') {
    Swishjam.init({ reportingUrl, publicApiKey, sampleRate });
  } else {
    window.addEventListener('load', () => {
      Swishjam.init({ reportingUrl, publicApiKey, sampleRate });
    });
  }
})();