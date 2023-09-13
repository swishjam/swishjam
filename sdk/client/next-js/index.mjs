import { useEffect } from 'react';

export const useSwishjam = (options = {}) => {
  const inMemoryEvents = [];
  let swishjamInitialized = false;
  let swishjamClient = {
    identify: (userId, traits) => inMemoryEvents.push({ type: 'identify', userId, traits }),
    event: (eventName, properties) => inMemoryEvents.push({ type: 'event', eventName, properties }),
    setOrganization: orgId => inMemoryEvents.push({ type: 'setOrganization', orgId }),
    getSession: () => {},
    getPageView: () => {},
    newSession: () => {},
  };


  const captureInMemoryEvents = sdk => {
    inMemoryEvents.forEach(eventObj => {
      switch (eventObj.type) {
        case 'identify':
          sdk.identify(eventObj.userId, eventObj.traits);
          break;
        case 'event':
          sdk.event(eventObj.eventName, eventObj.properties);
          break;
        case 'setOrganization':
          sdk.setOrganization(eventObj.orgId);
          break;
        default:
          break;
      }
    });
  }

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && !swishjamInitialized) {
        const swishjamClient = (await import('@swishjam/core')).default;
        swishjamClient.init(options);
        captureInMemoryEvents(swishjamClient);
        swishjamInitialized = true;
        return swishjamClient;
      }
    }
    init();
  }, [options.apiKey, options.apiEndpoint]);

  return swishjamClient;
}

export const SwishjamProvider = ({ children, apiKey, apiEndpoint }) => {
  useSwishjam({ apiKey, apiEndpoint });
  return children;
}