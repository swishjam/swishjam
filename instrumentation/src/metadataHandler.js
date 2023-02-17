export class MetadataHandler {
  static getMetadata() {
    return {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: window.navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      connection: {
        effectiveType: window.navigator.connection.effectiveType,
        downlink: window.navigator.connection.downlink,
        rtt: window.navigator.connection.rtt,
      },
    }
  }
}