const ElementPerformanceEntryEvent = require('./performanceEntries/elementPerformanceEntryEvent');
const EventPerformanceEntryEvent = require('./performanceEntries/eventPerformanceEntryEvent');
const FirstInputPerformanceEntryEvent = require('./performanceEntries/firstInputPerformanceEntryEvent');
const LargestContentfulPaintPerformanceEntryEvent = require('./performanceEntries/largestContentfulPaintPerformanceEntryEvent');
const LongTaskPerformanceEntryEvent = require('./performanceEntries/longTaskPerformanceEntryEvent');
const TaskAttributionPerformanceEntryEvent = require('./performanceEntries/taskAttributionPerformanceEntryEvent');
const MarkPerformanceEntryEvent = require('./performanceEntries/markPerformanceEntryEvent');
const MeasurePerformanceEntryEvent = require('./performanceEntries/measurePerformanceEntryEvent');
const NavigationPerformanceEntryEvent = require('./performanceEntries/navigationPerformanceEntryEvent');
const PaintPerformanceEntryEvent = require('./performanceEntries/paintPerformanceEntryEvent');
const ResourcePerformanceEntryEvent = require('./performanceEntries/resourcePerformanceEntryEvent');
const LayoutShiftPerformanceEntryEvent = require('./performanceEntries/layoutShiftPerformanceEntryEvent');

const ENTRY_TYPE_TO_EVENT_CLASS_MAP = {
  'element': ElementPerformanceEntryEvent,
  'event': EventPerformanceEntryEvent,
  'first-input': FirstInputPerformanceEntryEvent,
  'largest-contentful-paint': LargestContentfulPaintPerformanceEntryEvent,
  'longtask': LongTaskPerformanceEntryEvent,
  'taskattribution': TaskAttributionPerformanceEntryEvent,
  'mark': MarkPerformanceEntryEvent,
  'measure': MeasurePerformanceEntryEvent,
  'navigation': NavigationPerformanceEntryEvent,
  'paint': PaintPerformanceEntryEvent,
  'resource': ResourcePerformanceEntryEvent,
  'layout-shift': LayoutShiftPerformanceEntryEvent,
};

module.exports = class PerformanceEntryEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }

  async createPerformanceEntry() {
    const eventClass = ENTRY_TYPE_TO_EVENT_CLASS_MAP[this.event.data.entryType];
    if (eventClass) {
      await new eventClass(this.event, this.db).create();
      console.log(`Created new performance entry ${this.event.data.entryType}`);
    } else {
      console.warn(`Unknown performance entry type: ${this.event.data.entryType}`);
      return { 
        unique_identifier: this.event.uniqueIdentifier, 
        page_view_identifier: this.event.pageViewIdentifier, 
        site_id: this.event.siteId,
        entry_type: this.event.data.entryType 
      };
    }
  }
}