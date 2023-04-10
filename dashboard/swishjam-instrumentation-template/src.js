import { Swishjam } from '@swishjam/swishjam';

(function () {
  if (document.readyState === 'complete') {
    Swishjam.init({
      reportingUrl: '{{SWISHJAM_REPLACE_REPORTING_URL}}',
      publicApiKey: '{{SWISHJAM_REPLACE_PUBLIC_API_KEY}}',
      sampleRate: '{{SWISHJAM_REPLACE_SAMPLE_RATE}}'
    });
  } else {
    window.addEventListener('load', () => {
      Swishjam.init({
        reportingUrl: '{{SWISHJAM_REPLACE_REPORTING_URL}}',
        publicApiKey: '{{SWISHJAM_REPLACE_PUBLIC_API_KEY}}',
        sampleRate: '{{SWISHJAM_REPLACE_SAMPLE_RATE}}'
      });
    });
  }
})();