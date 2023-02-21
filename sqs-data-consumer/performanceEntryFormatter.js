module.exports = class PerformanceEntryFormatter {
  static format = (entry, page_view_identifier) => {
    switch(entry.entryType) {
      case 'element':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatElementEntry(entry) };
      case 'event':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatEventEntry(entry) };
      case 'first-input':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatFirstInputEntry(entry) };
      case 'largest-contentful-paint':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatLargestContentfulPaintEntry(entry) };
      case 'longtask':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatLongTaskEntry(entry) };
      case 'taskattribution':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatTaskAttributionEntry(entry) };
      case 'mark':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatMarkEntry(entry) };
      case 'measure':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatMeasureEntry(entry) };
      case 'navigation':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatNavigationEntry(entry) };
      case 'paint':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatPaintEntry(entry) };
      case 'resource':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatResourceEntry(entry) };
      case 'layout-shift':
        return { page_view_identifier, ...PerformanceEntryFormatter._formatLayoutShiftEntry(entry) };
      default:
        console.warn(`Unknown performance entry type: ${entry.entryType}`);
        return { page_view_identifier, entry_type: entry.entryType };
    }
  }
  
  static _formatElementEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      element_identifier: entry.element,
      element_identifier_type: entry.id,
      identifier: entry.identifier,
      intersection_rect: entry.intersectionRect,
      load_time: entry.loadTime,
      natural_height: entry.naturalHeight,
      render_time: entry.renderTime,
      url: entry.url,
    }
  }
  
  static _formatEventEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      interaction_id: entry.interactionId,
      processing_start: entry.processingStart,
      processing_end: entry.processingEnd,
      target: entry.target,
    }
  }
  
  static _formatFirstInputEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      interaction_id: entry.interactionId,
      processing_start: entry.processingStart,
      processing_end: entry.processingEnd,
      target: entry.target,
    }
  }
  
  static _formatLargestContentfulPaintEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      element_identifier: entry.element,
      render_time: entry.renderTime,
      load_time: entry.loadTime,
      size: entry.size,
      element_id: entry.id,
      url: entry.url,
    }
  }
  
  static _formatLongTaskEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
    }
  }
  
  static _formatTaskAttributionEntry(entry) {
    return {
      long_task_performance_entry_id: '',
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      container_type: entry.containerType,
      container_src: entry.containerSrc,
      container_id: entry.containerId,
      container_name: entry.containerName,
    }
  }
  
  static _formatMarkEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      detail: entry.detail,
    }
  }
  
  static _formatMeasureEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      detail: entry.detail,
    }
  }
  
  static _formatNavigationEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      initiator_type: entry.initiatorType,
      dom_complete: entry.domComplete,
      dom_content_loaded_event_end: entry.domContentLoadedEventEnd,
      dom_content_loaded_event_start: entry.domContentLoadedEventStart,
      dom_interactive: entry.domInteractive,
      load_event_end: entry.loadEventEnd,
      load_event_start: entry.loadEventStart,
      redirect_count: entry.redirectCount,
      type: entry.type,
      unload_event_end: entry.unloadEventEnd,
      unload_event_start: entry.unloadEventStart,
    }
  }

  static _formatPaintEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
    }
  }

  static _formatResourceEntry(entry) {
    return {
      name: entry.name,
      entry_type: entry.entryType,
      start_time: entry.startTime,
      duration: entry.duration,
      initiator_type: entry.initiatorType,
      render_blocking_status: entry.renderBlockingStatus,
      worker_start: entry.workerStart,
      redirect_start: entry.redirectStart,
      redirect_end: entry.redirectEnd,
      fetch_start: entry.fetchStart,
      domain_lookup_start: entry.domainLookupStart,
      domain_lookup_end: entry.domainLookupEnd,
      connect_start: entry.connectStart,
      connect_end: entry.connectEnd,
      secure_connection_start: entry.secureConnectionStart,
      request_start: entry.requestStart,
      response_start: entry.responseStart,
      response_end: entry.responseEnd,
      transfer_size: entry.transferSize,
      encoded_body_size: entry.encodedBodySize,
      decoded_body_size: entry.decodedBodySize,
      // response_status: entry.responseStatus
    }
  }

  static _formatLayoutShiftEntry(entry) {
    return {
      name: entry.name,
      entry_type: entry.entryType,
      start_time: entry.startTime,
      duration: entry.duration,
      value: entry.value,
      last_input_time: entry.lastInputTime,
    }
  }
}