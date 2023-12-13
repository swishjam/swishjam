const { JSDOM } = require('jsdom');
import { SessionPersistance } from '../src/sessionPersistance.mjs';
import { DeviceIdentifiers } from '../src/deviceIdentifiers.mjs';
import { PersistentUserDataManager } from '../src/persistentUserDataManager.mjs';

const dom = new JSDOM('', { url: 'https://swishjam.com' });
global.window = dom.window;
global.document = window.document;
global.sessionStorage = window.sessionStorage;
global.localStorage = window.localStorage;
global.navigator = {
  userAgent: 'node.js',
};

// mock the fetch API
global.fetch = () => Promise.resolve({ ok: true });

afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  SessionPersistance.clear();
  DeviceIdentifiers.resetUserDeviceIdentifierValue();
  PersistentUserDataManager.reset();
});