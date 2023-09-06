(function (cdnEndpoint, publicKey, options = {}) {
  const inMemoryEvents = [];
  const onLoadCallbacks = [];
  window.Swishjam = window.Swishjam || {};
  window.Swishjam.stubbed = true;
  window.Swishjam.init = () => console.warn('SwishjamJS not loaded yet, cannot call `init`.');
  window.Swishjam.getSession = () => console.warn('SwishjamJS not loaded yet, cannot call `getSession`.');
  window.Swishjam.newSession = () => console.warn('SwishjamJS not loaded yet, cannot call `newSession`.');
  window.Swishjam.identify = (userIdentifier, traits) => inMemoryEvents.push({ name: 'identify', properties: { userIdentifier, ...traits }});
  window.Swishjam.event = (eventName, properties) => inMemoryEvents.push({ name: eventName, properties });
  window.Swishjam.setOrganization = (organizationIdentifier, traits) => inMemoryEvents.push({ name: 'organization', properties: { organizationIdentifier, ...traits }});
  window.Swishjam.onLoad = callback => onLoadCallbacks.push(callback);
  
  const s = document.createElement('script');
  s.setAttribute('src', cdnEndpoint);
  s.setAttribute('data-api-key', publicKey);
  if (options.apiEndpoint) s.setAttribute('data-api-endpoint', options.apiEndpoint);
  if (options.maxEventsInMemory) s.setAttribute('data-max-events-in-memory', options.maxEventsInMemory);
  if (options.reportingHeartbeatMs) s.setAttribute('data-reporting-heartbeat-ms', options.reportingHeartbeatMs);
  document.head.appendChild(s);
  
  s.onload = () => {
    // TODO: this is still the stubbed version, when it should be loaded at this point and overridden with the SDK
    debugger;
    inMemoryEvents.forEach(event => {
      switch (event.name) {
        case 'identify':
          window.Swishjam.identify(event.properties.userIdentifier, event.properties);
          break;
        case 'organization':
          window.Swishjam.setOrganization(event.properties.organizationIdentifier, event.properties);
          break;
        default:
          window.Swishjam.event(event.name, event.properties);
          break;
      }
    });
    onLoadCallbacks.forEach(callback => callback(window.Swishjam));
  }
})('https://unpkg.com/@swishjam/cdn@latest/build.js', 'swishjam-644e978b-cd0b091c', { apiEndpoint: 'https://swishjam-prod-9a00662c420f75d5.onporter.run/api/v1/capture' })