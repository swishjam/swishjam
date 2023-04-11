export function elementEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    url: encodeURIComponent(entry.url || ''),
    duration: entry.duration,
    entryType: entry.entryType,
    startTime: entry.startTime,
    element: _elementIdentifier(entry.element),
    id: entry.id,
    identifier: entry.identifier,
    intersectionRect: entry.intersectionRect,
    loadTime: entry.loadTime,
    naturalHeight: entry.naturalHeight,
    renderTime: entry.renderTime,
  }
}

export function eventEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    duration: entry.duration,
    entryType: entry.entryType,
    startTime: entry.startTime,
    interactionId: entry.interactionId,
    processingStart: entry.processingStart,
    processingEnd: entry.processingEnd,
    target: _elementIdentifier(entry.target),
  }
}

export function markEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    duration: entry.duration,
    entryType: entry.entryType,
    startTime: entry.startTime,
    detail: entry.detail,
  }
}

export function measureEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    duration: entry.duration,
    entryType: entry.entryType,
    startTime: entry.startTime,
    detail: entry.detail,
  }
}

export function layoutShiftEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    entryType: entry.entryType,
    startTime: entry.startTime,
    duration: entry.duration,
    value: entry.value,
    lastInputTime: entry.lastInputTime,
  }
}

export function firstInputEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    duration: entry.duration,
    entryType: entry.entryType,
    startTime: entry.startTime,
    interactionId: entry.interactionId,
    processingStart: entry.processingStart,
    processingEnd: entry.processingEnd,
    target: _elementIdentifier(entry.target),
  }
}

export function largestContentfulPaintEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    url: encodeURIComponent(entry.url || ''),
    duration: entry.duration,
    entryType: entry.entryType,
    startTime: entry.startTime,
    element: _elementIdentifier(entry.element),
    renderTime: entry.renderTime,
    loadTime: entry.loadTime,
    size: entry.size,
    id: entry.id,
  }
}

export function resourceEntry(entry) {
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
    name: encodeURIComponent(entry.name || ""),
    duration: entry.duration,
    entryType: entry.entryType,
    startTime: entry.startTime,
    attribution: (entry.attribution || []).map(attribution => ({
      containerSrc: encodeURIComponent(attribution.containerSrc || ""),
      containerName: encodeURIComponent(attribution.containerName || ""),
      duration: attribution.duration,
      entryType: attribution.entryType,
      name: attribution.name,
      startTime: attribution.startTime,
      containerType: attribution.containerType,
      containerId: attribution.containerId,
    }))
  }
}

export function navigationEntry(entry) {
  return {
    name: encodeURIComponent(entry.name || ""),
    duration: entry.duration,
    entryType: entry.entryType,
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

function _elementIdentifier(element) {
  if (!element) return;
  try {
    return element.nodeName + (
      element.getAttribute('src')
        ? '+SRC=' + element.getAttribute('src')
        : element.getAttribute('href')
          ? '+HREF=' + element.getAttribute('href')
          : element.innerText && element.innerText.length > 0
            ? '+TEXT=' + element.innerText
            : element.getAttribute('id')
              ? '+ID=' + element.getAttribute('id')
              : element.getAttribute('class')
                ? '+CLASS=' + element.getAttribute('class')
                : null
    )
  } catch(err) {}
}