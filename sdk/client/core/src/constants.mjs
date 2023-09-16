import packageJson from '../package.json';
const { version: SDK_VERSION } = packageJson;

const SWISHJAM_DEVICE_IDENTIFIER_COOKIE_NAME = 'swishjam_device_identifier';

export { SDK_VERSION, SWISHJAM_DEVICE_IDENTIFIER_COOKIE_NAME }