import { Client } from '../src/client.mjs';

describe('Client', () => {
  describe('init', () => {
    it('should set the default config', () => {
      const client = new Client({ apiKey: 'set-default-config' });
      expect(client.config.apiKey).toEqual('set-default-config');
      expect(client.config.apiEndpoint).toEqual('https://capture.swishjam.com/api/v1/capture');
      expect(client.config.maxEventsInMemory).toEqual(20);
      expect(client.config.reportingHeartbeatMs).toEqual(10_000);
      expect(client.config.disabledUrls).toEqual(['http://localhost']);
      expect(client.config.disabled).toEqual(false);
    })

    it('should set the config from options', () => {
      const client = new Client({
        apiKey: 'config-from-options',
        apiEndpoint: 'https://capture.swishjam.com/api/v1/capture/newz!',
        maxEventsInMemory: 10,
        reportingHeartbeatMs: 5_000,
        disabledUrls: ['http://localhost', 'http://localhost:3000'],
        disabled: true,
      });

      expect(client.config.apiKey).toEqual('config-from-options');
      expect(client.config.apiEndpoint).toEqual('https://capture.swishjam.com/api/v1/capture/newz!');
      expect(client.config.maxEventsInMemory).toEqual(10);
      expect(client.config.reportingHeartbeatMs).toEqual(5_000);
      expect(client.config.disabledUrls).toEqual(['http://localhost', 'http://localhost:3000']);
      expect(client.config.disabled).toEqual(true);
    })
  });

  describe('record', () => {
    it('enqueue the new event', () => {
      const client = new Client({ apiKey: 'enqueue-new-event' });

      // the new_session and page_view event is automatically enqueued on init
      expect(client.eventQueueManager.queue.length).toEqual(2)

      client.record('myEvent', { someKey: 'someValue' });

      expect(client.eventQueueManager.queue.length).toEqual(3)
      expect(client.eventQueueManager.queue[2].event).toEqual('myEvent')
      expect(client.eventQueueManager.queue[2].attributes.someKey).toEqual('someValue')
      expect(client.eventQueueManager.queue[2].attributes.device_identifier).not.toBe(undefined)
      expect(client.eventQueueManager.queue[2].attributes.page_view_identifier).not.toBe(undefined)
      expect(client.eventQueueManager.queue[2].attributes.sdk_version).not.toBe(undefined)
      expect(client.eventQueueManager.queue[2].attributes.session_identifier).not.toBe(undefined)
      expect(client.eventQueueManager.queue[2].attributes.url).not.toBe(undefined)
      expect(client.eventQueueManager.queue[2].attributes.user_visit_status).not.toBe(undefined)
      expect(client.eventQueueManager.queue[2].attributes.user_attributes).not.toBe(undefined)
    });
  });

  describe('identify', () => {
    it('calls the identify event and the organization event when organization data is passed', () => {
      const client = new Client({ apiKey: 'identify-with-org' });

      // the new_session and page_view event is automatically enqueued on init
      expect(client.eventQueueManager.queue.length).toEqual(2)

      client.identify('collin!', {
        email: 'collin@gmail.com',
        firstName: 'Collin',
        lastName: 'Schneider',
        organization: {
          id: 'xyz',
          name: 'Swishjam Org!',
          numEmployees: 100,
        }
      });

      expect(client.eventQueueManager.queue.length).toEqual(4)
      expect(client.eventQueueManager.queue[2].event).toEqual('organization')
      expect(client.eventQueueManager.queue[2].attributes.organizationIdentifier).toEqual('xyz')
      expect(client.eventQueueManager.queue[2].attributes.name).toEqual('Swishjam Org!')
      expect(client.eventQueueManager.queue[2].attributes.numEmployees).toEqual(100)

      expect(client.eventQueueManager.queue[3].event).toEqual('identify')
      expect(client.eventQueueManager.queue[3].attributes.userIdentifier).toEqual('collin!')
      expect(client.eventQueueManager.queue[3].attributes.email).toEqual('collin@gmail.com')
      expect(client.eventQueueManager.queue[3].attributes.firstName).toEqual('Collin')
      expect(client.eventQueueManager.queue[3].attributes.lastName).toEqual('Schneider')
    });
  })

  describe('newSession', () => {
    it('starts a new session', () => {
      const client = new Client({ apiKey: 'new-session' });

      // the new_session and page_view event is automatically enqueued on init
      expect(client.eventQueueManager.queue.length).toEqual(2)

      const initialSession = client.getSession();

      expect(client.eventQueueManager.queue[0].event).toEqual('new_session')
      expect(client.eventQueueManager.queue[0].attributes.session_identifier).toEqual(initialSession)
      expect(client.eventQueueManager.queue[0].attributes.device_identifier).not.toBe(undefined)
      expect(client.eventQueueManager.queue[0].attributes.sdk_version).not.toBe(undefined)
      expect(client.eventQueueManager.queue[0].attributes.url).toEqual(window.location.href)
      expect(client.eventQueueManager.queue[0].attributes.referrer).toEqual('')
      expect(client.eventQueueManager.queue[0].attributes.user_visit_status).toEqual('new')
      expect(client.eventQueueManager.queue[0].attributes.user_attributes.initial_url).toEqual(window.location.href)
      expect(client.eventQueueManager.queue[0].attributes.user_attributes.initial_referrer).toEqual('')

      const newSession = client.newSession();
      expect(client.eventQueueManager.queue.length).toEqual(4)
      expect(client.eventQueueManager.queue[2].event).toEqual('new_session')
      expect(client.eventQueueManager.queue[2].attributes.session_identifier).toEqual(newSession)
      expect(client.eventQueueManager.queue[2].attributes.device_identifier).not.toBe(undefined)
      expect(client.eventQueueManager.queue[2].attributes.sdk_version).not.toBe(undefined)
      expect(client.eventQueueManager.queue[2].attributes.url).toEqual(window.location.href)
      expect(client.eventQueueManager.queue[2].attributes.referrer).toEqual('')
      expect(client.eventQueueManager.queue[2].attributes.user_visit_status).toEqual('returning')
      expect(client.eventQueueManager.queue[2].attributes.user_attributes.initial_url).toEqual(window.location.href)
      expect(client.eventQueueManager.queue[2].attributes.user_attributes.initial_referrer).toEqual('')
    })
  })
});