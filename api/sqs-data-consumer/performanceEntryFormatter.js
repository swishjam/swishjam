module.exports = class PerformanceEntryFormatter {
  static format(entry, page_load_identifier) {
    switch(entry.entryType) {
      case 'element':
        return { page_load_identifier, ...this._formatElementEntry(entry) };
      case 'event':
        return { page_load_identifier, ...this._formatEventEntry(entry) };
      case 'first-input':
        return { page_load_identifier, ...this._formatFirstInputEntry(entry) };
      case 'largest-contentful-paint':
        return { page_load_identifier, ...this._formatLargestContentfulPaintEntry(entry) };
      case 'longtask':
        return { page_load_identifier, ...this._formatLongTaskEntry(entry) };
      case 'taskattribution':
        return { page_load_identifier, ...this._formatTaskAttributionEntry(entry) };
      case 'mark':
        return { page_load_identifier, ...this._formatMarkEntry(entry) };
      case 'measure':
        return { page_load_identifier, ...this._formatMeasureEntry(entry) };
      case 'navigation':
        return { page_load_identifier, ...this._formatNavigationEntry(entry) };
      default:
        return null;
    }
  }
  
  _formatElementEntry(entry) {
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
  
  _formatEventEntry(entry) {
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
  
  _formatFirstInputEntry(entry) {
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
  
  _formatLargestContentfulPaintEntry(entry) {
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
  
  _formatLongTaskEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
    }
  }
  
  _formatTaskAttributionEntry(entry) {
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
  
  _formatMarkEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      detail: entry.detail,
    }
  }
  
  _formatMeasureEntry(entry) {
    return {
      duration: entry.duration,
      entry_type: entry.entryType,
      name: entry.name,
      start_time: entry.startTime,
      detail: entry.detail,
    }
  }
  
  _formatNavigationEntry(entry) {
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
}