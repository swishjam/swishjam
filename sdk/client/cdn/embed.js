(function (cdnEndpoint, publicKey, options = {}) {
  window.swishjamEvents = [];
  window.Swishjam = window.Swishjam || {};
  window.Swishjam.stubbed = true;
  window.Swishjam.event = window.Swishjam.event || function(...args) { window.swishjamEvents.push({ method: 'event', args }) };
  window.Swishjam.identify = window.Swishjam.identify || function(...args) { window.swishjamEvents.push({ method: 'identify', args }) };
  window.Swishjam.setOrganization = window.Swishjam.setOrganization || function(...args) { window.swishjamEvents.push({ method: 'setOrganization', args }) };
  window.Swishjam.logout = window.Swishjam.ogout || function() { window.swishjamEvents.push({ method: 'logout' }) };
  window.Swishjam.getSession = window.Swishjam.getSession || function() { console.warn('SwishjamJS not loaded yet, cannot call `getSession`.') };
  window.Swishjam.newSession = window.Swishjam.newSession || function() { console.warn('SwishjamJS not loaded yet, cannot call `newSession`.') };
  
  const s = document.createElement('script');
  s.setAttribute('src', cdnEndpoint);
  s.setAttribute('data-api-key', publicKey);
  if (options.apiEndpoint) s.setAttribute('data-api-endpoint', options.apiEndpoint);
  if (options.maxEventsInMemory) s.setAttribute('data-max-events-in-memory', options.maxEventsInMemory);
  if (options.reportingHeartbeatMs) s.setAttribute('data-reporting-heartbeat-ms', options.reportingHeartbeatMs);
  document.head.appendChild(s);
})('https://unpkg.com/@swishjam/cdn@latest/build.js', '{{SWISHJAM_PUBLIC_KEY}}')