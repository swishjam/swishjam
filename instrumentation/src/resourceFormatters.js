export function elementEntry(entry) {
  return {
    duration: entry.duration,
    entryType: entry.entryType,
    name: encodeURIComponent(entry.name || ""),
    startTime: entry.startTime,
    element: entry.element,
    id: entry.id,
    identifier: entry.identifier,
    intersectionRect: entry.intersectionRect,
    loadTime: entry.loadTime,
    naturalHeight: entry.naturalHeight,
    renderTime: entry.renderTime,
    url: encodeURIComponent(entry.url || ''),
  }
}

export function eventEntry(entry) {
  return {
    duration: entry.duration,
    entryType: entry.entryType,
    name: encodeURIComponent(entry.name || ""),
    startTime: entry.startTime,
    interactionId: entry.interactionId,
    processingStart: entry.processingStart,
    processingEnd: entry.processingEnd,
    target: entry.target,
  }
}

export function markEntry(entry) {
  return {
    duration: entry.duration,
    entryType: entry.entryType,
    name: encodeURIComponent(entry.name || ""),
    startTime: entry.startTime,
    detail: entry.detail,
  }
}

export function measureEntry(entry) {
  return {
    duration: entry.duration,
    entryType: entry.entryType,
    name: encodeURIComponent(data.name || ""),
    startTime: entry.startTime,
    detail: entry.detail,
  }
}

export function layoutShiftEntry(entry) {
  return {
    name: encodeURIComponent(data.name || ""),
    entryType: entry.entryType,
    startTime: entry.startTime,
    duration: entry.duration,
    value: entry.value,
    lastInputTime: entry.lastInputTime,
  }
}

export function firstInputEntry(entry) {
  return {
    duration: entry.duration,
    entryType: entry.entryType,
    name: encodeURIComponent(entry.name || ""),
    startTime: entry.startTime,
    interactionId: entry.interactionId,
    processingStart: entry.processingStart,
    processingEnd: entry.processingEnd,
    target: entry.target,
  }
}

export function largestContentfulPaintEntry(entry) {
  return {
    duration: entry.duration,
    entryType: entry.entryType,
    name: encodeURIComponent(entry.name || ""),
    startTime: entry.startTime,
    element: entry.element,
    renderTime: entry.renderTime,
    loadTime: entry.loadTime,
    size: entry.size,
    id: entry.id,
    url: encodeURIComponent(entry.url || ''),
  }
}

export function formattedResourceEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    entryType: entry.entryType,
    startTime: entry.startTime,
    duration: entry.duration,
    initiatorType: entry.initiatorType,
    renderBlockingStatus: entry.renderBlockingStatus,
    workerStart: entry.workerStart,
    redirectStart: entry.redirectStart,
    redirectEnd: entry.redirectEnd,
    fetchStart: entry.fetchStart,
    domainLookupStart: entry.domainLookupStart,
    domainLookupEnd: entry.domainLookupEnd,
    connectStart: entry.connectStart,
    connectEnd: entry.connectEnd,
    secureConnectionStart: entry.secureConnectionStart,
    requestStart: entry.requestStart,
    responseStart: entry.responseStart,
    responseEnd: entry.responseEnd,
    transferSize: entry.transferSize,
    encodedBodySize: entry.encodedBodySize,
    decodedBodySize: entry.decodedBodySize,
    nextHopProtocol: entry.nextHopProtocol,
  }
}

export function paintEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    entryType: entry.entryType,
    startTime: entry.startTime,
    duration: entry.duration,
  }
}

export function longtaskEntry(entry) {
  return {
    duration: entry.duration,
    entryType: entry.entryType,
    name: encodeURIComponent(entry.name || ""),
    startTime: entry.startTime,
    attribution: (entry.attribution || []).map(attribution => ({
      duration: attribution.duration,
      entryType: attribution.entryType,
      name: attribution.name,
      startTime: attribution.startTime,
      containerType: attribution.containerType,
      containerSrc: encodeURIComponent(attribution.containerSrc || ""),
      containerId: attribution.containerId,
      containerName: encodeURIComponent(attribution.containerName || ""),
    }))
  }
}

export function formattedNavigationEntry(entry) {
  return {
    startTime: entry.startTime,
    initiatorType: entry.initiatorType,
    domComplete: entry.domComplete,
    domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
    domContentLoadedEventStart: entry.domContentLoadedEventStart,
    domInteractive: entry.domInteractive,
    loadEventEnd: entry.loadEventEnd,
    loadEventStart: entry.loadEventStart,
    redirectCount: entry.redirectCount,
    type: entry.type,
    unloadEventEnd: entry.unloadEventEnd,
    unloadEventStart: entry.unloadEventStart,
    connectEnd: entry.connectEnd,
    connectStart: entry.connectStart,
    decodedBodySize: entry.decodedBodySize,
    domainLookupEnd: entry.domainLookupEnd,
    domainLookupStart: entry.domainLookupStart,
    encodedBodySize: entry.encodedBodySize,
    fetchStart: entry.fetchStart,
    redirectEnd: entry.redirectEnd,
    redirectStart: entry.redirectStart,
    renderBlockingStatus: entry.renderBlockingStatus,
    requestStart: entry.requestStart,
    responseEnd: entry.responseEnd,
    responseStart: entry.responseStart,
    responseStatus: entry.responseStatus,
    secureConnectionStart: entry.secureConnectionStart,
    transferSize: entry.transferSize,
  }
}