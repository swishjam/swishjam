(function (cdnEndpoint, publicKey, options = {}) {
  window.swishjamEvents = [];
  window.Swishjam = window.Swishjam || {};
  window.Swishjam.stubbed = true;
  window.Swishjam.event = window.Swishjam.event || function (...args) { window.swishjamEvents.push({ method: 'event', args }) };
  window.Swishjam.identify = window.Swishjam.identify || function (...args) { window.swishjamEvents.push({ method: 'identify', args }) };
  window.Swishjam.setOrganization = window.Swishjam.setOrganization || function (...args) { window.swishjamEvents.push({ method: 'setOrganization', args }) };
  window.Swishjam.logout = window.Swishjam.ogout || function () { window.swishjamEvents.push({ method: 'logout' }) };
  window.Swishjam.getSession = window.Swishjam.getSession || function () { console.warn('SwishjamJS not loaded yet, cannot call `getSession`.') };
  window.Swishjam.newSession = window.Swishjam.newSession || function () { console.warn('SwishjamJS not loaded yet, cannot call `newSession`.') };
  window.Swishjam.updateUser = window.Swishjam.updateUser || function () { console.warn('SwishjamJS not loaded yet, cannot call `updateUser`.') };

  const s = document.createElement('script');
  s.setAttribute('src', cdnEndpoint);
  s.setAttribute('data-api-key', publicKey);
  if (options.apiEndpoint) s.setAttribute('data-api-endpoint', options.apiEndpoint);
  if (options.apiHost) s.setAttribute('data-api-host', options.apiHost);
  if (options.apiPath) s.setAttribute('data-api-path', options.apiPath);
  if (options.autoIdentify) s.setAttribute('data-auto-identify', options.autoIdentify);
  if (options.disabledUrls) s.setAttribute('data-disabled-urls', options.disabledUrls);
  if (options.includedUrlParams) s.setAttribute('data-included-url-params', options.includedUrlParams);
  if (options.maxEventsInMemory) s.setAttribute('data-max-events-in-memory', options.maxEventsInMemory);
  if (options.recordClicks) s.setAttribute('data-record-clicks', options.recordClicks);
  if (options.recordFormSubmits) s.setAttribute('data-record-form-submits', options.recordFormSubmits);
  if (options.reportingHeartbeatMs) s.setAttribute('data-reporting-heartbeat-ms', options.reportingHeartbeatMs);
  if (options.sessionTimeoutMinutes) s.setAttribute('data-session-timeout-minutes', options.sessionTimeoutMinutes);
  if (options.useSegment) s.setAttribute('data-use-segment', options.useSegment);
  document.head.appendChild(s);
})('https://unpkg.com/@swishjam/cdn@latest/build.js', '{{SWISHJAM_PUBLIC_KEY}}')