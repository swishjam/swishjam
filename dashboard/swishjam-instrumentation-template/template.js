(()=>{var e={141:(e,t,n)=>{const{UuidGenerator:r}=n(633);e.exports={PageViewTracker:class{constructor(e){this.reportingHandler=e,this._setPageLeftListener()}trackPageView({navigationType:e,previousPageUrl:t}){return this._reportPageLeftAtTsIfNecessary(),this.currentPageViewIdentifier=r.generate("page_view"),this.reportingHandler.setCurrentPageViewIdentifier(this.currentPageViewIdentifier),this.reportingHandler.recordEvent("PAGE_VIEW",{pageLoadTs:Date.now(),navigationType:e,url:encodeURIComponent(window.location.href||""),referrerUrl:encodeURIComponent(t||""),userAgent:window.navigator?.userAgent,screenWidth:window.innerWidth,screenHeight:window.innerHeight,connection:{effectiveType:window.navigator?.connection?.effectiveType,downlink:window.navigator?.connection?.downlink,rtt:window.navigator?.connection?.rtt}},this.currentPageViewIdentifier),window.location.href}_reportPageLeftAtTsIfNecessary(){this.currentPageViewIdentifier&&(this.reportingHandler.recordEvent("PAGE_LEFT",{pageLoadId:this.currentPageViewIdentifier,leftPageAtTs:Date.now()}),this.reportingHandler.reportData())}_setPageLeftListener(){document.addEventListener("visibilitychange",(()=>{"hidden"===document.visibilityState&&this._reportPageLeftAtTsIfNecessary()}))}}}},751:(e,t,n)=>{const{navigationEntry:r,longtaskEntry:i,paintEntry:o,resourceEntry:a,largestContentfulPaintEntry:s,firstInputEntry:c,layoutShiftEntry:d,elementEntry:u,eventEntry:p,markEntry:l,measureEntry:m}=n(296);e.exports={PerformanceEntriesHandler:class{constructor(e,t={}){this.reportingHandler=e,this.performanceEntryTypesToCapture=t.performanceEntryTypesToCapture||["paint","longtask","navigation","resource","largest-contentful-paint","first-input","layout-shift"],this.ignoredPerformanceEntryUrls=[...t.ignoredPerformanceEntryUrls||[],...t.includeSwishjamResourcesEntries?[]:[t.reportingUrl]]}beginCapturingPerformanceEntries(){this._getPerformanceEntries().forEach((e=>{this.ignoredPerformanceEntryUrls.includes(e.name)||this.reportingHandler.recordEvent("PERFORMANCE_ENTRY",this._formattedPerformanceEntry(e))})),this._onPerformanceEntries((e=>{e.forEach((e=>{this.ignoredPerformanceEntryUrls.includes(e.name)||this.reportingHandler.recordEvent("PERFORMANCE_ENTRY",this._formattedPerformanceEntry(e))}))}))}_onPerformanceEntries(e){if(window.PerformanceObserver)return new PerformanceObserver(((t,n)=>e(t.getEntries()))).observe({entryTypes:this.performanceEntryTypesToCapture})}_getPerformanceEntries(){return window.performance&&window.performance.getEntries?window.performance.getEntries().filter((e=>this.performanceEntryTypesToCapture.includes(e.entryType))):[]}_formattedPerformanceEntry(e){switch(e.entryType){case"paint":return o(e);case"longtask":return i(e);case"navigation":return r(e);case"resource":return a(e);case"largest-contentful-paint":return s(e);case"first-input":return c(e);case"layout-shift":return d(e);case"element":return u(e);case"event":return p(e);case"mark":return l(e);case"measure":return m(e);default:return console.warn("Unexpected Swishjam performance entry: ",e.entryType),e.toJSON()}}}}},22:(e,t,n)=>{const{onLCP:r,onFID:i,onCLS:o,onFCP:a,onTTFB:s,onINP:c}=n(511);e.exports={PerformanceMetricsHandler:class{constructor(e){this.reportingHandler=e}beginCapturingPerformanceMetrics(){r((e=>this._reportCWV("LCP",e))),a((e=>this._reportCWV("FCP",e))),o((e=>this._reportCWV("CLS",e))),i((e=>this._reportCWV("FID",e))),s((e=>this._reportCWV("TTFB",e))),c((e=>this._reportCWV("INP",e)))}_reportCWV(e,t){this.reportingHandler.recordEvent("PAGE_LOAD_METRIC",{type:e,value:t.value})}}}},381:(e,t,n)=>{const{UuidGenerator:r}=n(633),i=["PAGE_VIEW","PAGE_LEFT","PAGE_LOAD_METRIC","PERFORMANCE_ENTRY"];e.exports={ReportingHandler:class{constructor(e={}){this.reportingUrl=e.reportingUrl||(()=>{throw new Error("`ReportingHandler` missing required option: `reportingUrl`.")})(),this.publicApiKey=e.publicApiKey||(()=>{throw new Error("`ReportingHandler` missing required option: `publicApiKey`.")})(),this.maxNumEventsInMemory=e.maxNumEventsInMemory||25,this.reportAfterIdleTimeMs=e.reportAfterIdleTimeMs||1e4,this.reportingIdleTimeCheckInterval=e.reportingIdleTimeCheckInterval||5e3,this.mockApiCalls=e.mockApiCalls||!1,this.maxNumEventsPerPage=e.maxNumEventsPerPage||250,this.pageViewEventCounter={},this.dataToReport=[],this._setReportingOnIdleTimeInterval()}setCurrentPageViewIdentifier(e){this.currentPageViewIdentifier=e}recordEvent(e,t,n=null){if(!i.includes(e))throw new Error(`Invalid event: ${e}. Valid event types are: ${i.join(", ")}.`);if(!this.currentPageViewIdentifier)throw new Error("ReportingHandler has no currentPageViewIdentifier, cannot record event.");this.pageViewEventCounter[this.currentPageViewIdentifier]=(this.pageViewEventCounter[this.currentPageViewIdentifier]||0)+1,this.pageViewEventCounter[this.currentPageViewIdentifier]>this.maxNumEventsPerPage||(this.dataToReport.push({_event:e,uuid:n||r.generate(e.toLowerCase()),siteId:this.publicApiKey,projectKey:this.publicApiKey,pageViewUuid:this.currentPageViewIdentifier,ts:Date.now(),data:t}),this.lastEventRecordedAtTs=Date.now(),this.dataToReport.length>=this.maxNumEventsInMemory&&this._reportDataIfNecessary())}reportData=this._reportDataIfNecessary;_hasDataToReport(){return this.dataToReport.length>0}_setReportingOnIdleTimeInterval(){setInterval((()=>{this.lastEventRecordedAtTs&&Date.now()-this.lastEventRecordedAtTs>=this.reportAfterIdleTimeMs&&this._reportDataIfNecessary()}),this.reportingIdleTimeCheckInterval)}_reportDataIfNecessary(){if(!this._hasDataToReport())return;const e={siteId:this.publicApiKey,projectKey:this.publicApiKey,originatingUrl:window.encodeURIComponent(window.location.href),swishjamVersion:window.Swishjam.config.version,data:this.dataToReport};if(this.mockApiCalls)console.log("Reporting data to mock API",e);else if(navigator.sendBeacon)try{const t=new Blob([JSON.stringify(e)],{});window.navigator.sendBeacon(this.reportingUrl,t)}catch(e){}else try{const t=new XMLHttpRequest;t.open("POST",this.reportingUrl),t.setRequestHeader("Content-Type","application/json"),t.setRequestHeader("Access-Control-Allow-Origin","*"),t.send(JSON.stringify(e))}catch(e){}this.dataToReport=[]}}}},296:(e,t,n)=>{"use strict";function r(e){return{name:encodeURIComponent(e.name||""),url:encodeURIComponent(e.url||""),duration:e.duration,entryType:e.entryType,startTime:e.startTime,element:f(e.element),id:e.id,identifier:e.identifier,intersectionRect:e.intersectionRect,loadTime:e.loadTime,naturalHeight:e.naturalHeight,renderTime:e.renderTime}}function i(e){return{name:encodeURIComponent(e.name||""),duration:e.duration,entryType:e.entryType,startTime:e.startTime,interactionId:e.interactionId,processingStart:e.processingStart,processingEnd:e.processingEnd,target:f(e.target)}}function o(e){return{name:encodeURIComponent(e.name||""),duration:e.duration,entryType:e.entryType,startTime:e.startTime,detail:e.detail}}function a(e){return{name:encodeURIComponent(e.name||""),duration:e.duration,entryType:e.entryType,startTime:e.startTime,detail:e.detail}}function s(e){return{name:encodeURIComponent(e.name||""),entryType:e.entryType,startTime:e.startTime,duration:e.duration,value:e.value,lastInputTime:e.lastInputTime}}function c(e){return{name:encodeURIComponent(e.name||""),duration:e.duration,entryType:e.entryType,startTime:e.startTime,interactionId:e.interactionId,processingStart:e.processingStart,processingEnd:e.processingEnd,target:f(e.target)}}function d(e){return{name:encodeURIComponent(e.name||""),url:encodeURIComponent(e.url||""),duration:e.duration,entryType:e.entryType,startTime:e.startTime,element:f(e.element),renderTime:e.renderTime,loadTime:e.loadTime,size:e.size,id:e.id}}function u(e){return{name:encodeURIComponent(e.name||""),entryType:e.entryType,startTime:e.startTime,duration:e.duration,initiatorType:e.initiatorType,renderBlockingStatus:e.renderBlockingStatus,workerStart:e.workerStart,redirectStart:e.redirectStart,redirectEnd:e.redirectEnd,fetchStart:e.fetchStart,domainLookupStart:e.domainLookupStart,domainLookupEnd:e.domainLookupEnd,connectStart:e.connectStart,connectEnd:e.connectEnd,secureConnectionStart:e.secureConnectionStart,requestStart:e.requestStart,responseStart:e.responseStart,responseEnd:e.responseEnd,transferSize:e.transferSize,encodedBodySize:e.encodedBodySize,decodedBodySize:e.decodedBodySize,nextHopProtocol:e.nextHopProtocol}}function p(e){return{name:encodeURIComponent(e.name||""),entryType:e.entryType,startTime:e.startTime,duration:e.duration}}function l(e){return{name:encodeURIComponent(e.name||""),duration:e.duration,entryType:e.entryType,startTime:e.startTime,attribution:(e.attribution||[]).map((e=>({containerSrc:encodeURIComponent(e.containerSrc||""),containerName:encodeURIComponent(e.containerName||""),duration:e.duration,entryType:e.entryType,name:e.name,startTime:e.startTime,containerType:e.containerType,containerId:e.containerId})))}}function m(e){return{name:encodeURIComponent(e.name||""),duration:e.duration,entryType:e.entryType,startTime:e.startTime,initiatorType:e.initiatorType,domComplete:e.domComplete,domContentLoadedEventEnd:e.domContentLoadedEventEnd,domContentLoadedEventStart:e.domContentLoadedEventStart,domInteractive:e.domInteractive,loadEventEnd:e.loadEventEnd,loadEventStart:e.loadEventStart,redirectCount:e.redirectCount,type:e.type,unloadEventEnd:e.unloadEventEnd,unloadEventStart:e.unloadEventStart,connectEnd:e.connectEnd,connectStart:e.connectStart,decodedBodySize:e.decodedBodySize,domainLookupEnd:e.domainLookupEnd,domainLookupStart:e.domainLookupStart,encodedBodySize:e.encodedBodySize,fetchStart:e.fetchStart,redirectEnd:e.redirectEnd,redirectStart:e.redirectStart,renderBlockingStatus:e.renderBlockingStatus,requestStart:e.requestStart,responseEnd:e.responseEnd,responseStart:e.responseStart,responseStatus:e.responseStatus,secureConnectionStart:e.secureConnectionStart,transferSize:e.transferSize}}function f(e){if(e)try{return e.nodeName+(e.getAttribute("src")?"+SRC="+e.getAttribute("src"):e.getAttribute("href")?"+HREF="+e.getAttribute("href"):e.innerText&&e.innerText.length>0?"+TEXT="+e.innerText:e.getAttribute("id")?"+ID="+e.getAttribute("id"):e.getAttribute("class")?"+CLASS="+e.getAttribute("class"):null)}catch(e){}}n.r(t),n.d(t,{elementEntry:()=>r,eventEntry:()=>i,firstInputEntry:()=>c,largestContentfulPaintEntry:()=>d,layoutShiftEntry:()=>s,longtaskEntry:()=>l,markEntry:()=>o,measureEntry:()=>a,navigationEntry:()=>m,paintEntry:()=>p,resourceEntry:()=>u})},851:(e,t,n)=>{const{ReportingHandler:r}=n(381),{PageViewTracker:i}=n(141),{PerformanceEntriesHandler:o}=n(751),{PerformanceMetricsHandler:a}=n(22);class s{static init(e={}){if(window.Swishjam)console.warn("Swishjam already initialized, not instrumenting page");else if(e=s._setConfig(e),window.Swishjam={config:e},Math.random()>e.sampleRate)console.warn("Swishjam sample rate not met, not instrumenting page");else{const t=new r({reportingUrl:e.reportingUrl,publicApiKey:e.publicApiKey,maxNumEventsInMemory:e.maxNumEventsInMemory,maxNumEventsPerPage:e.maxNumEventsPerPage,reportAfterIdleTimeMs:e.reportAfterIdleTimeMs,reportingIdleTimeCheckInterval:e.reportingIdleTimeCheckInterval,mockApiCalls:e.mockApiCalls}),n=new i(t);let s=n.trackPageView({navigationType:"hard",previousPageUrl:document.referrer});if(e.disablePerformanceEntriesCapture||new o(t,{performanceEntryTypesToCapture:e.performanceEntryTypesToCapture,includeSwishjamResourcesEntries:e.includeSwishjamResourcesEntries,reportingUrl:e.reportingUrl}).beginCapturingPerformanceEntries(),new a(t).beginCapturingPerformanceMetrics(),window.addEventListener("hashchange",(()=>{s=n.trackPageView({navigationType:"soft",previousPageUrl:s})})),window.addEventListener("popstate",(()=>{s=n.trackPageView({navigationType:"soft",previousPageUrl:s})})),window.history.pushState){const e=window.history.pushState;window.history.pushState=function(){e.apply(this,arguments),s=n.trackPageView({navigationType:"soft",previousPageUrl:s})}}}}static _setConfig(e){if(!e.reportingUrl)throw new Error("Swishjam `reportingUrl` is required");if(!e.publicApiKey)throw new Error("Swishjam `publicApiKey` is required");return{version:"0.0.249",reportingUrl:e.reportingUrl,publicApiKey:e.publicApiKey,sampleRate:e.sampleRate||1,maxNumEventsInMemory:e.maxNumEventsInMemory||25,reportAfterIdleTimeMs:e.reportAfterIdleTimeMs||1e4,reportingIdleTimeCheckInterval:e.reportingIdleTimeCheckInterval||2e3,maxNumEventsPerPage:e.maxNumEventsPerPage||250,mockApiCalls:e.mockApiCalls||!1,performanceEntryTypesToCapture:e.performanceEntryTypesToCapture||window.PerformanceObserver?window.PerformanceObserver.supportedEntryTypes:[],includeSwishjamResourcesEntries:e.includeSwishjamResourcesEntries||!1,disablePerformanceEntriesCapture:e.disablePerformanceEntriesCapture||!1}}}e.exports={Swishjam:s}},633:e=>{e.exports={UuidGenerator:class{static generate(e){return`${e}-${Date.now()}-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.replace(/x/g,(function(e){var t=16*Math.random()|0;return("x"==e?t:3&t|8).toString(16)}))}}}},511:function(e,t){!function(e){"use strict";var t,n,r,i,o,a=-1,s=function(e){addEventListener("pageshow",(function(t){t.persisted&&(a=t.timeStamp,e(t))}),!0)},c=function(){return window.performance&&performance.getEntriesByType&&performance.getEntriesByType("navigation")[0]},d=function(){var e=c();return e&&e.activationStart||0},u=function(e,t){var n=c(),r="navigate";return a>=0?r="back-forward-cache":n&&(r=document.prerendering||d()>0?"prerender":document.wasDiscarded?"restore":n.type.replace(/_/g,"-")),{name:e,value:void 0===t?-1:t,rating:"good",delta:0,entries:[],id:"v3-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:r}},p=function(e,t,n){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var r=new PerformanceObserver((function(e){Promise.resolve().then((function(){t(e.getEntries())}))}));return r.observe(Object.assign({type:e,buffered:!0},n||{})),r}}catch(e){}},l=function(e,t,n,r){var i,o;return function(a){t.value>=0&&(a||r)&&((o=t.value-(i||0))||void 0===i)&&(i=t.value,t.delta=o,t.rating=function(e,t){return e>t[1]?"poor":e>t[0]?"needs-improvement":"good"}(t.value,n),e(t))}},m=function(e){requestAnimationFrame((function(){return requestAnimationFrame((function(){return e()}))}))},f=function(e){var t=function(t){"pagehide"!==t.type&&"hidden"!==document.visibilityState||e(t)};addEventListener("visibilitychange",t,!0),addEventListener("pagehide",t,!0)},g=function(e){var t=!1;return function(n){t||(e(n),t=!0)}},h=-1,y=function(){return"hidden"!==document.visibilityState||document.prerendering?1/0:0},E=function(e){"hidden"===document.visibilityState&&h>-1&&(h="visibilitychange"===e.type?e.timeStamp:0,T())},v=function(){addEventListener("visibilitychange",E,!0),addEventListener("prerenderingchange",E,!0)},T=function(){removeEventListener("visibilitychange",E,!0),removeEventListener("prerenderingchange",E,!0)},w=function(){return h<0&&(h=y(),v(),s((function(){setTimeout((function(){h=y(),v()}),0)}))),{get firstHiddenTime(){return h}}},S=function(e){document.prerendering?addEventListener("prerenderingchange",(function(){return e()}),!0):e()},P=[1800,3e3],C=function(e,t){t=t||{},S((function(){var n,r=w(),i=u("FCP"),o=p("paint",(function(e){e.forEach((function(e){"first-contentful-paint"===e.name&&(o.disconnect(),e.startTime<r.firstHiddenTime&&(i.value=Math.max(e.startTime-d(),0),i.entries.push(e),n(!0)))}))}));o&&(n=l(e,i,P,t.reportAllChanges),s((function(r){i=u("FCP"),n=l(e,i,P,t.reportAllChanges),m((function(){i.value=performance.now()-r.timeStamp,n(!0)}))})))}))},I=[.1,.25],A=function(e,t){t=t||{},C(g((function(){var n,r=u("CLS",0),i=0,o=[],a=function(e){e.forEach((function(e){if(!e.hadRecentInput){var t=o[0],n=o[o.length-1];i&&e.startTime-n.startTime<1e3&&e.startTime-t.startTime<5e3?(i+=e.value,o.push(e)):(i=e.value,o=[e])}})),i>r.value&&(r.value=i,r.entries=o,n())},c=p("layout-shift",a);c&&(n=l(e,r,I,t.reportAllChanges),f((function(){a(c.takeRecords()),n(!0)})),s((function(){i=0,r=u("CLS",0),n=l(e,r,I,t.reportAllChanges),m((function(){return n()}))})),setTimeout(n,0))})))},R={passive:!0,capture:!0},L=new Date,x=function(e,i){t||(t=i,n=e,r=new Date,U(removeEventListener),_())},_=function(){if(n>=0&&n<r-L){var e={entryType:"first-input",name:t.type,target:t.target,cancelable:t.cancelable,startTime:t.timeStamp,processingStart:t.timeStamp+n};i.forEach((function(t){t(e)})),i=[]}},b=function(e){if(e.cancelable){var t=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,t){var n=function(){x(e,t),i()},r=function(){i()},i=function(){removeEventListener("pointerup",n,R),removeEventListener("pointercancel",r,R)};addEventListener("pointerup",n,R),addEventListener("pointercancel",r,R)}(t,e):x(t,e)}},U=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach((function(t){return e(t,b,R)}))},k=[100,300],M=function(e,r){r=r||{},S((function(){var o,a=w(),c=u("FID"),d=function(e){e.startTime<a.firstHiddenTime&&(c.value=e.processingStart-e.startTime,c.entries.push(e),o(!0))},m=function(e){e.forEach(d)},h=p("first-input",m);o=l(e,c,k,r.reportAllChanges),h&&f(g((function(){m(h.takeRecords()),h.disconnect()}))),h&&s((function(){var a;c=u("FID"),o=l(e,c,k,r.reportAllChanges),i=[],n=-1,t=null,U(addEventListener),a=d,i.push(a),_()}))}))},N=0,H=1/0,V=0,D=function(e){e.forEach((function(e){e.interactionId&&(H=Math.min(H,e.interactionId),V=Math.max(V,e.interactionId),N=V?(V-H)/7+1:0)}))},F=function(){return o?N:performance.interactionCount||0},j=function(){"interactionCount"in performance||o||(o=p("event",D,{type:"event",buffered:!0,durationThreshold:0}))},O=[200,500],B=0,K=function(){return F()-B},W=[],z={},q=function(e){var t=W[W.length-1],n=z[e.interactionId];if(n||W.length<10||e.duration>t.latency){if(n)n.entries.push(e),n.latency=Math.max(n.latency,e.duration);else{var r={id:e.interactionId,latency:e.duration,entries:[e]};z[r.id]=r,W.push(r)}W.sort((function(e,t){return t.latency-e.latency})),W.splice(10).forEach((function(e){delete z[e.id]}))}},G=function(e,t){t=t||{},S((function(){j();var n,r=u("INP"),i=function(e){e.forEach((function(e){e.interactionId&&q(e),"first-input"===e.entryType&&!W.some((function(t){return t.entries.some((function(t){return e.duration===t.duration&&e.startTime===t.startTime}))}))&&q(e)}));var t,i=(t=Math.min(W.length-1,Math.floor(K()/50)),W[t]);i&&i.latency!==r.value&&(r.value=i.latency,r.entries=i.entries,n())},o=p("event",i,{durationThreshold:t.durationThreshold||40});n=l(e,r,O,t.reportAllChanges),o&&(o.observe({type:"first-input",buffered:!0}),f((function(){i(o.takeRecords()),r.value<0&&K()>0&&(r.value=0,r.entries=[]),n(!0)})),s((function(){W=[],B=F(),r=u("INP"),n=l(e,r,O,t.reportAllChanges)})))}))},J=[2500,4e3],Y={},$=function(e,t){t=t||{},S((function(){var n,r=w(),i=u("LCP"),o=function(e){var t=e[e.length-1];t&&t.startTime<r.firstHiddenTime&&(i.value=Math.max(t.startTime-d(),0),i.entries=[t],n())},a=p("largest-contentful-paint",o);if(a){n=l(e,i,J,t.reportAllChanges);var c=g((function(){Y[i.id]||(o(a.takeRecords()),a.disconnect(),Y[i.id]=!0,n(!0))}));["keydown","click"].forEach((function(e){addEventListener(e,c,!0)})),f(c),s((function(r){i=u("LCP"),n=l(e,i,J,t.reportAllChanges),m((function(){i.value=performance.now()-r.timeStamp,Y[i.id]=!0,n(!0)}))}))}}))},X=[800,1800],Q=function e(t){document.prerendering?S((function(){return e(t)})):"complete"!==document.readyState?addEventListener("load",(function(){return e(t)}),!0):setTimeout(t,0)},Z=function(e,t){t=t||{};var n=u("TTFB"),r=l(e,n,X,t.reportAllChanges);Q((function(){var i=c();if(i){var o=i.responseStart;if(o<=0||o>performance.now())return;n.value=Math.max(o-d(),0),n.entries=[i],r(!0),s((function(){n=u("TTFB",0),(r=l(e,n,X,t.reportAllChanges))(!0)}))}}))};e.CLSThresholds=I,e.FCPThresholds=P,e.FIDThresholds=k,e.INPThresholds=O,e.LCPThresholds=J,e.TTFBThresholds=X,e.getCLS=A,e.getFCP=C,e.getFID=M,e.getINP=G,e.getLCP=$,e.getTTFB=Z,e.onCLS=A,e.onFCP=C,e.onFID=M,e.onINP=G,e.onLCP=$,e.onTTFB=Z,Object.defineProperty(e,"__esModule",{value:!0})}(t)}},t={};function n(r){var i=t[r];if(void 0!==i)return i.exports;var o=t[r]={exports:{}};return e[r].call(o.exports,o,o.exports,n),o.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{"use strict";var e=n(851);"complete"===document.readyState?e.Swishjam.init({reportingUrl:"{{SWISHJAM_REPLACE_REPORTING_URL}}",publicApiKey:"{{SWISHJAM_REPLACE_PUBLIC_API_KEY}}",sampleRate:"{{SWISHJAM_REPLACE_SAMPLE_RATE}}"}):window.addEventListener("load",(function(){e.Swishjam.init({reportingUrl:"{{SWISHJAM_REPLACE_REPORTING_URL}}",publicApiKey:"{{SWISHJAM_REPLACE_PUBLIC_API_KEY}}",sampleRate:"{{SWISHJAM_REPLACE_SAMPLE_RATE}}"})}))})()})();