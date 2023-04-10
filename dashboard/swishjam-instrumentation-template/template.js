(()=>{var e={485:(e,t,n)=>{const{UuidGenerator:r}=n(678);e.exports={PageViewTracker:class{constructor(e){this.reportingHandler=e,this._setPageLeftListener()}trackPageView({navigationType:e,previousPageUrl:t}){return this._reportPageLeftAtTsIfNecessary(),this.currentPageViewIdentifier=r.generate("page_view"),this.reportingHandler.setCurrentPageViewIdentifier(this.currentPageViewIdentifier),this.reportingHandler.recordEvent("PAGE_VIEW",{pageLoadTs:Date.now(),navigationType:e,url:encodeURIComponent(window.location.href||""),referrerUrl:encodeURIComponent(t||""),userAgent:window.navigator.userAgent,screenWidth:window.innerWidth,screenHeight:window.innerHeight,connection:{effectiveType:window.navigator.connection.effectiveType,downlink:window.navigator.connection.downlink,rtt:window.navigator.connection.rtt}},this.currentPageViewIdentifier),window.location.href}_reportPageLeftAtTsIfNecessary(){this.currentPageViewIdentifier&&(this.reportingHandler.recordEvent("PAGE_LEFT",{pageLoadId:this.currentPageViewIdentifier,leftPageAtTs:Date.now()}),this.reportingHandler.reportData())}_setPageLeftListener(){document.addEventListener("visibilitychange",(()=>{"hidden"===document.visibilityState&&this._reportPageLeftAtTsIfNecessary()}))}}}},718:e=>{e.exports={PerformanceEntriesHandler:class{constructor(e,t={}){this.reportingHandler=e,this.performanceEntryTypesToCapture=t.performanceEntryTypesToCapture||["paint","longtask","navigation","resource","largest-contentful-paint","first-input","layout-shift"],this.ignoredPerformanceEntryUrls=[...t.ignoredPerformanceEntryUrls||[],...t.includeSwishjamResourcesEntries?[]:[t.reportingUrl]]}beginCapturingPerformanceEntries(){this._getPerformanceEntries().forEach((e=>{this.ignoredPerformanceEntryUrls.includes(e.name)||this.reportingHandler.recordEvent("PERFORMANCE_ENTRY",this._formattedPerformanceEntry(e))})),this._onPerformanceEntries((e=>{e.forEach((e=>{this.ignoredPerformanceEntryUrls.includes(e.name)||this.reportingHandler.recordEvent("PERFORMANCE_ENTRY",this._formattedPerformanceEntry(e))}))}))}_onPerformanceEntries(e){if(window.PerformanceObserver)return new PerformanceObserver(((t,n)=>{e(t.getEntries())})).observe({entryTypes:this.performanceEntryTypesToCapture})}_getPerformanceEntries(){return window.performance&&window.performance.getEntries?window.performance.getEntries().filter((e=>this.performanceEntryTypesToCapture.includes(e.entryType))):[]}_formattedPerformanceEntry(e){let t={...e.toJSON(),name:encodeURIComponent(e.name||""),url:encodeURIComponent(e.url||"")};return t.attribution&&t.attribution.length>0&&(t.attribution=t.attribution.map((e=>({...e.toJSON(),name:encodeURIComponent(e.name||""),url:encodeURIComponent(e.url||"")})))),t}}}},140:(e,t,n)=>{const{onLCP:r,onFID:i,onCLS:o,onFCP:a,onTTFB:s,onINP:c}=n(338);e.exports={PerformanceMetricsHandler:class{constructor(e){this.reportingHandler=e}beginCapturingPerformanceMetrics(){r((e=>this._reportCWV("LCP",e))),a((e=>this._reportCWV("FCP",e))),o((e=>this._reportCWV("CLS",e))),i((e=>this._reportCWV("FID",e))),s((e=>this._reportCWV("TTFB",e))),c((e=>this._reportCWV("INP",e)))}_reportCWV(e,t){this.reportingHandler.recordEvent("PAGE_LOAD_METRIC",{type:e,value:t.value})}}}},581:(e,t,n)=>{const{UuidGenerator:r}=n(678),i=["PAGE_VIEW","PAGE_LEFT","PAGE_LOAD_METRIC","PERFORMANCE_ENTRY"];e.exports={ReportingHandler:class{constructor(e={}){this.reportingUrl=e.reportingUrl||(()=>{throw new Error("`ReportingHandler` missing required option: `reportingUrl`.")})(),this.publicApiKey=e.publicApiKey||(()=>{throw new Error("`ReportingHandler` missing required option: `publicApiKey`.")})(),this.maxNumEventsInMemory=e.maxNumEventsInMemory||25,this.reportAfterIdleTimeMs=e.reportAfterIdleTimeMs||1e4,this.reportingIdleTimeCheckInterval=e.reportingIdleTimeCheckInterval||5e3,this.mockApiCalls=e.mockApiCalls||!1,this.dataToReport=[],this._setReportingOnIdleTimeInterval()}setCurrentPageViewIdentifier(e){this.currentPageViewIdentifier=e}recordEvent(e,t,n=null){if(!i.includes(e))throw new Error(`Invalid event: ${e}. Valid event types are: ${i.join(", ")}.`);if(!this.currentPageViewIdentifier)throw new Error("ReportingHandler has no currentPageViewIdentifier, cannot record event.");this.dataToReport.push({_event:e,uuid:n||r.generate(e.toLowerCase()),siteId:this.publicApiKey,projectKey:this.publicApiKey,pageViewUuid:this.currentPageViewIdentifier,ts:Date.now(),data:t}),this.lastEventRecordedAtTs=Date.now(),this.dataToReport.length>=this.maxNumEventsInMemory&&this._reportDataIfNecessary()}reportData=this._reportDataIfNecessary;_hasDataToReport(){return this.dataToReport.length>0}_setReportingOnIdleTimeInterval(){setInterval((()=>{this.lastEventRecordedAtTs&&Date.now()-this.lastEventRecordedAtTs>=this.reportAfterIdleTimeMs&&this._reportDataIfNecessary()}),this.reportingIdleTimeCheckInterval)}_reportDataIfNecessary(){if(!this._hasDataToReport())return;const e={siteId:this.publicApiKey,projectKey:this.publicApiKey,originatingUrl:window.encodeURIComponent(window.location.href),data:this.dataToReport};if(this.mockApiCalls)console.log("Reporting data to mock API",e);else if(navigator.sendBeacon)try{const t=new Blob([JSON.stringify(e)],{});window.navigator.sendBeacon(this.reportingUrl,t)}catch(e){}else try{const t=new XMLHttpRequest;t.open("POST",this.reportingUrl),t.setRequestHeader("Content-Type","application/json"),t.setRequestHeader("Access-Control-Allow-Origin","*"),t.send(JSON.stringify(e))}catch(e){}this.dataToReport=[]}}}},777:(e,t,n)=>{const{ReportingHandler:r}=n(581),{PageViewTracker:i}=n(485),{PerformanceEntriesHandler:o}=n(718),{PerformanceMetricsHandler:a}=n(140);class s{static init(e={}){if(window.Swishjam)console.warn("Swishjam already initialized, not instrumenting page");else if(e=s._setConfig(e),window.Swishjam={config:e},Math.random()>e.sampleRate)console.warn("Swishjam sample rate not met, not instrumenting page");else{const t=new r({reportingUrl:e.reportingUrl,publicApiKey:e.publicApiKey,maxNumEventsInMemory:e.maxNumEventsInMemory,reportAfterIdleTimeMs:e.reportAfterIdleTimeMs,reportingIdleTimeCheckInterval:e.reportingIdleTimeCheckInterval,mockApiCalls:e.mockApiCalls}),n=new i(t);let s=n.trackPageView({navigationType:"hard",previousPageUrl:document.referrer});if(e.disablePerformanceEntriesCapture||new o(t,{performanceEntryTypesToCapture:e.performanceEntryTypesToCapture,includeSwishjamResourcesEntries:e.includeSwishjamResourcesEntries,reportingUrl:e.reportingUrl}).beginCapturingPerformanceEntries(),new a(t).beginCapturingPerformanceMetrics(),window.addEventListener("hashchange",(()=>{s=n.trackPageView({navigationType:"soft",previousPageUrl:s})})),window.addEventListener("popstate",(()=>{s=n.trackPageView({navigationType:"soft",previousPageUrl:s})})),window.history.pushState){const e=window.history.pushState;window.history.pushState=function(){e.apply(this,arguments),s=n.trackPageView({navigationType:"soft",previousPageUrl:s})}}}}static _setConfig(e){if(!e.reportingUrl)throw new Error("Swishjam `reportingUrl` is required");if(!e.publicApiKey)throw new Error("Swishjam `publicApiKey` is required");return{reportingUrl:e.reportingUrl,publicApiKey:e.publicApiKey,sampleRate:e.sampleRate||1,maxNumEventsInMemory:e.maxNumEventsInMemory||25,reportAfterIdleTimeMs:e.reportAfterIdleTimeMs||1e4,reportingIdleTimeCheckInterval:e.reportingIdleTimeCheckInterval||2e3,mockApiCalls:e.mockApiCalls||!1,performanceEntryTypesToCapture:e.performanceEntryTypesToCapture||window.PerformanceObserver?window.PerformanceObserver.supportedEntryTypes:[],includeSwishjamResourcesEntries:e.includeSwishjamResourcesEntries||!1,disablePerformanceEntriesCapture:e.disablePerformanceEntriesCapture||!1}}}e.exports={Swishjam:s}},678:e=>{e.exports={UuidGenerator:class{static generate(e){return`${e}-${Date.now()}-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.replace(/x/g,(function(e){var t=16*Math.random()|0;return("x"==e?t:3&t|8).toString(16)}))}}}},338:function(e,t){!function(e){"use strict";var t,n,r,i,o,a=-1,s=function(e){addEventListener("pageshow",(function(t){t.persisted&&(a=t.timeStamp,e(t))}),!0)},c=function(){return window.performance&&performance.getEntriesByType&&performance.getEntriesByType("navigation")[0]},u=function(){var e=c();return e&&e.activationStart||0},p=function(e,t){var n=c(),r="navigate";return a>=0?r="back-forward-cache":n&&(r=document.prerendering||u()>0?"prerender":document.wasDiscarded?"restore":n.type.replace(/_/g,"-")),{name:e,value:void 0===t?-1:t,rating:"good",delta:0,entries:[],id:"v3-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:r}},d=function(e,t,n){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var r=new PerformanceObserver((function(e){Promise.resolve().then((function(){t(e.getEntries())}))}));return r.observe(Object.assign({type:e,buffered:!0},n||{})),r}}catch(e){}},l=function(e,t,n,r){var i,o;return function(a){t.value>=0&&(a||r)&&((o=t.value-(i||0))||void 0===i)&&(i=t.value,t.delta=o,t.rating=function(e,t){return e>t[1]?"poor":e>t[0]?"needs-improvement":"good"}(t.value,n),e(t))}},f=function(e){requestAnimationFrame((function(){return requestAnimationFrame((function(){return e()}))}))},m=function(e){var t=function(t){"pagehide"!==t.type&&"hidden"!==document.visibilityState||e(t)};addEventListener("visibilitychange",t,!0),addEventListener("pagehide",t,!0)},h=function(e){var t=!1;return function(n){t||(e(n),t=!0)}},g=-1,v=function(){return"hidden"!==document.visibilityState||document.prerendering?1/0:0},w=function(e){"hidden"===document.visibilityState&&g>-1&&(g="visibilitychange"===e.type?e.timeStamp:0,y())},E=function(){addEventListener("visibilitychange",w,!0),addEventListener("prerenderingchange",w,!0)},y=function(){removeEventListener("visibilitychange",w,!0),removeEventListener("prerenderingchange",w,!0)},T=function(){return g<0&&(g=v(),E(),s((function(){setTimeout((function(){g=v(),E()}),0)}))),{get firstHiddenTime(){return g}}},P=function(e){document.prerendering?addEventListener("prerenderingchange",(function(){return e()}),!0):e()},I=[1800,3e3],C=function(e,t){t=t||{},P((function(){var n,r=T(),i=p("FCP"),o=d("paint",(function(e){e.forEach((function(e){"first-contentful-paint"===e.name&&(o.disconnect(),e.startTime<r.firstHiddenTime&&(i.value=Math.max(e.startTime-u(),0),i.entries.push(e),n(!0)))}))}));o&&(n=l(e,i,I,t.reportAllChanges),s((function(r){i=p("FCP"),n=l(e,i,I,t.reportAllChanges),f((function(){i.value=performance.now()-r.timeStamp,n(!0)}))})))}))},A=[.1,.25],R=function(e,t){t=t||{},C(h((function(){var n,r=p("CLS",0),i=0,o=[],a=function(e){e.forEach((function(e){if(!e.hadRecentInput){var t=o[0],n=o[o.length-1];i&&e.startTime-n.startTime<1e3&&e.startTime-t.startTime<5e3?(i+=e.value,o.push(e)):(i=e.value,o=[e])}})),i>r.value&&(r.value=i,r.entries=o,n())},c=d("layout-shift",a);c&&(n=l(e,r,A,t.reportAllChanges),m((function(){a(c.takeRecords()),n(!0)})),s((function(){i=0,r=p("CLS",0),n=l(e,r,A,t.reportAllChanges),f((function(){return n()}))})),setTimeout(n,0))})))},_={passive:!0,capture:!0},S=new Date,L=function(e,i){t||(t=i,n=e,r=new Date,M(removeEventListener),b())},b=function(){if(n>=0&&n<r-S){var e={entryType:"first-input",name:t.type,target:t.target,cancelable:t.cancelable,startTime:t.timeStamp,processingStart:t.timeStamp+n};i.forEach((function(t){t(e)})),i=[]}},x=function(e){if(e.cancelable){var t=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,t){var n=function(){L(e,t),i()},r=function(){i()},i=function(){removeEventListener("pointerup",n,_),removeEventListener("pointercancel",r,_)};addEventListener("pointerup",n,_),addEventListener("pointercancel",r,_)}(t,e):L(t,e)}},M=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach((function(t){return e(t,x,_)}))},U=[100,300],H=function(e,r){r=r||{},P((function(){var o,a=T(),c=p("FID"),u=function(e){e.startTime<a.firstHiddenTime&&(c.value=e.processingStart-e.startTime,c.entries.push(e),o(!0))},f=function(e){e.forEach(u)},g=d("first-input",f);o=l(e,c,U,r.reportAllChanges),g&&m(h((function(){f(g.takeRecords()),g.disconnect()}))),g&&s((function(){var a;c=p("FID"),o=l(e,c,U,r.reportAllChanges),i=[],n=-1,t=null,M(addEventListener),a=u,i.push(a),b()}))}))},k=0,N=1/0,V=0,D=function(e){e.forEach((function(e){e.interactionId&&(N=Math.min(N,e.interactionId),V=Math.max(V,e.interactionId),k=V?(V-N)/7+1:0)}))},F=function(){return o?k:performance.interactionCount||0},O=function(){"interactionCount"in performance||o||(o=d("event",D,{type:"event",buffered:!0,durationThreshold:0}))},j=[200,500],K=0,W=function(){return F()-K},B=[],G={},J=function(e){var t=B[B.length-1],n=G[e.interactionId];if(n||B.length<10||e.duration>t.latency){if(n)n.entries.push(e),n.latency=Math.max(n.latency,e.duration);else{var r={id:e.interactionId,latency:e.duration,entries:[e]};G[r.id]=r,B.push(r)}B.sort((function(e,t){return t.latency-e.latency})),B.splice(10).forEach((function(e){delete G[e.id]}))}},q=function(e,t){t=t||{},P((function(){O();var n,r=p("INP"),i=function(e){e.forEach((function(e){e.interactionId&&J(e),"first-input"===e.entryType&&!B.some((function(t){return t.entries.some((function(t){return e.duration===t.duration&&e.startTime===t.startTime}))}))&&J(e)}));var t,i=(t=Math.min(B.length-1,Math.floor(W()/50)),B[t]);i&&i.latency!==r.value&&(r.value=i.latency,r.entries=i.entries,n())},o=d("event",i,{durationThreshold:t.durationThreshold||40});n=l(e,r,j,t.reportAllChanges),o&&(o.observe({type:"first-input",buffered:!0}),m((function(){i(o.takeRecords()),r.value<0&&W()>0&&(r.value=0,r.entries=[]),n(!0)})),s((function(){B=[],K=F(),r=p("INP"),n=l(e,r,j,t.reportAllChanges)})))}))},Y=[2500,4e3],$={},z=function(e,t){t=t||{},P((function(){var n,r=T(),i=p("LCP"),o=function(e){var t=e[e.length-1];t&&t.startTime<r.firstHiddenTime&&(i.value=Math.max(t.startTime-u(),0),i.entries=[t],n())},a=d("largest-contentful-paint",o);if(a){n=l(e,i,Y,t.reportAllChanges);var c=h((function(){$[i.id]||(o(a.takeRecords()),a.disconnect(),$[i.id]=!0,n(!0))}));["keydown","click"].forEach((function(e){addEventListener(e,c,!0)})),m(c),s((function(r){i=p("LCP"),n=l(e,i,Y,t.reportAllChanges),f((function(){i.value=performance.now()-r.timeStamp,$[i.id]=!0,n(!0)}))}))}}))},X=[800,1800],Q=function e(t){document.prerendering?P((function(){return e(t)})):"complete"!==document.readyState?addEventListener("load",(function(){return e(t)}),!0):setTimeout(t,0)},Z=function(e,t){t=t||{};var n=p("TTFB"),r=l(e,n,X,t.reportAllChanges);Q((function(){var i=c();if(i){var o=i.responseStart;if(o<=0||o>performance.now())return;n.value=Math.max(o-u(),0),n.entries=[i],r(!0),s((function(){n=p("TTFB",0),(r=l(e,n,X,t.reportAllChanges))(!0)}))}}))};e.CLSThresholds=A,e.FCPThresholds=I,e.FIDThresholds=U,e.INPThresholds=j,e.LCPThresholds=Y,e.TTFBThresholds=X,e.getCLS=R,e.getFCP=C,e.getFID=H,e.getINP=q,e.getLCP=z,e.getTTFB=Z,e.onCLS=R,e.onFCP=C,e.onFID=H,e.onINP=q,e.onLCP=z,e.onTTFB=Z,Object.defineProperty(e,"__esModule",{value:!0})}(t)}},t={};function n(r){var i=t[r];if(void 0!==i)return i.exports;var o=t[r]={exports:{}};return e[r].call(o.exports,o,o.exports,n),o.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=n(777);"complete"===document.readyState?e.Swishjam.init({reportingUrl:"{{SWISHJAM_REPLACE_REPORTING_URL}}",publicApiKey:"{{SWISHJAM_REPLACE_PUBLIC_API_KEY}}",sampleRate:"{{SWISHJAM_REPLACE_SAMPLE_RATE}}"}):window.addEventListener("load",(function(){e.Swishjam.init({reportingUrl:"{{SWISHJAM_REPLACE_REPORTING_URL}}",publicApiKey:"{{SWISHJAM_REPLACE_PUBLIC_API_KEY}}",sampleRate:"{{SWISHJAM_REPLACE_SAMPLE_RATE}}"})}))})()})();