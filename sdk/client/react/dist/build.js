/*! For license information please see build.js.LICENSE.txt */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("react")):"function"==typeof define&&define.amd?define("@swishjam/react",["React"],e):"object"==typeof exports?exports["@swishjam/react"]=e(require("react")):t["@swishjam/react"]=e(t.React)}(self,(t=>(()=>{"use strict";var e,r,n={639:e=>{e.exports=t}},o={};function i(t){var e=o[t];if(void 0!==e)return e.exports;var r=o[t]={exports:{}};return n[t].call(r.exports,r,r.exports,i),r.exports}i.m=n,i.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return i.d(e,{a:e}),e},i.d=(t,e)=>{for(var r in e)i.o(e,r)&&!i.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},i.f={},i.e=t=>Promise.all(Object.keys(i.f).reduce(((e,r)=>(i.f[r](t,e),e)),[])),i.u=t=>t+".build.js",i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),e={},r="@swishjam/react:",i.l=(t,n,o,a)=>{if(e[t])e[t].push(n);else{var u,c;if(void 0!==o)for(var f=document.getElementsByTagName("script"),s=0;s<f.length;s++){var l=f[s];if(l.getAttribute("src")==t||l.getAttribute("data-webpack")==r+o){u=l;break}}u||(c=!0,(u=document.createElement("script")).charset="utf-8",u.timeout=120,i.nc&&u.setAttribute("nonce",i.nc),u.setAttribute("data-webpack",r+o),u.src=t),e[t]=[n];var h=(r,n)=>{u.onerror=u.onload=null,clearTimeout(p);var o=e[t];if(delete e[t],u.parentNode&&u.parentNode.removeChild(u),o&&o.forEach((t=>t(n))),r)return r(n)},p=setTimeout(h.bind(null,void 0,{type:"timeout",target:u}),12e4);u.onerror=h.bind(null,u.onerror),u.onload=h.bind(null,u.onload),c&&document.head.appendChild(u)}},i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.p="/dist/",(()=>{var t={179:0};i.f.j=(e,r)=>{var n=i.o(t,e)?t[e]:void 0;if(0!==n)if(n)r.push(n[2]);else{var o=new Promise(((r,o)=>n=t[e]=[r,o]));r.push(n[2]=o);var a=i.p+i.u(e),u=new Error;i.l(a,(r=>{if(i.o(t,e)&&(0!==(n=t[e])&&(t[e]=void 0),n)){var o=r&&("load"===r.type?"missing":r.type),a=r&&r.target&&r.target.src;u.message="Loading chunk "+e+" failed.\n("+o+": "+a+")",u.name="ChunkLoadError",u.type=o,u.request=a,n[1](u)}}),"chunk-"+e,e)}};var e=(e,r)=>{var n,o,[a,u,c]=r,f=0;if(a.some((e=>0!==t[e]))){for(n in u)i.o(u,n)&&(i.m[n]=u[n]);c&&c(i)}for(e&&e(r);f<a.length;f++)o=a[f],i.o(t,o)&&t[o]&&t[o][0](),t[o]=0},r=self.webpackChunk_swishjam_react=self.webpackChunk_swishjam_react||[];r.forEach(e.bind(null,0)),r.push=e.bind(null,r.push.bind(r))})();var a={};return(()=>{i.r(a),i.d(a,{SwishjamProvider:()=>c,useSwishjam:()=>u});var t=i(639);function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(t)}function r(){r=function(){return n};var t,n={},o=Object.prototype,i=o.hasOwnProperty,a=Object.defineProperty||function(t,e,r){t[e]=r.value},u="function"==typeof Symbol?Symbol:{},c=u.iterator||"@@iterator",f=u.asyncIterator||"@@asyncIterator",s=u.toStringTag||"@@toStringTag";function l(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{l({},"")}catch(t){l=function(t,e,r){return t[e]=r}}function h(t,e,r,n){var o=e&&e.prototype instanceof w?e:w,i=Object.create(o.prototype),u=new G(n||[]);return a(i,"_invoke",{value:S(t,r,u)}),i}function p(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}n.wrap=h;var d="suspendedStart",y="suspendedYield",v="executing",m="completed",g={};function w(){}function b(){}function x(){}var j={};l(j,c,(function(){return this}));var E=Object.getPrototypeOf,L=E&&E(E(C([])));L&&L!==o&&i.call(L,c)&&(j=L);var _=x.prototype=w.prototype=Object.create(j);function k(t){["next","throw","return"].forEach((function(e){l(t,e,(function(t){return this._invoke(e,t)}))}))}function O(t,r){function n(o,a,u,c){var f=p(t[o],t,a);if("throw"!==f.type){var s=f.arg,l=s.value;return l&&"object"==e(l)&&i.call(l,"__await")?r.resolve(l.__await).then((function(t){n("next",t,u,c)}),(function(t){n("throw",t,u,c)})):r.resolve(l).then((function(t){s.value=t,u(s)}),(function(t){return n("throw",t,u,c)}))}c(f.arg)}var o;a(this,"_invoke",{value:function(t,e){function i(){return new r((function(r,o){n(t,e,r,o)}))}return o=o?o.then(i,i):i()}})}function S(e,r,n){var o=d;return function(i,a){if(o===v)throw new Error("Generator is already running");if(o===m){if("throw"===i)throw a;return{value:t,done:!0}}for(n.method=i,n.arg=a;;){var u=n.delegate;if(u){var c=P(u,n);if(c){if(c===g)continue;return c}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===d)throw o=m,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=v;var f=p(e,r,n);if("normal"===f.type){if(o=n.done?m:y,f.arg===g)continue;return{value:f.arg,done:n.done}}"throw"===f.type&&(o=m,n.method="throw",n.arg=f.arg)}}}function P(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator.return&&(r.method="return",r.arg=t,P(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),g;var i=p(o,e.iterator,r.arg);if("throw"===i.type)return r.method="throw",r.arg=i.arg,r.delegate=null,g;var a=i.arg;return a?a.done?(r[e.resultName]=a.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,g):a:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,g)}function T(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function N(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function G(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(T,this),this.reset(!0)}function C(r){if(r||""===r){var n=r[c];if(n)return n.call(r);if("function"==typeof r.next)return r;if(!isNaN(r.length)){var o=-1,a=function e(){for(;++o<r.length;)if(i.call(r,o))return e.value=r[o],e.done=!1,e;return e.value=t,e.done=!0,e};return a.next=a}}throw new TypeError(e(r)+" is not iterable")}return b.prototype=x,a(_,"constructor",{value:x,configurable:!0}),a(x,"constructor",{value:b,configurable:!0}),b.displayName=l(x,s,"GeneratorFunction"),n.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===b||"GeneratorFunction"===(e.displayName||e.name))},n.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,x):(t.__proto__=x,l(t,s,"GeneratorFunction")),t.prototype=Object.create(_),t},n.awrap=function(t){return{__await:t}},k(O.prototype),l(O.prototype,f,(function(){return this})),n.AsyncIterator=O,n.async=function(t,e,r,o,i){void 0===i&&(i=Promise);var a=new O(h(t,e,r,o),i);return n.isGeneratorFunction(e)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},k(_),l(_,s,"Generator"),l(_,c,(function(){return this})),l(_,"toString",(function(){return"[object Generator]"})),n.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},n.values=C,G.prototype={constructor:G,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(N),!e)for(var r in this)"t"===r.charAt(0)&&i.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var r=this;function n(n,o){return u.type="throw",u.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o}for(var o=this.tryEntries.length-1;o>=0;--o){var a=this.tryEntries[o],u=a.completion;if("root"===a.tryLoc)return n("end");if(a.tryLoc<=this.prev){var c=i.call(a,"catchLoc"),f=i.call(a,"finallyLoc");if(c&&f){if(this.prev<a.catchLoc)return n(a.catchLoc,!0);if(this.prev<a.finallyLoc)return n(a.finallyLoc)}else if(c){if(this.prev<a.catchLoc)return n(a.catchLoc,!0)}else{if(!f)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return n(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&i.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=t,a.arg=e,o?(this.method="next",this.next=o.finallyLoc,g):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),g},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),N(r),g}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;N(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(e,r,n){return this.delegate={iterator:C(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),g}},n}function n(t,e,r,n,o,i,a){try{var u=t[i](a),c=u.value}catch(t){return void r(t)}u.done?e(c):Promise.resolve(c).then(n,o)}var o=(0,t.createContext)(),u=function(){return(0,t.useContext)(o)},c=function(e){var a,u=e.apiKey,c=e.apiEndpoint,f=e.children;return(0,t.useEffect)((function(){var t;!function(){return(t=t||(e=r().mark((function t(){return r().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if("undefined"==typeof window||a){t.next=6;break}return t.next=3,i.e(892).then(i.bind(i,892));case 3:return(a=t.sent.default).init({apiKey:u,apiEndpoint:c}),t.abrupt("return",a);case 6:case"end":return t.stop()}}),t)})),function(){var t=this,r=arguments;return new Promise((function(o,i){var a=e.apply(t,r);function u(t){n(a,o,i,u,c,"next",t)}function c(t){n(a,o,i,u,c,"throw",t)}u(void 0)}))})).apply(this,arguments);var e}()}),[u,c]),React.createElement(o.Provider,{value:a},f)}})(),a})()));