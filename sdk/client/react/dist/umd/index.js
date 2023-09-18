(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SwishjamReact = {}, global.React));
})(this, (function (exports, react) { 'use strict';

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _regeneratorRuntime() {
    _regeneratorRuntime = function () {
      return e;
    };
    var t,
      e = {},
      r = Object.prototype,
      n = r.hasOwnProperty,
      o = Object.defineProperty || function (t, e, r) {
        t[e] = r.value;
      },
      i = "function" == typeof Symbol ? Symbol : {},
      a = i.iterator || "@@iterator",
      c = i.asyncIterator || "@@asyncIterator",
      u = i.toStringTag || "@@toStringTag";
    function define(t, e, r) {
      return Object.defineProperty(t, e, {
        value: r,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }), t[e];
    }
    try {
      define({}, "");
    } catch (t) {
      define = function (t, e, r) {
        return t[e] = r;
      };
    }
    function wrap(t, e, r, n) {
      var i = e && e.prototype instanceof Generator ? e : Generator,
        a = Object.create(i.prototype),
        c = new Context(n || []);
      return o(a, "_invoke", {
        value: makeInvokeMethod(t, r, c)
      }), a;
    }
    function tryCatch(t, e, r) {
      try {
        return {
          type: "normal",
          arg: t.call(e, r)
        };
      } catch (t) {
        return {
          type: "throw",
          arg: t
        };
      }
    }
    e.wrap = wrap;
    var h = "suspendedStart",
      l = "suspendedYield",
      f = "executing",
      s = "completed",
      y = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var p = {};
    define(p, a, function () {
      return this;
    });
    var d = Object.getPrototypeOf,
      v = d && d(d(values([])));
    v && v !== r && n.call(v, a) && (p = v);
    var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
    function defineIteratorMethods(t) {
      ["next", "throw", "return"].forEach(function (e) {
        define(t, e, function (t) {
          return this._invoke(e, t);
        });
      });
    }
    function AsyncIterator(t, e) {
      function invoke(r, o, i, a) {
        var c = tryCatch(t[r], t, o);
        if ("throw" !== c.type) {
          var u = c.arg,
            h = u.value;
          return h && "object" == typeof h && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
            invoke("next", t, i, a);
          }, function (t) {
            invoke("throw", t, i, a);
          }) : e.resolve(h).then(function (t) {
            u.value = t, i(u);
          }, function (t) {
            return invoke("throw", t, i, a);
          });
        }
        a(c.arg);
      }
      var r;
      o(this, "_invoke", {
        value: function (t, n) {
          function callInvokeWithMethodAndArg() {
            return new e(function (e, r) {
              invoke(t, n, e, r);
            });
          }
          return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
      });
    }
    function makeInvokeMethod(e, r, n) {
      var o = h;
      return function (i, a) {
        if (o === f) throw new Error("Generator is already running");
        if (o === s) {
          if ("throw" === i) throw a;
          return {
            value: t,
            done: !0
          };
        }
        for (n.method = i, n.arg = a;;) {
          var c = n.delegate;
          if (c) {
            var u = maybeInvokeDelegate(c, n);
            if (u) {
              if (u === y) continue;
              return u;
            }
          }
          if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
            if (o === h) throw o = s, n.arg;
            n.dispatchException(n.arg);
          } else "return" === n.method && n.abrupt("return", n.arg);
          o = f;
          var p = tryCatch(e, r, n);
          if ("normal" === p.type) {
            if (o = n.done ? s : l, p.arg === y) continue;
            return {
              value: p.arg,
              done: n.done
            };
          }
          "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
        }
      };
    }
    function maybeInvokeDelegate(e, r) {
      var n = r.method,
        o = e.iterator[n];
      if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
      var i = tryCatch(o, e.iterator, r.arg);
      if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
      var a = i.arg;
      return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
    }
    function pushTryEntry(t) {
      var e = {
        tryLoc: t[0]
      };
      1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
    }
    function resetTryEntry(t) {
      var e = t.completion || {};
      e.type = "normal", delete e.arg, t.completion = e;
    }
    function Context(t) {
      this.tryEntries = [{
        tryLoc: "root"
      }], t.forEach(pushTryEntry, this), this.reset(!0);
    }
    function values(e) {
      if (e || "" === e) {
        var r = e[a];
        if (r) return r.call(e);
        if ("function" == typeof e.next) return e;
        if (!isNaN(e.length)) {
          var o = -1,
            i = function next() {
              for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
              return next.value = t, next.done = !0, next;
            };
          return i.next = i;
        }
      }
      throw new TypeError(typeof e + " is not iterable");
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
      value: GeneratorFunctionPrototype,
      configurable: !0
    }), o(GeneratorFunctionPrototype, "constructor", {
      value: GeneratorFunction,
      configurable: !0
    }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
      var e = "function" == typeof t && t.constructor;
      return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
    }, e.mark = function (t) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
    }, e.awrap = function (t) {
      return {
        __await: t
      };
    }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
      return this;
    }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
      void 0 === i && (i = Promise);
      var a = new AsyncIterator(wrap(t, r, n, o), i);
      return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
        return t.done ? t.value : a.next();
      });
    }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
      return this;
    }), define(g, "toString", function () {
      return "[object Generator]";
    }), e.keys = function (t) {
      var e = Object(t),
        r = [];
      for (var n in e) r.push(n);
      return r.reverse(), function next() {
        for (; r.length;) {
          var t = r.pop();
          if (t in e) return next.value = t, next.done = !1, next;
        }
        return next.done = !0, next;
      };
    }, e.values = values, Context.prototype = {
      constructor: Context,
      reset: function (e) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
      },
      stop: function () {
        this.done = !0;
        var t = this.tryEntries[0].completion;
        if ("throw" === t.type) throw t.arg;
        return this.rval;
      },
      dispatchException: function (e) {
        if (this.done) throw e;
        var r = this;
        function handle(n, o) {
          return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
        }
        for (var o = this.tryEntries.length - 1; o >= 0; --o) {
          var i = this.tryEntries[o],
            a = i.completion;
          if ("root" === i.tryLoc) return handle("end");
          if (i.tryLoc <= this.prev) {
            var c = n.call(i, "catchLoc"),
              u = n.call(i, "finallyLoc");
            if (c && u) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            } else if (c) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            } else {
              if (!u) throw new Error("try statement without catch or finally");
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            }
          }
        }
      },
      abrupt: function (t, e) {
        for (var r = this.tryEntries.length - 1; r >= 0; --r) {
          var o = this.tryEntries[r];
          if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
            var i = o;
            break;
          }
        }
        i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
        var a = i ? i.completion : {};
        return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
      },
      complete: function (t, e) {
        if ("throw" === t.type) throw t.arg;
        return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
      },
      finish: function (t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
        }
      },
      catch: function (t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.tryLoc === t) {
            var n = r.completion;
            if ("throw" === n.type) {
              var o = n.arg;
              resetTryEntry(r);
            }
            return o;
          }
        }
        throw new Error("illegal catch attempt");
      },
      delegateYield: function (e, r, n) {
        return this.delegate = {
          iterator: values(e),
          resultName: r,
          nextLoc: n
        }, "next" === this.method && (this.arg = t), y;
      }
    }, e;
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var SwishjamContext = /*#__PURE__*/react.createContext();
  var useSwishjam = function useSwishjam() {
    return react.useContext(SwishjamContext);
  };

  var SwishjamProvider = function SwishjamProvider(_ref) {
    var apiKey = _ref.apiKey,
      apiEndpoint = _ref.apiEndpoint,
      children = _ref.children;
    var _useState = react.useState(),
      _useState2 = _slicedToArray(_useState, 2),
      swishjamClient = _useState2[0],
      setSwishjamClient = _useState2[1];
    react.useEffect(function () {
      var _ref2;
      var init = function init() {
        return (_ref2 = _ref2 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
          var SwishjamClient, client;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (!(typeof window !== 'undefined' && !swishjamClient)) {
                  _context.next = 7;
                  break;
                }
                _context.next = 3;
                return Promise.resolve().then(function () { return swishjam; });
              case 3:
                SwishjamClient = _context.sent["default"];
                client = new SwishjamClient({
                  apiKey: apiKey,
                  apiEndpoint: apiEndpoint
                });
                setSwishjamClient(client);
                return _context.abrupt("return", swishjamClient);
              case 7:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }))).apply(this, arguments);
      };
      init();
    }, []);
    return /*#__PURE__*/React.createElement(SwishjamContext.Provider, {
      value: swishjamClient
    }, children);
  };

  class PageViewManager {
    constructor() {
      this.newPageCallbacks = [];
      this._listenForSoftNavigations();
    }

    currentUrl = () => this._currentUrl;
    previousUrl = () => this._previousUrl || document.referrer;

    onNewPage = callback => {
      this.newPageCallbacks.push(callback);
    }

    recordPageView = () => {
      const url = window.location.href;
      this._previousUrl = this._currentUrl || document.referrer;
      this._currentUrl = url;
      this.newPageCallbacks.forEach(func => func(this.currentUrl(), this.previousUrl()));
    }

    _listenForSoftNavigations = () => {
      window.addEventListener('hashchange', this.recordPageView);
      window.addEventListener('popstate', this.recordPageView);
      if (window.history.pushState) {
        const originalPushState = window.history.pushState;
        const self = this;
        window.history.pushState = function () {
          originalPushState.apply(this, arguments);
          self.recordPageView();
        };
      }
    }
  }

  class UUID {
    static generate = prefix => {
      return `${prefix ? `${prefix}-` : ''}xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.replace(/x/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  }

  class DataPersister {
    static set(key, value) {
      const currentMemory = this.all();
      currentMemory[key] = value;
      sessionStorage.setItem('swishjam', JSON.stringify(currentMemory));
      return value;
    }

    static get(key) {
      return this.all()[key];
    }

    static all() {
      return JSON.parse(sessionStorage.getItem('swishjam') || '{}');
    }
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var inherits$1 = {exports: {}};

  var inherits_browser = {exports: {}};

  var hasRequiredInherits_browser;

  function requireInherits_browser () {
  	if (hasRequiredInherits_browser) return inherits_browser.exports;
  	hasRequiredInherits_browser = 1;
  	if (typeof Object.create === 'function') {
  	  // implementation from standard node.js 'util' module
  	  inherits_browser.exports = function inherits(ctor, superCtor) {
  	    if (superCtor) {
  	      ctor.super_ = superCtor;
  	      ctor.prototype = Object.create(superCtor.prototype, {
  	        constructor: {
  	          value: ctor,
  	          enumerable: false,
  	          writable: true,
  	          configurable: true
  	        }
  	      });
  	    }
  	  };
  	} else {
  	  // old school shim for old browsers
  	  inherits_browser.exports = function inherits(ctor, superCtor) {
  	    if (superCtor) {
  	      ctor.super_ = superCtor;
  	      var TempCtor = function () {};
  	      TempCtor.prototype = superCtor.prototype;
  	      ctor.prototype = new TempCtor();
  	      ctor.prototype.constructor = ctor;
  	    }
  	  };
  	}
  	return inherits_browser.exports;
  }

  try {
    var util = require('util');
    /* istanbul ignore next */
    if (typeof util.inherits !== 'function') throw '';
    inherits$1.exports = util.inherits;
  } catch (e) {
    /* istanbul ignore next */
    inherits$1.exports = requireInherits_browser();
  }

  var inheritsExports = inherits$1.exports;

  var client_base = {};

  var implementation_browser = {exports: {}};

  /* eslint no-negated-condition: 0, no-new-func: 0 */

  if (typeof self !== 'undefined') {
  	implementation_browser.exports = self;
  } else if (typeof window !== 'undefined') {
  	implementation_browser.exports = window;
  } else {
  	implementation_browser.exports = Function('return this')();
  }

  var implementation_browserExports = implementation_browser.exports;

  var implementation = implementation_browserExports;

  var polyfill = function getPolyfill() {
  	if (typeof commonjsGlobal !== 'object' || !commonjsGlobal || commonjsGlobal.Math !== Math || commonjsGlobal.Array !== Array) {
  		return implementation;
  	}
  	return commonjsGlobal;
  };

  var murmurhash3_gc = {exports: {}};

  /**
   * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
   * 
   * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
   * @see http://github.com/garycourt/murmurhash-js
   * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
   * @see http://sites.google.com/site/murmurhash/
   * 
   * @param {string} key ASCII only
   * @param {number} seed Positive integer only
   * @return {number} 32-bit positive integer hash 
   */
  murmurhash3_gc.exports;

  (function (module) {
  	function murmurhash3_32_gc(key, seed) {
  		var remainder, bytes, h1, h1b, c1, c2, k1, i;
  		
  		remainder = key.length & 3; // key.length % 4
  		bytes = key.length - remainder;
  		h1 = seed;
  		c1 = 0xcc9e2d51;
  		c2 = 0x1b873593;
  		i = 0;
  		
  		while (i < bytes) {
  		  	k1 = 
  		  	  ((key.charCodeAt(i) & 0xff)) |
  		  	  ((key.charCodeAt(++i) & 0xff) << 8) |
  		  	  ((key.charCodeAt(++i) & 0xff) << 16) |
  		  	  ((key.charCodeAt(++i) & 0xff) << 24);
  			++i;
  			
  			k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
  			k1 = (k1 << 15) | (k1 >>> 17);
  			k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

  			h1 ^= k1;
  	        h1 = (h1 << 13) | (h1 >>> 19);
  			h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
  			h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
  		}
  		
  		k1 = 0;
  		
  		switch (remainder) {
  			case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
  			case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
  			case 1: k1 ^= (key.charCodeAt(i) & 0xff);
  			
  			k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
  			k1 = (k1 << 15) | (k1 >>> 17);
  			k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
  			h1 ^= k1;
  		}
  		
  		h1 ^= key.length;

  		h1 ^= h1 >>> 16;
  		h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  		h1 ^= h1 >>> 13;
  		h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
  		h1 ^= h1 >>> 16;

  		return h1 >>> 0;
  	}

  	{
  	  module.exports = murmurhash3_32_gc;
  	} 
  } (murmurhash3_gc));

  var murmurhash3_gcExports = murmurhash3_gc.exports;

  var uaParser = {exports: {}};

  uaParser.exports;

  (function (module, exports) {
  	/////////////////////////////////////////////////////////////////////////////////
  	/* UAParser.js v1.0.36
  	   Copyright © 2012-2021 Faisal Salman <f@faisalman.com>
  	   MIT License *//*
  	   Detect Browser, Engine, OS, CPU, and Device type/model from User-Agent data.
  	   Supports browser & node.js environment. 
  	   Demo   : https://faisalman.github.io/ua-parser-js
  	   Source : https://github.com/faisalman/ua-parser-js */
  	/////////////////////////////////////////////////////////////////////////////////

  	(function (window, undefined$1) {

  	    //////////////
  	    // Constants
  	    /////////////


  	    var LIBVERSION  = '1.0.36',
  	        EMPTY       = '',
  	        UNKNOWN     = '?',
  	        FUNC_TYPE   = 'function',
  	        UNDEF_TYPE  = 'undefined',
  	        OBJ_TYPE    = 'object',
  	        STR_TYPE    = 'string',
  	        MAJOR       = 'major',
  	        MODEL       = 'model',
  	        NAME        = 'name',
  	        TYPE        = 'type',
  	        VENDOR      = 'vendor',
  	        VERSION     = 'version',
  	        ARCHITECTURE= 'architecture',
  	        CONSOLE     = 'console',
  	        MOBILE      = 'mobile',
  	        TABLET      = 'tablet',
  	        SMARTTV     = 'smarttv',
  	        WEARABLE    = 'wearable',
  	        EMBEDDED    = 'embedded',
  	        UA_MAX_LENGTH = 350;

  	    var AMAZON  = 'Amazon',
  	        APPLE   = 'Apple',
  	        ASUS    = 'ASUS',
  	        BLACKBERRY = 'BlackBerry',
  	        BROWSER = 'Browser',
  	        CHROME  = 'Chrome',
  	        EDGE    = 'Edge',
  	        FIREFOX = 'Firefox',
  	        GOOGLE  = 'Google',
  	        HUAWEI  = 'Huawei',
  	        LG      = 'LG',
  	        MICROSOFT = 'Microsoft',
  	        MOTOROLA  = 'Motorola',
  	        OPERA   = 'Opera',
  	        SAMSUNG = 'Samsung',
  	        SHARP   = 'Sharp',
  	        SONY    = 'Sony',
  	        XIAOMI  = 'Xiaomi',
  	        ZEBRA   = 'Zebra',
  	        FACEBOOK    = 'Facebook',
  	        CHROMIUM_OS = 'Chromium OS',
  	        MAC_OS  = 'Mac OS';

  	    ///////////
  	    // Helper
  	    //////////

  	    var extend = function (regexes, extensions) {
  	            var mergedRegexes = {};
  	            for (var i in regexes) {
  	                if (extensions[i] && extensions[i].length % 2 === 0) {
  	                    mergedRegexes[i] = extensions[i].concat(regexes[i]);
  	                } else {
  	                    mergedRegexes[i] = regexes[i];
  	                }
  	            }
  	            return mergedRegexes;
  	        },
  	        enumerize = function (arr) {
  	            var enums = {};
  	            for (var i=0; i<arr.length; i++) {
  	                enums[arr[i].toUpperCase()] = arr[i];
  	            }
  	            return enums;
  	        },
  	        has = function (str1, str2) {
  	            return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
  	        },
  	        lowerize = function (str) {
  	            return str.toLowerCase();
  	        },
  	        majorize = function (version) {
  	            return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g, EMPTY).split('.')[0] : undefined$1;
  	        },
  	        trim = function (str, len) {
  	            if (typeof(str) === STR_TYPE) {
  	                str = str.replace(/^\s\s*/, EMPTY);
  	                return typeof(len) === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
  	            }
  	    };

  	    ///////////////
  	    // Map helper
  	    //////////////

  	    var rgxMapper = function (ua, arrays) {

  	            var i = 0, j, k, p, q, matches, match;

  	            // loop through all regexes maps
  	            while (i < arrays.length && !matches) {

  	                var regex = arrays[i],       // even sequence (0,2,4,..)
  	                    props = arrays[i + 1];   // odd sequence (1,3,5,..)
  	                j = k = 0;

  	                // try matching uastring with regexes
  	                while (j < regex.length && !matches) {

  	                    if (!regex[j]) { break; }
  	                    matches = regex[j++].exec(ua);

  	                    if (!!matches) {
  	                        for (p = 0; p < props.length; p++) {
  	                            match = matches[++k];
  	                            q = props[p];
  	                            // check if given property is actually array
  	                            if (typeof q === OBJ_TYPE && q.length > 0) {
  	                                if (q.length === 2) {
  	                                    if (typeof q[1] == FUNC_TYPE) {
  	                                        // assign modified match
  	                                        this[q[0]] = q[1].call(this, match);
  	                                    } else {
  	                                        // assign given value, ignore regex match
  	                                        this[q[0]] = q[1];
  	                                    }
  	                                } else if (q.length === 3) {
  	                                    // check whether function or regex
  	                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
  	                                        // call function (usually string mapper)
  	                                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined$1;
  	                                    } else {
  	                                        // sanitize match using given regex
  	                                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined$1;
  	                                    }
  	                                } else if (q.length === 4) {
  	                                        this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined$1;
  	                                }
  	                            } else {
  	                                this[q] = match ? match : undefined$1;
  	                            }
  	                        }
  	                    }
  	                }
  	                i += 2;
  	            }
  	        },

  	        strMapper = function (str, map) {

  	            for (var i in map) {
  	                // check if current value is array
  	                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
  	                    for (var j = 0; j < map[i].length; j++) {
  	                        if (has(map[i][j], str)) {
  	                            return (i === UNKNOWN) ? undefined$1 : i;
  	                        }
  	                    }
  	                } else if (has(map[i], str)) {
  	                    return (i === UNKNOWN) ? undefined$1 : i;
  	                }
  	            }
  	            return str;
  	    };

  	    ///////////////
  	    // String map
  	    //////////////

  	    // Safari < 3.0
  	    var oldSafariMap = {
  	            '1.0'   : '/8',
  	            '1.2'   : '/1',
  	            '1.3'   : '/3',
  	            '2.0'   : '/412',
  	            '2.0.2' : '/416',
  	            '2.0.3' : '/417',
  	            '2.0.4' : '/419',
  	            '?'     : '/'
  	        },
  	        windowsVersionMap = {
  	            'ME'        : '4.90',
  	            'NT 3.11'   : 'NT3.51',
  	            'NT 4.0'    : 'NT4.0',
  	            '2000'      : 'NT 5.0',
  	            'XP'        : ['NT 5.1', 'NT 5.2'],
  	            'Vista'     : 'NT 6.0',
  	            '7'         : 'NT 6.1',
  	            '8'         : 'NT 6.2',
  	            '8.1'       : 'NT 6.3',
  	            '10'        : ['NT 6.4', 'NT 10.0'],
  	            'RT'        : 'ARM'
  	    };

  	    //////////////
  	    // Regex map
  	    /////////////

  	    var regexes = {

  	        browser : [[

  	            /\b(?:crmo|crios)\/([\w\.]+)/i                                      // Chrome for Android/iOS
  	            ], [VERSION, [NAME, 'Chrome']], [
  	            /edg(?:e|ios|a)?\/([\w\.]+)/i                                       // Microsoft Edge
  	            ], [VERSION, [NAME, 'Edge']], [

  	            // Presto based
  	            /(opera mini)\/([-\w\.]+)/i,                                        // Opera Mini
  	            /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,                 // Opera Mobi/Tablet
  	            /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i                           // Opera
  	            ], [NAME, VERSION], [
  	            /opios[\/ ]+([\w\.]+)/i                                             // Opera mini on iphone >= 8.0
  	            ], [VERSION, [NAME, OPERA+' Mini']], [
  	            /\bopr\/([\w\.]+)/i                                                 // Opera Webkit
  	            ], [VERSION, [NAME, OPERA]], [

  	            // Mixed
  	            /(kindle)\/([\w\.]+)/i,                                             // Kindle
  	            /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,      // Lunascape/Maxthon/Netfront/Jasmine/Blazer
  	            // Trident based
  	            /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,               // Avant/IEMobile/SlimBrowser
  	            /(ba?idubrowser)[\/ ]?([\w\.]+)/i,                                  // Baidu Browser
  	            /(?:ms|\()(ie) ([\w\.]+)/i,                                         // Internet Explorer

  	            // Webkit/KHTML based                                               // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
  	            /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,
  	                                                                                // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ, aka ShouQ
  	            /(heytap|ovi)browser\/([\d\.]+)/i,                                  // Heytap/Ovi
  	            /(weibo)__([\d\.]+)/i                                               // Weibo
  	            ], [NAME, VERSION], [
  	            /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i                 // UCBrowser
  	            ], [VERSION, [NAME, 'UC'+BROWSER]], [
  	            /microm.+\bqbcore\/([\w\.]+)/i,                                     // WeChat Desktop for Windows Built-in Browser
  	            /\bqbcore\/([\w\.]+).+microm/i
  	            ], [VERSION, [NAME, 'WeChat(Win) Desktop']], [
  	            /micromessenger\/([\w\.]+)/i                                        // WeChat
  	            ], [VERSION, [NAME, 'WeChat']], [
  	            /konqueror\/([\w\.]+)/i                                             // Konqueror
  	            ], [VERSION, [NAME, 'Konqueror']], [
  	            /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i                       // IE11
  	            ], [VERSION, [NAME, 'IE']], [
  	            /ya(?:search)?browser\/([\w\.]+)/i                                  // Yandex
  	            ], [VERSION, [NAME, 'Yandex']], [
  	            /(avast|avg)\/([\w\.]+)/i                                           // Avast/AVG Secure Browser
  	            ], [[NAME, /(.+)/, '$1 Secure '+BROWSER], VERSION], [
  	            /\bfocus\/([\w\.]+)/i                                               // Firefox Focus
  	            ], [VERSION, [NAME, FIREFOX+' Focus']], [
  	            /\bopt\/([\w\.]+)/i                                                 // Opera Touch
  	            ], [VERSION, [NAME, OPERA+' Touch']], [
  	            /coc_coc\w+\/([\w\.]+)/i                                            // Coc Coc Browser
  	            ], [VERSION, [NAME, 'Coc Coc']], [
  	            /dolfin\/([\w\.]+)/i                                                // Dolphin
  	            ], [VERSION, [NAME, 'Dolphin']], [
  	            /coast\/([\w\.]+)/i                                                 // Opera Coast
  	            ], [VERSION, [NAME, OPERA+' Coast']], [
  	            /miuibrowser\/([\w\.]+)/i                                           // MIUI Browser
  	            ], [VERSION, [NAME, 'MIUI '+BROWSER]], [
  	            /fxios\/([-\w\.]+)/i                                                // Firefox for iOS
  	            ], [VERSION, [NAME, FIREFOX]], [
  	            /\bqihu|(qi?ho?o?|360)browser/i                                     // 360
  	            ], [[NAME, '360 '+BROWSER]], [
  	            /(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i
  	            ], [[NAME, /(.+)/, '$1 '+BROWSER], VERSION], [                      // Oculus/Samsung/Sailfish/Huawei Browser
  	            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
  	            ], [[NAME, /_/g, ' '], VERSION], [
  	            /(electron)\/([\w\.]+) safari/i,                                    // Electron-based App
  	            /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,                   // Tesla
  	            /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i            // QQBrowser/Baidu App/2345 Browser
  	            ], [NAME, VERSION], [
  	            /(metasr)[\/ ]?([\w\.]+)/i,                                         // SouGouBrowser
  	            /(lbbrowser)/i,                                                     // LieBao Browser
  	            /\[(linkedin)app\]/i                                                // LinkedIn App for iOS & Android
  	            ], [NAME], [

  	            // WebView
  	            /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i       // Facebook App for iOS & Android
  	            ], [[NAME, FACEBOOK], VERSION], [
  	            /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,                             // Kakao App
  	            /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,                                  // Naver InApp
  	            /safari (line)\/([\w\.]+)/i,                                        // Line App for iOS
  	            /\b(line)\/([\w\.]+)\/iab/i,                                        // Line App for Android
  	            /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i                     // Chromium/Instagram/Snapchat
  	            ], [NAME, VERSION], [
  	            /\bgsa\/([\w\.]+) .*safari\//i                                      // Google Search Appliance on iOS
  	            ], [VERSION, [NAME, 'GSA']], [
  	            /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i                        // TikTok
  	            ], [VERSION, [NAME, 'TikTok']], [

  	            /headlesschrome(?:\/([\w\.]+)| )/i                                  // Chrome Headless
  	            ], [VERSION, [NAME, CHROME+' Headless']], [

  	            / wv\).+(chrome)\/([\w\.]+)/i                                       // Chrome WebView
  	            ], [[NAME, CHROME+' WebView'], VERSION], [

  	            /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i           // Android Browser
  	            ], [VERSION, [NAME, 'Android '+BROWSER]], [

  	            /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i       // Chrome/OmniWeb/Arora/Tizen/Nokia
  	            ], [NAME, VERSION], [

  	            /version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i                      // Mobile Safari
  	            ], [VERSION, [NAME, 'Mobile Safari']], [
  	            /version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i                // Safari & Safari Mobile
  	            ], [VERSION, NAME], [
  	            /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i                      // Safari < 3.0
  	            ], [NAME, [VERSION, strMapper, oldSafariMap]], [

  	            /(webkit|khtml)\/([\w\.]+)/i
  	            ], [NAME, VERSION], [

  	            // Gecko based
  	            /(navigator|netscape\d?)\/([-\w\.]+)/i                              // Netscape
  	            ], [[NAME, 'Netscape'], VERSION], [
  	            /mobile vr; rv:([\w\.]+)\).+firefox/i                               // Firefox Reality
  	            ], [VERSION, [NAME, FIREFOX+' Reality']], [
  	            /ekiohf.+(flow)\/([\w\.]+)/i,                                       // Flow
  	            /(swiftfox)/i,                                                      // Swiftfox
  	            /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
  	                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror/Klar
  	            /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
  	                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
  	            /(firefox)\/([\w\.]+)/i,                                            // Other Firefox-based
  	            /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,                         // Mozilla

  	            // Other
  	            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
  	                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir/Obigo/Mosaic/Go/ICE/UP.Browser
  	            /(links) \(([\w\.]+)/i,                                             // Links
  	            /panasonic;(viera)/i                                                // Panasonic Viera
  	            ], [NAME, VERSION], [
  	            
  	            /(cobalt)\/([\w\.]+)/i                                              // Cobalt
  	            ], [NAME, [VERSION, /master.|lts./, ""]]
  	        ],

  	        cpu : [[

  	            /(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i                     // AMD64 (x64)
  	            ], [[ARCHITECTURE, 'amd64']], [

  	            /(ia32(?=;))/i                                                      // IA32 (quicktime)
  	            ], [[ARCHITECTURE, lowerize]], [

  	            /((?:i[346]|x)86)[;\)]/i                                            // IA32 (x86)
  	            ], [[ARCHITECTURE, 'ia32']], [

  	            /\b(aarch64|arm(v?8e?l?|_?64))\b/i                                 // ARM64
  	            ], [[ARCHITECTURE, 'arm64']], [

  	            /\b(arm(?:v[67])?ht?n?[fl]p?)\b/i                                   // ARMHF
  	            ], [[ARCHITECTURE, 'armhf']], [

  	            // PocketPC mistakenly identified as PowerPC
  	            /windows (ce|mobile); ppc;/i
  	            ], [[ARCHITECTURE, 'arm']], [

  	            /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i                            // PowerPC
  	            ], [[ARCHITECTURE, /ower/, EMPTY, lowerize]], [

  	            /(sun4\w)[;\)]/i                                                    // SPARC
  	            ], [[ARCHITECTURE, 'sparc']], [

  	            /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
  	                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
  	            ], [[ARCHITECTURE, lowerize]]
  	        ],

  	        device : [[

  	            //////////////////////////
  	            // MOBILES & TABLETS
  	            /////////////////////////

  	            // Samsung
  	            /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
  	            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, TABLET]], [
  	            /\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
  	            /samsung[- ]([-\w]+)/i,
  	            /sec-(sgh\w+)/i
  	            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, MOBILE]], [

  	            // Apple
  	            /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i                          // iPod/iPhone
  	            ], [MODEL, [VENDOR, APPLE], [TYPE, MOBILE]], [
  	            /\((ipad);[-\w\),; ]+apple/i,                                       // iPad
  	            /applecoremedia\/[\w\.]+ \((ipad)/i,
  	            /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
  	            ], [MODEL, [VENDOR, APPLE], [TYPE, TABLET]], [
  	            /(macintosh);/i
  	            ], [MODEL, [VENDOR, APPLE]], [

  	            // Sharp
  	            /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
  	            ], [MODEL, [VENDOR, SHARP], [TYPE, MOBILE]], [

  	            // Huawei
  	            /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
  	            ], [MODEL, [VENDOR, HUAWEI], [TYPE, TABLET]], [
  	            /(?:huawei|honor)([-\w ]+)[;\)]/i,
  	            /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i
  	            ], [MODEL, [VENDOR, HUAWEI], [TYPE, MOBILE]], [

  	            // Xiaomi
  	            /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,                  // Xiaomi POCO
  	            /\b; (\w+) build\/hm\1/i,                                           // Xiaomi Hongmi 'numeric' models
  	            /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,                             // Xiaomi Hongmi
  	            /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,                   // Xiaomi Redmi
  	            /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i // Xiaomi Mi
  	            ], [[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, MOBILE]], [
  	            /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i                        // Mi Pad tablets
  	            ],[[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, TABLET]], [

  	            // OPPO
  	            /; (\w+) bui.+ oppo/i,
  	            /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
  	            ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [

  	            // Vivo
  	            /vivo (\w+)(?: bui|\))/i,
  	            /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
  	            ], [MODEL, [VENDOR, 'Vivo'], [TYPE, MOBILE]], [

  	            // Realme
  	            /\b(rmx[12]\d{3})(?: bui|;|\))/i
  	            ], [MODEL, [VENDOR, 'Realme'], [TYPE, MOBILE]], [

  	            // Motorola
  	            /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
  	            /\bmot(?:orola)?[- ](\w*)/i,
  	            /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
  	            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, MOBILE]], [
  	            /\b(mz60\d|xoom[2 ]{0,2}) build\//i
  	            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, TABLET]], [

  	            // LG
  	            /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
  	            ], [MODEL, [VENDOR, LG], [TYPE, TABLET]], [
  	            /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
  	            /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
  	            /\blg-?([\d\w]+) bui/i
  	            ], [MODEL, [VENDOR, LG], [TYPE, MOBILE]], [

  	            // Lenovo
  	            /(ideatab[-\w ]+)/i,
  	            /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
  	            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [

  	            // Nokia
  	            /(?:maemo|nokia).*(n900|lumia \d+)/i,
  	            /nokia[-_ ]?([-\w\.]*)/i
  	            ], [[MODEL, /_/g, ' '], [VENDOR, 'Nokia'], [TYPE, MOBILE]], [

  	            // Google
  	            /(pixel c)\b/i                                                      // Google Pixel C
  	            ], [MODEL, [VENDOR, GOOGLE], [TYPE, TABLET]], [
  	            /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i                         // Google Pixel
  	            ], [MODEL, [VENDOR, GOOGLE], [TYPE, MOBILE]], [

  	            // Sony
  	            /droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
  	            ], [MODEL, [VENDOR, SONY], [TYPE, MOBILE]], [
  	            /sony tablet [ps]/i,
  	            /\b(?:sony)?sgp\w+(?: bui|\))/i
  	            ], [[MODEL, 'Xperia Tablet'], [VENDOR, SONY], [TYPE, TABLET]], [

  	            // OnePlus
  	            / (kb2005|in20[12]5|be20[12][59])\b/i,
  	            /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
  	            ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

  	            // Amazon
  	            /(alexa)webm/i,
  	            /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,                             // Kindle Fire without Silk / Echo Show
  	            /(kf[a-z]+)( bui|\)).+silk\//i                                      // Kindle Fire HD
  	            ], [MODEL, [VENDOR, AMAZON], [TYPE, TABLET]], [
  	            /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i                     // Fire Phone
  	            ], [[MODEL, /(.+)/g, 'Fire Phone $1'], [VENDOR, AMAZON], [TYPE, MOBILE]], [

  	            // BlackBerry
  	            /(playbook);[-\w\),; ]+(rim)/i                                      // BlackBerry PlayBook
  	            ], [MODEL, VENDOR, [TYPE, TABLET]], [
  	            /\b((?:bb[a-f]|st[hv])100-\d)/i,
  	            /\(bb10; (\w+)/i                                                    // BlackBerry 10
  	            ], [MODEL, [VENDOR, BLACKBERRY], [TYPE, MOBILE]], [

  	            // Asus
  	            /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
  	            ], [MODEL, [VENDOR, ASUS], [TYPE, TABLET]], [
  	            / (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i
  	            ], [MODEL, [VENDOR, ASUS], [TYPE, MOBILE]], [

  	            // HTC
  	            /(nexus 9)/i                                                        // HTC Nexus 9
  	            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [
  	            /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,                         // HTC

  	            // ZTE
  	            /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
  	            /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i         // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
  	            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

  	            // Acer
  	            /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
  	            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

  	            // Meizu
  	            /droid.+; (m[1-5] note) bui/i,
  	            /\bmz-([-\w]{2,})/i
  	            ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [

  	            // MIXED
  	            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,
  	                                                                                // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
  	            /(hp) ([\w ]+\w)/i,                                                 // HP iPAQ
  	            /(asus)-?(\w+)/i,                                                   // Asus
  	            /(microsoft); (lumia[\w ]+)/i,                                      // Microsoft Lumia
  	            /(lenovo)[-_ ]?([-\w]+)/i,                                          // Lenovo
  	            /(jolla)/i,                                                         // Jolla
  	            /(oppo) ?([\w ]+) bui/i                                             // OPPO
  	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

  	            /(kobo)\s(ereader|touch)/i,                                         // Kobo
  	            /(archos) (gamepad2?)/i,                                            // Archos
  	            /(hp).+(touchpad(?!.+tablet)|tablet)/i,                             // HP TouchPad
  	            /(kindle)\/([\w\.]+)/i,                                             // Kindle
  	            /(nook)[\w ]+build\/(\w+)/i,                                        // Nook
  	            /(dell) (strea[kpr\d ]*[\dko])/i,                                   // Dell Streak
  	            /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,                                  // Le Pan Tablets
  	            /(trinity)[- ]*(t\d{3}) bui/i,                                      // Trinity Tablets
  	            /(gigaset)[- ]+(q\w{1,9}) bui/i,                                    // Gigaset Tablets
  	            /(vodafone) ([\w ]+)(?:\)| bui)/i                                   // Vodafone
  	            ], [VENDOR, MODEL, [TYPE, TABLET]], [

  	            /(surface duo)/i                                                    // Surface Duo
  	            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, TABLET]], [
  	            /droid [\d\.]+; (fp\du?)(?: b|\))/i                                 // Fairphone
  	            ], [MODEL, [VENDOR, 'Fairphone'], [TYPE, MOBILE]], [
  	            /(u304aa)/i                                                         // AT&T
  	            ], [MODEL, [VENDOR, 'AT&T'], [TYPE, MOBILE]], [
  	            /\bsie-(\w*)/i                                                      // Siemens
  	            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [
  	            /\b(rct\w+) b/i                                                     // RCA Tablets
  	            ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [
  	            /\b(venue[\d ]{2,7}) b/i                                            // Dell Venue Tablets
  	            ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [
  	            /\b(q(?:mv|ta)\w+) b/i                                              // Verizon Tablet
  	            ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [
  	            /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i                       // Barnes & Noble Tablet
  	            ], [MODEL, [VENDOR, 'Barnes & Noble'], [TYPE, TABLET]], [
  	            /\b(tm\d{3}\w+) b/i
  	            ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [
  	            /\b(k88) b/i                                                        // ZTE K Series Tablet
  	            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [
  	            /\b(nx\d{3}j) b/i                                                   // ZTE Nubia
  	            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [
  	            /\b(gen\d{3}) b.+49h/i                                              // Swiss GEN Mobile
  	            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [
  	            /\b(zur\d{3}) b/i                                                   // Swiss ZUR Tablet
  	            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [
  	            /\b((zeki)?tb.*\b) b/i                                              // Zeki Tablets
  	            ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [
  	            /\b([yr]\d{2}) b/i,
  	            /\b(dragon[- ]+touch |dt)(\w{5}) b/i                                // Dragon Touch Tablet
  	            ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [
  	            /\b(ns-?\w{0,9}) b/i                                                // Insignia Tablets
  	            ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [
  	            /\b((nxa|next)-?\w{0,9}) b/i                                        // NextBook Tablets
  	            ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [
  	            /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i                  // Voice Xtreme Phones
  	            ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [
  	            /\b(lvtel\-)?(v1[12]) b/i                                           // LvTel Phones
  	            ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [
  	            /\b(ph-1) /i                                                        // Essential PH-1
  	            ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [
  	            /\b(v(100md|700na|7011|917g).*\b) b/i                               // Envizen Tablets
  	            ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [
  	            /\b(trio[-\w\. ]+) b/i                                              // MachSpeed Tablets
  	            ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [
  	            /\btu_(1491) b/i                                                    // Rotor Tablets
  	            ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [
  	            /(shield[\w ]+) b/i                                                 // Nvidia Shield Tablets
  	            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, TABLET]], [
  	            /(sprint) (\w+)/i                                                   // Sprint Phones
  	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
  	            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
  	            ], [[MODEL, /\./g, ' '], [VENDOR, MICROSOFT], [TYPE, MOBILE]], [
  	            /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i             // Zebra
  	            ], [MODEL, [VENDOR, ZEBRA], [TYPE, TABLET]], [
  	            /droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i
  	            ], [MODEL, [VENDOR, ZEBRA], [TYPE, MOBILE]], [

  	            ///////////////////
  	            // SMARTTVS
  	            ///////////////////

  	            /smart-tv.+(samsung)/i                                              // Samsung
  	            ], [VENDOR, [TYPE, SMARTTV]], [
  	            /hbbtv.+maple;(\d+)/i
  	            ], [[MODEL, /^/, 'SmartTV'], [VENDOR, SAMSUNG], [TYPE, SMARTTV]], [
  	            /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i        // LG SmartTV
  	            ], [[VENDOR, LG], [TYPE, SMARTTV]], [
  	            /(apple) ?tv/i                                                      // Apple TV
  	            ], [VENDOR, [MODEL, APPLE+' TV'], [TYPE, SMARTTV]], [
  	            /crkey/i                                                            // Google Chromecast
  	            ], [[MODEL, CHROME+'cast'], [VENDOR, GOOGLE], [TYPE, SMARTTV]], [
  	            /droid.+aft(\w+)( bui|\))/i                                         // Fire TV
  	            ], [MODEL, [VENDOR, AMAZON], [TYPE, SMARTTV]], [
  	            /\(dtv[\);].+(aquos)/i,
  	            /(aquos-tv[\w ]+)\)/i                                               // Sharp
  	            ], [MODEL, [VENDOR, SHARP], [TYPE, SMARTTV]],[
  	            /(bravia[\w ]+)( bui|\))/i                                              // Sony
  	            ], [MODEL, [VENDOR, SONY], [TYPE, SMARTTV]], [
  	            /(mitv-\w{5}) bui/i                                                 // Xiaomi
  	            ], [MODEL, [VENDOR, XIAOMI], [TYPE, SMARTTV]], [
  	            /Hbbtv.*(technisat) (.*);/i                                         // TechniSAT
  	            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
  	            /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,                          // Roku
  	            /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i         // HbbTV devices
  	            ], [[VENDOR, trim], [MODEL, trim], [TYPE, SMARTTV]], [
  	            /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i                   // SmartTV from Unidentified Vendors
  	            ], [[TYPE, SMARTTV]], [

  	            ///////////////////
  	            // CONSOLES
  	            ///////////////////

  	            /(ouya)/i,                                                          // Ouya
  	            /(nintendo) ([wids3utch]+)/i                                        // Nintendo
  	            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [
  	            /droid.+; (shield) bui/i                                            // Nvidia
  	            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [
  	            /(playstation [345portablevi]+)/i                                   // Playstation
  	            ], [MODEL, [VENDOR, SONY], [TYPE, CONSOLE]], [
  	            /\b(xbox(?: one)?(?!; xbox))[\); ]/i                                // Microsoft Xbox
  	            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, CONSOLE]], [

  	            ///////////////////
  	            // WEARABLES
  	            ///////////////////

  	            /((pebble))app/i                                                    // Pebble
  	            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
  	            /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i                              // Apple Watch
  	            ], [MODEL, [VENDOR, APPLE], [TYPE, WEARABLE]], [
  	            /droid.+; (glass) \d/i                                              // Google Glass
  	            ], [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]], [
  	            /droid.+; (wt63?0{2,3})\)/i
  	            ], [MODEL, [VENDOR, ZEBRA], [TYPE, WEARABLE]], [
  	            /(quest( 2| pro)?)/i                                                // Oculus Quest
  	            ], [MODEL, [VENDOR, FACEBOOK], [TYPE, WEARABLE]], [

  	            ///////////////////
  	            // EMBEDDED
  	            ///////////////////

  	            /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i                              // Tesla
  	            ], [VENDOR, [TYPE, EMBEDDED]], [
  	            /(aeobc)\b/i                                                        // Echo Dot
  	            ], [MODEL, [VENDOR, AMAZON], [TYPE, EMBEDDED]], [

  	            ////////////////////
  	            // MIXED (GENERIC)
  	            ///////////////////

  	            /droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i           // Android Phones from Unidentified Vendors
  	            ], [MODEL, [TYPE, MOBILE]], [
  	            /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i       // Android Tablets from Unidentified Vendors
  	            ], [MODEL, [TYPE, TABLET]], [
  	            /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i                      // Unidentifiable Tablet
  	            ], [[TYPE, TABLET]], [
  	            /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i    // Unidentifiable Mobile
  	            ], [[TYPE, MOBILE]], [
  	            /(android[-\w\. ]{0,9});.+buil/i                                    // Generic Android Device
  	            ], [MODEL, [VENDOR, 'Generic']]
  	        ],

  	        engine : [[

  	            /windows.+ edge\/([\w\.]+)/i                                       // EdgeHTML
  	            ], [VERSION, [NAME, EDGE+'HTML']], [

  	            /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i                         // Blink
  	            ], [VERSION, [NAME, 'Blink']], [

  	            /(presto)\/([\w\.]+)/i,                                             // Presto
  	            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
  	            /ekioh(flow)\/([\w\.]+)/i,                                          // Flow
  	            /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,                           // KHTML/Tasman/Links
  	            /(icab)[\/ ]([23]\.[\d\.]+)/i,                                      // iCab
  	            /\b(libweb)/i
  	            ], [NAME, VERSION], [

  	            /rv\:([\w\.]{1,9})\b.+(gecko)/i                                     // Gecko
  	            ], [VERSION, NAME]
  	        ],

  	        os : [[

  	            // Windows
  	            /microsoft (windows) (vista|xp)/i                                   // Windows (iTunes)
  	            ], [NAME, VERSION], [
  	            /(windows) nt 6\.2; (arm)/i,                                        // Windows RT
  	            /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,            // Windows Phone
  	            /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i
  	            ], [NAME, [VERSION, strMapper, windowsVersionMap]], [
  	            /(win(?=3|9|n)|win 9x )([nt\d\.]+)/i
  	            ], [[NAME, 'Windows'], [VERSION, strMapper, windowsVersionMap]], [

  	            // iOS/macOS
  	            /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,              // iOS
  	            /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
  	            /cfnetwork\/.+darwin/i
  	            ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [
  	            /(mac os x) ?([\w\. ]*)/i,
  	            /(macintosh|mac_powerpc\b)(?!.+haiku)/i                             // Mac OS
  	            ], [[NAME, MAC_OS], [VERSION, /_/g, '.']], [

  	            // Mobile OSes
  	            /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i                    // Android-x86/HarmonyOS
  	            ], [VERSION, NAME], [                                               // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
  	            /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
  	            /(blackberry)\w*\/([\w\.]*)/i,                                      // Blackberry
  	            /(tizen|kaios)[\/ ]([\w\.]+)/i,                                     // Tizen/KaiOS
  	            /\((series40);/i                                                    // Series 40
  	            ], [NAME, VERSION], [
  	            /\(bb(10);/i                                                        // BlackBerry 10
  	            ], [VERSION, [NAME, BLACKBERRY]], [
  	            /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i         // Symbian
  	            ], [VERSION, [NAME, 'Symbian']], [
  	            /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i // Firefox OS
  	            ], [VERSION, [NAME, FIREFOX+' OS']], [
  	            /web0s;.+rt(tv)/i,
  	            /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i                              // WebOS
  	            ], [VERSION, [NAME, 'webOS']], [
  	            /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i                              // watchOS
  	            ], [VERSION, [NAME, 'watchOS']], [

  	            // Google Chromecast
  	            /crkey\/([\d\.]+)/i                                                 // Google Chromecast
  	            ], [VERSION, [NAME, CHROME+'cast']], [
  	            /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i                                  // Chromium OS
  	            ], [[NAME, CHROMIUM_OS], VERSION],[

  	            // Smart TVs
  	            /panasonic;(viera)/i,                                               // Panasonic Viera
  	            /(netrange)mmh/i,                                                   // Netrange
  	            /(nettv)\/(\d+\.[\w\.]+)/i,                                         // NetTV

  	            // Console
  	            /(nintendo|playstation) ([wids345portablevuch]+)/i,                 // Nintendo/Playstation
  	            /(xbox); +xbox ([^\);]+)/i,                                         // Microsoft Xbox (360, One, X, S, Series X, Series S)

  	            // Other
  	            /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,                            // Joli/Palm
  	            /(mint)[\/\(\) ]?(\w*)/i,                                           // Mint
  	            /(mageia|vectorlinux)[; ]/i,                                        // Mageia/VectorLinux
  	            /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
  	                                                                                // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
  	            /(hurd|linux) ?([\w\.]*)/i,                                         // Hurd/Linux
  	            /(gnu) ?([\w\.]*)/i,                                                // GNU
  	            /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
  	            /(haiku) (\w+)/i                                                    // Haiku
  	            ], [NAME, VERSION], [
  	            /(sunos) ?([\w\.\d]*)/i                                             // Solaris
  	            ], [[NAME, 'Solaris'], VERSION], [
  	            /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,                              // Solaris
  	            /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,                                  // AIX
  	            /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX/SerenityOS
  	            /(unix) ?([\w\.]*)/i                                                // UNIX
  	            ], [NAME, VERSION]
  	        ]
  	    };

  	    /////////////////
  	    // Constructor
  	    ////////////////

  	    var UAParser = function (ua, extensions) {

  	        if (typeof ua === OBJ_TYPE) {
  	            extensions = ua;
  	            ua = undefined$1;
  	        }

  	        if (!(this instanceof UAParser)) {
  	            return new UAParser(ua, extensions).getResult();
  	        }

  	        var _navigator = (typeof window !== UNDEF_TYPE && window.navigator) ? window.navigator : undefined$1;
  	        var _ua = ua || ((_navigator && _navigator.userAgent) ? _navigator.userAgent : EMPTY);
  	        var _uach = (_navigator && _navigator.userAgentData) ? _navigator.userAgentData : undefined$1;
  	        var _rgxmap = extensions ? extend(regexes, extensions) : regexes;
  	        var _isSelfNav = _navigator && _navigator.userAgent == _ua;

  	        this.getBrowser = function () {
  	            var _browser = {};
  	            _browser[NAME] = undefined$1;
  	            _browser[VERSION] = undefined$1;
  	            rgxMapper.call(_browser, _ua, _rgxmap.browser);
  	            _browser[MAJOR] = majorize(_browser[VERSION]);
  	            // Brave-specific detection
  	            if (_isSelfNav && _navigator && _navigator.brave && typeof _navigator.brave.isBrave == FUNC_TYPE) {
  	                _browser[NAME] = 'Brave';
  	            }
  	            return _browser;
  	        };
  	        this.getCPU = function () {
  	            var _cpu = {};
  	            _cpu[ARCHITECTURE] = undefined$1;
  	            rgxMapper.call(_cpu, _ua, _rgxmap.cpu);
  	            return _cpu;
  	        };
  	        this.getDevice = function () {
  	            var _device = {};
  	            _device[VENDOR] = undefined$1;
  	            _device[MODEL] = undefined$1;
  	            _device[TYPE] = undefined$1;
  	            rgxMapper.call(_device, _ua, _rgxmap.device);
  	            if (_isSelfNav && !_device[TYPE] && _uach && _uach.mobile) {
  	                _device[TYPE] = MOBILE;
  	            }
  	            // iPadOS-specific detection: identified as Mac, but has some iOS-only properties
  	            if (_isSelfNav && _device[MODEL] == 'Macintosh' && _navigator && typeof _navigator.standalone !== UNDEF_TYPE && _navigator.maxTouchPoints && _navigator.maxTouchPoints > 2) {
  	                _device[MODEL] = 'iPad';
  	                _device[TYPE] = TABLET;
  	            }
  	            return _device;
  	        };
  	        this.getEngine = function () {
  	            var _engine = {};
  	            _engine[NAME] = undefined$1;
  	            _engine[VERSION] = undefined$1;
  	            rgxMapper.call(_engine, _ua, _rgxmap.engine);
  	            return _engine;
  	        };
  	        this.getOS = function () {
  	            var _os = {};
  	            _os[NAME] = undefined$1;
  	            _os[VERSION] = undefined$1;
  	            rgxMapper.call(_os, _ua, _rgxmap.os);
  	            if (_isSelfNav && !_os[NAME] && _uach && _uach.platform != 'Unknown') {
  	                _os[NAME] = _uach.platform  
  	                                    .replace(/chrome os/i, CHROMIUM_OS)
  	                                    .replace(/macos/i, MAC_OS);           // backward compatibility
  	            }
  	            return _os;
  	        };
  	        this.getResult = function () {
  	            return {
  	                ua      : this.getUA(),
  	                browser : this.getBrowser(),
  	                engine  : this.getEngine(),
  	                os      : this.getOS(),
  	                device  : this.getDevice(),
  	                cpu     : this.getCPU()
  	            };
  	        };
  	        this.getUA = function () {
  	            return _ua;
  	        };
  	        this.setUA = function (ua) {
  	            _ua = (typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH) ? trim(ua, UA_MAX_LENGTH) : ua;
  	            return this;
  	        };
  	        this.setUA(_ua);
  	        return this;
  	    };

  	    UAParser.VERSION = LIBVERSION;
  	    UAParser.BROWSER =  enumerize([NAME, VERSION, MAJOR]);
  	    UAParser.CPU = enumerize([ARCHITECTURE]);
  	    UAParser.DEVICE = enumerize([MODEL, VENDOR, TYPE, CONSOLE, MOBILE, SMARTTV, TABLET, WEARABLE, EMBEDDED]);
  	    UAParser.ENGINE = UAParser.OS = enumerize([NAME, VERSION]);

  	    ///////////
  	    // Export
  	    //////////

  	    // check js environment
  	    {
  	        // nodejs env
  	        if (module.exports) {
  	            exports = module.exports = UAParser;
  	        }
  	        exports.UAParser = UAParser;
  	    }

  	    // jQuery/Zepto specific (optional)
  	    // Note:
  	    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
  	    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
  	    //   and we should catch that.
  	    var $ = typeof window !== UNDEF_TYPE && (window.jQuery || window.Zepto);
  	    if ($ && !$.ua) {
  	        var parser = new UAParser();
  	        $.ua = parser.getResult();
  	        $.ua.get = function () {
  	            return parser.getUA();
  	        };
  	        $.ua.set = function (ua) {
  	            parser.setUA(ua);
  	            var result = parser.getResult();
  	            for (var prop in result) {
  	                $.ua[prop] = result[prop];
  	            }
  	        };
  	    }

  	})(typeof window === 'object' ? window : commonjsGlobal); 
  } (uaParser, uaParser.exports));

  var uaParserExports = uaParser.exports;

  /* eslint-disable strict */

  /**
   * JavaScript code to detect available availability of a
   * particular font in a browser using JavaScript and CSS.
   *
   * Author : Lalit Patel
   * Website: http://www.lalit.org/lab/javascript-css-font-detect/
   * License: Apache Software License 2.0
   *          http://www.apache.org/licenses/LICENSE-2.0
   * Version: 0.15 (21 Sep 2009)
   *          Changed comparision font to default from sans-default-default,
   *          as in FF3.0 font of child element didn't fallback
   *          to parent element if the font is missing.
   * Version: 0.2 (04 Mar 2012)
   *          Comparing font against all the 3 generic font families ie,
   *          'monospace', 'sans-serif' and 'sans'. If it doesn't match all 3
   *          then that font is 100% not available in the system
   * Version: 0.3 (24 Mar 2012)
   *          Replaced sans with serif in the list of baseFonts
   */

  /**
   * Usage: d = new Detector();
   *        d.detect('font name');
   */
  var fontdetect = function Detector() {
      // a font will be compared against all the three default fonts.
      // and if it doesn't match all 3 then that font is not available.
      var baseFonts = ['monospace', 'sans-serif', 'serif'];

      //we use m or w because these two characters take up the maximum width.
      // And we use a LLi so that the same matching fonts can get separated
      var testString = "mmmmmmmmmmlli";

      //we test using 72px font size, we may use any size. I guess larger the better.
      var testSize = '72px';

      var h = document.getElementsByTagName("body")[0];

      // create a SPAN in the document to get the width of the text we use to test
      var s = document.createElement("span");
      s.style.fontSize = testSize;
      s.innerHTML = testString;
      var defaultWidth = {};
      var defaultHeight = {};
      for (var index in baseFonts) {
          //get the default width for the three base fonts
          s.style.fontFamily = baseFonts[index];
          h.appendChild(s);
          defaultWidth[baseFonts[index]] = s.offsetWidth; //width for the default font
          defaultHeight[baseFonts[index]] = s.offsetHeight; //height for the defualt font
          h.removeChild(s);
      }

      function detect(font) {
          var detected = false;
          for (var index in baseFonts) {
              s.style.fontFamily = font + ',' + baseFonts[index]; // name of the font along with the base font for fallback.
              h.appendChild(s);
              var matched = (s.offsetWidth != defaultWidth[baseFonts[index]] || s.offsetHeight != defaultHeight[baseFonts[index]]);
              h.removeChild(s);
              detected = detected || matched;
          }
          return detected;
      }

      this.detect = detect;
  };

  var globalThis$1 = polyfill();
  var murmurhash3_32_gc = murmurhash3_gcExports;
  var UAParser = uaParserExports;
  var Detector = fontdetect;

  var browserData; // Global user agent browser object.
  var fontDetective; // Global font detective object.

  // ClientJS constructor which sets the browserData object and returs the client object.
  var ClientJS$1 = function() {
    var parser = new UAParser;
    browserData = parser.getResult();
    fontDetective = new Detector();
    return this;
  };

  // ClientJS prototype which contains all methods.
  ClientJS$1.prototype = {

    //
    // MAIN METHODS
    //

    // Get Software Version.  Return a string containing this software version number.
    getSoftwareVersion: function() {
      var version = "0.1.11";
      return version;
    },

    // Get Browser Data.  Return an object containing browser user agent.
    getBrowserData: function() {
      return browserData;
    },

    // Get Fingerprint.  Return a 32-bit integer representing the browsers fingerprint.
    getFingerprint: function() {
      var bar = '|';

      var userAgent = browserData.ua;
      var screenPrint = this.getScreenPrint();
      var pluginList = this.getPlugins();
      var fontList = this.getFonts();
      var localStorage = this.isLocalStorage();
      var sessionStorage = this.isSessionStorage();
      var timeZone = this.getTimeZone();
      var language = this.getLanguage();
      var systemLanguage = this.getSystemLanguage();
      var cookies = this.isCookie();
      var canvasPrint = this.getCanvasPrint();

      var key = userAgent + bar + screenPrint + bar + pluginList + bar + fontList + bar + localStorage + bar + sessionStorage + bar + timeZone + bar + language + bar + systemLanguage + bar + cookies + bar + canvasPrint;
      var seed = 256;

      return murmurhash3_32_gc(key, seed);
    },

    // Get Custom Fingerprint.  Take a string of datapoints and eturn a 32-bit integer representing the browsers fingerprint.
    getCustomFingerprint: function() {
      var bar = '|';
      var key = "";
      for (var i = 0; i < arguments.length; i++) {
        key += arguments[i] + bar;
      }
      return murmurhash3_32_gc(key, 256);
    },

    //
    // USER AGENT METHODS
    //

    // Get User Agent.  Return a string containing unparsed user agent.
    getUserAgent: function() {
      return browserData.ua;
    },

    // Get User Agent Lower Case.  Return a lowercase string containing the user agent.
    getUserAgentLowerCase: function() {
      return browserData.ua.toLowerCase();
    },

    //
    // BROWSER METHODS
    //

    // Get Browser.  Return a string containing the browser name.
    getBrowser: function() {
      return browserData.browser.name;
    },

    // Get Browser Version.  Return a string containing the browser version.
    getBrowserVersion: function() {
      return browserData.browser.version;
    },

    // Get Browser Major Version.  Return a string containing the major browser version.
    getBrowserMajorVersion: function() {
      return browserData.browser.major;
    },

    // Is IE.  Check if the browser is IE.
    isIE: function() {
      return (/IE/i.test(browserData.browser.name));
    },

    // Is Chrome.  Check if the browser is Chrome.
    isChrome: function() {
      return (/Chrome/i.test(browserData.browser.name));
    },

    // Is Firefox.  Check if the browser is Firefox.
    isFirefox: function() {
      return (/Firefox/i.test(browserData.browser.name));
    },

    // Is Safari.  Check if the browser is Safari.
    isSafari: function() {
      return (/Safari/i.test(browserData.browser.name));
    },

    // Is Mobile Safari.  Check if the browser is Safari.
    isMobileSafari: function() {
      return (/Mobile\sSafari/i.test(browserData.browser.name));
    },

    // Is Opera.  Check if the browser is Opera.
    isOpera: function() {
      return (/Opera/i.test(browserData.browser.name));
    },

    //
    // ENGINE METHODS
    //

    // Get Engine.  Return a string containing the browser engine.
    getEngine: function() {
      return browserData.engine.name;
    },

    // Get Engine Version.  Return a string containing the browser engine version.
    getEngineVersion: function() {
      return browserData.engine.version;
    },

    //
    // OS METHODS
    //

    // Get OS.  Return a string containing the OS.
    getOS: function() {
      return browserData.os.name;
    },

    // Get OS Version.  Return a string containing the OS Version.
    getOSVersion: function() {
      return browserData.os.version;
    },

    // Is Windows.  Check if the OS is Windows.
    isWindows: function() {
      return (/Windows/i.test(browserData.os.name));
    },

    // Is Mac.  Check if the OS is Mac.
    isMac: function() {
      return (/Mac/i.test(browserData.os.name));
    },

    // Is Linux.  Check if the OS is Linux.
    isLinux: function() {
      return (/Linux/i.test(browserData.os.name));
    },

    // Is Ubuntu.  Check if the OS is Ubuntu.
    isUbuntu: function() {
      return (/Ubuntu/i.test(browserData.os.name));
    },

    // Is Solaris.  Check if the OS is Solaris.
    isSolaris: function() {
      return (/Solaris/i.test(browserData.os.name));
    },

    //
    // DEVICE METHODS
    //

    // Get Device.  Return a string containing the device.
    getDevice: function() {
      return browserData.device.model;
    },

    // Get Device Type.  Return a string containing the device type.
    getDeviceType: function() {
      return browserData.device.type;
    },

    // Get Device Vendor.  Return a string containing the device vendor.
    getDeviceVendor: function() {
      return browserData.device.vendor;
    },

    //
    // CPU METHODS
    //

    // Get CPU.  Return a string containing the CPU architecture.
    getCPU: function() {
      return browserData.cpu.architecture;
    },

    //
    // MOBILE METHODS
    //

    // Is Mobile.  Check if the browser is on a mobile device.
    isMobile: function() {
      // detectmobilebrowsers.com JavaScript Mobile Detection Script
      var dataString = browserData.ua || navigator.vendor || window.opera;
      // eslint-disable-next-line no-useless-escape
      return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(dataString) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(dataString.substr(0, 4)));
    },

    // Is Mobile Major.  Check if the browser is on a major mobile device.
    isMobileMajor: function() {
      return (this.isMobileAndroid() || this.isMobileBlackBerry() || this.isMobileIOS() || this.isMobileOpera() || this.isMobileWindows());
    },

    // Is Mobile.  Check if the browser is on an android mobile device.
    isMobileAndroid: function() {
      if (browserData.ua.match(/Android/i)) {
        return true;
      }
      return false;
    },

    // Is Mobile Opera.  Check if the browser is on an opera mobile device.
    isMobileOpera: function() {
      if (browserData.ua.match(/Opera Mini/i)) {
        return true;
      }
      return false;
    },

    // Is Mobile Windows.  Check if the browser is on a windows mobile device.
    isMobileWindows: function() {
      if (browserData.ua.match(/IEMobile/i)) {
        return true;
      }
      return false;
    },

    // Is Mobile BlackBerry.  Check if the browser is on a blackberry mobile device.
    isMobileBlackBerry: function() {
      if (browserData.ua.match(/BlackBerry/i)) {
        return true;
      }
      return false;
    },

    //
    // MOBILE APPLE METHODS
    //

    // Is Mobile iOS.  Check if the browser is on an Apple iOS device.
    isMobileIOS: function() {
      if (browserData.ua.match(/iPhone|iPad|iPod/i)) {
        return true;
      }
      return false;
    },

    // Is Iphone.  Check if the browser is on an Apple iPhone.
    isIphone: function() {
      if (browserData.ua.match(/iPhone/i)) {
        return true;
      }
      return false;
    },

    // Is Ipad.  Check if the browser is on an Apple iPad.
    isIpad: function() {
      if (browserData.ua.match(/iPad/i)) {
        return true;
      }
      return false;
    },

    // Is Ipod.  Check if the browser is on an Apple iPod.
    isIpod: function() {
      if (browserData.ua.match(/iPod/i)) {
        return true;
      }
      return false;
    },

    //
    // SCREEN METHODS
    //

    // Get Screen Print.  Return a string containing screen information.
    getScreenPrint: function() {
      return "Current Resolution: " + this.getCurrentResolution() + ", Available Resolution: " + this.getAvailableResolution() + ", Color Depth: " + this.getColorDepth() + ", Device XDPI: " + this.getDeviceXDPI() + ", Device YDPI: " + this.getDeviceYDPI();
    },

    // Get Color Depth.  Return a string containing the color depth.
    getColorDepth: function() {
      return screen.colorDepth;
    },

    // Get Current Resolution.  Return a string containing the current resolution.
    getCurrentResolution: function() {
      return screen.width + "x" + screen.height;
    },

    // Get Available Resolution.  Return a string containing the available resolution.
    getAvailableResolution: function() {
      return screen.availWidth + "x" + screen.availHeight;
    },

    // Get Device XPDI.  Return a string containing the device XPDI.
    getDeviceXDPI: function() {
      return screen.deviceXDPI;
    },

    // Get Device YDPI.  Return a string containing the device YDPI.
    getDeviceYDPI: function() {
      return screen.deviceYDPI;
    },

    //
    // PLUGIN METHODS
    //

    // Get Plugins.  Return a string containing a list of installed plugins.
    getPlugins: function() {
      var pluginsList = "";

      for (var i = 0; i < navigator.plugins.length; i++) {
        if (i == navigator.plugins.length - 1) {
          pluginsList += navigator.plugins[i].name;
        } else {
          pluginsList += navigator.plugins[i].name + ", ";
        }
      }
      return pluginsList;
    },

    // Is Java.  Check if Java is installed.
    isJava: function() {
      return navigator.javaEnabled();
    },

    // Get Java Version.  Return a string containing the Java Version.
    getJavaVersion: function() {
      throw new Error('Please use client.java.js or client.js if you need this functionality!');
    },

    // Is Flash.  Check if Flash is installed.
    isFlash: function() {
      var objPlugin = navigator.plugins["Shockwave Flash"];
      if (objPlugin) {
        return true;
      }
      return false;
    },

    // Get Flash Version.  Return a string containing the Flash Version.
    getFlashVersion: function() {
      throw new Error('Please use client.flash.js or client.js if you need this functionality!');
    },

    // Is Silverlight.  Check if Silverlight is installed.
    isSilverlight: function() {
      var objPlugin = navigator.plugins["Silverlight Plug-In"];
      if (objPlugin) {
        return true;
      }
      return false;
    },

    // Get Silverlight Version.  Return a string containing the Silverlight Version.
    getSilverlightVersion: function() {
      if (this.isSilverlight()) {
        var objPlugin = navigator.plugins["Silverlight Plug-In"];
        return objPlugin.description;
      }
      return "";
    },

    //
    // MIME TYPE METHODS
    //

    // Is Mime Types.  Check if a mime type is installed.
    isMimeTypes: function() {
      if (navigator.mimeTypes && navigator.mimeTypes.length) {
        return true;
      }
      return false;
    },

    // Get Mime Types.  Return a string containing a list of installed mime types.
    getMimeTypes: function() {
      var mimeTypeList = "";

      if(navigator.mimeTypes) {
        for (var i = 0; i < navigator.mimeTypes.length; i++) {
          if (i == navigator.mimeTypes.length - 1) {
            mimeTypeList += navigator.mimeTypes[i].description;
          } else {
            mimeTypeList += navigator.mimeTypes[i].description + ", ";
          }
        }
      }
      return mimeTypeList;
    },

    //
    // FONT METHODS
    //

    // Is Font.  Check if a font is installed.
    isFont: function(font) {
      return fontDetective.detect(font);
    },

    // Get Fonts.  Return a string containing a list of installed fonts.
    getFonts: function() {
      var fontArray = ["Abadi MT Condensed Light", "Adobe Fangsong Std", "Adobe Hebrew", "Adobe Ming Std", "Agency FB", "Aharoni", "Andalus", "Angsana New", "AngsanaUPC", "Aparajita", "Arab", "Arabic Transparent", "Arabic Typesetting", "Arial Baltic", "Arial Black", "Arial CE", "Arial CYR", "Arial Greek", "Arial TUR", "Arial", "Batang", "BatangChe", "Bauhaus 93", "Bell MT", "Bitstream Vera Serif", "Bodoni MT", "Bookman Old Style", "Braggadocio", "Broadway", "Browallia New", "BrowalliaUPC", "Calibri Light", "Calibri", "Californian FB", "Cambria Math", "Cambria", "Candara", "Castellar", "Casual", "Centaur", "Century Gothic", "Chalkduster", "Colonna MT", "Comic Sans MS", "Consolas", "Constantia", "Copperplate Gothic Light", "Corbel", "Cordia New", "CordiaUPC", "Courier New Baltic", "Courier New CE", "Courier New CYR", "Courier New Greek", "Courier New TUR", "Courier New", "DFKai-SB", "DaunPenh", "David", "DejaVu LGC Sans Mono", "Desdemona", "DilleniaUPC", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Engravers MT", "Eras Bold ITC", "Estrangelo Edessa", "EucrosiaUPC", "Euphemia", "Eurostile", "FangSong", "Forte", "FrankRuehl", "Franklin Gothic Heavy", "Franklin Gothic Medium", "FreesiaUPC", "French Script MT", "Gabriola", "Gautami", "Georgia", "Gigi", "Gisha", "Goudy Old Style", "Gulim", "GulimChe", "GungSeo", "Gungsuh", "GungsuhChe", "Haettenschweiler", "Harrington", "Hei S", "HeiT", "Heisei Kaku Gothic", "Hiragino Sans GB", "Impact", "Informal Roman", "IrisUPC", "Iskoola Pota", "JasmineUPC", "KacstOne", "KaiTi", "Kalinga", "Kartika", "Khmer UI", "Kino MT", "KodchiangUPC", "Kokila", "Kozuka Gothic Pr6N", "Lao UI", "Latha", "Leelawadee", "Levenim MT", "LilyUPC", "Lohit Gujarati", "Loma", "Lucida Bright", "Lucida Console", "Lucida Fax", "Lucida Sans Unicode", "MS Gothic", "MS Mincho", "MS PGothic", "MS PMincho", "MS Reference Sans Serif", "MS UI Gothic", "MV Boli", "Magneto", "Malgun Gothic", "Mangal", "Marlett", "Matura MT Script Capitals", "Meiryo UI", "Meiryo", "Menlo", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Sans Serif", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU-ExtB", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "Miriam Fixed", "Miriam", "Mongolian Baiti", "MoolBoran", "NSimSun", "Narkisim", "News Gothic MT", "Niagara Solid", "Nyala", "PMingLiU", "PMingLiU-ExtB", "Palace Script MT", "Palatino Linotype", "Papyrus", "Perpetua", "Plantagenet Cherokee", "Playbill", "Prelude Bold", "Prelude Condensed Bold", "Prelude Condensed Medium", "Prelude Medium", "PreludeCompressedWGL Black", "PreludeCompressedWGL Bold", "PreludeCompressedWGL Light", "PreludeCompressedWGL Medium", "PreludeCondensedWGL Black", "PreludeCondensedWGL Bold", "PreludeCondensedWGL Light", "PreludeCondensedWGL Medium", "PreludeWGL Black", "PreludeWGL Bold", "PreludeWGL Light", "PreludeWGL Medium", "Raavi", "Rachana", "Rockwell", "Rod", "Sakkal Majalla", "Sawasdee", "Script MT Bold", "Segoe Print", "Segoe Script", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Segoe UI", "Shonar Bangla", "Showcard Gothic", "Shruti", "SimHei", "SimSun", "SimSun-ExtB", "Simplified Arabic Fixed", "Simplified Arabic", "Snap ITC", "Sylfaen", "Symbol", "Tahoma", "Times New Roman Baltic", "Times New Roman CE", "Times New Roman CYR", "Times New Roman Greek", "Times New Roman TUR", "Times New Roman", "TlwgMono", "Traditional Arabic", "Trebuchet MS", "Tunga", "Tw Cen MT Condensed Extra Bold", "Ubuntu", "Umpush", "Univers", "Utopia", "Utsaah", "Vani", "Verdana", "Vijaya", "Vladimir Script", "Vrinda", "Webdings", "Wide Latin", "Wingdings"];
      var fontString = "";

      for (var i = 0; i < fontArray.length; i++) {
        if (fontDetective.detect(fontArray[i])) {
          if (i == fontArray.length - 1) {
            fontString += fontArray[i];
          } else {
            fontString += fontArray[i] + ", ";
          }
        }
      }

      return fontString;
    },

    //
    // STORAGE METHODS
    //

    // Is Local Storage.  Check if local storage is enabled.
    isLocalStorage: function() {
      try {
        return !!globalThis$1.localStorage;
      } catch (e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    // Is Session Storage.  Check if session storage is enabled.
    isSessionStorage: function() {
      try {
        return !!globalThis$1.sessionStorage;
      } catch (e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    // Is Cookie.  Check if cookies are enabled.
    isCookie: function() {
      return navigator.cookieEnabled;
    },

    //
    // TIME METHODS
    //

    // Get Time Zone.  Return a string containing the time zone.
    getTimeZone: function() {
      var rightNow, myNumber, formattedNumber, result;
        rightNow = new Date();
        myNumber = String(-(rightNow.getTimezoneOffset() / 60));
        if (myNumber < 0) {
            myNumber = myNumber * -1;
            formattedNumber = ("0" + myNumber).slice(-2);
            result = "-" + formattedNumber;
        } else {
            formattedNumber = ("0" + myNumber).slice(-2);
            result = "+" + formattedNumber;
        }
        return result;
    },

    //
    // LANGUAGE METHODS
    //

    // Get Language.  Return a string containing the user language.
    getLanguage: function() {
      return navigator.language;
    },

    // Get System Language.  Return a string containing the system language.
    getSystemLanguage: function() {
      return navigator.systemLanguage || window.navigator.language;
    },

    //
    // CANVAS METHODS
    //

    // Is Canvas.  Check if the canvas element is enabled.
    isCanvas: function() {

      // create a canvas element
      var elem = document.createElement('canvas');

      // try/catch for older browsers that don't support the canvas element
      try {

        // check if context and context 2d exists
        return !!(elem.getContext && elem.getContext('2d'));

      } catch (e) {

        // catch if older browser
        return false;
      }
    },

    // Get Canvas Print.  Return a string containing the canvas URI data.
    getCanvasPrint: function() {

      // create a canvas element
      var canvas = document.createElement('canvas');

      // define a context var that will be used for browsers with canvas support
      var ctx;

      // try/catch for older browsers that don't support the canvas element
      try {

        // attempt to give ctx a 2d canvas context value
        ctx = canvas.getContext('2d');

      } catch (e) {

        // return empty string if canvas element not supported
        return "";
      }

      // https://www.browserleaks.com/canvas#how-does-it-work
      // Text with lowercase/uppercase/punctuation symbols
      var txt = 'ClientJS,org <canvas> 1.0';
      ctx.textBaseline = "top";
      // The most common type
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      // Some tricks for color mixing to increase the difference in rendering
      ctx.fillStyle = "#069";
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText(txt, 4, 17);
      return canvas.toDataURL();
    }
  };

  client_base.ClientJS = ClientJS$1;

  /* globals ActiveXObject:readonly, oClientCaps:readonly */

  var version_regex_base = '^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:[_\\.](\\d+))?)?)?';

  /*
   *           version_regex_base - see version_regex_base comment above
   *           $                  - End of the string
   *
   */

  var version_regex_strict = version_regex_base + '$';

  /*
   *           version_regex_base - see version_regex_base comment above
   *           (                  - Capturing group 5
   *             \\*              - Match '*'
   *             |                - OR
   *             \\+              - Match '+'
   *           )?                 - Match zero or one time
   *           $                  - End of string
   *
   */
  var version_regex_with_family_modifier = version_regex_base + '(\\*|\\+)?$';

  /** HTML attribute filter implementation */
  var hattrs = {
    core: ['id', 'class', 'title', 'style'],
    applet: [
      'codebase',
      'code',
      'name',
      'archive',
      'object',
      'width',
      'height',
      'alt',
      'align',
      'hspace',
      'vspace',
    ],
  };

  var applet_valid_attrs = hattrs.applet.concat(hattrs.core);

  // startsWith() is not supported by IE
  if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  // generic log function, use console.log unless it isn't available
  // then revert to alert()
  function log(message) {
    if (!deployJava$1.debug) {
      return;
    }

    if (console.log) {
      console.log(message);
    } else {
      alert(message);
    }
  }

  function showMessageBox() {
    var message =
      'Java Plug-in is not supported by this browser. <a href="https://java.com/dt-redirect">More info</a>';
    var mbStyle =
      'background-color: #ffffce;text-align: left;border: solid 1px #f0c000; padding: 1.65em 1.65em .75em 0.5em; font-family: Helvetica, Arial, sans-serif; font-size: 75%; bottom:0; left:0; right:0; position:fixed; margin:auto; opacity:0.9; width:400px;';
    var messageStyle = 'border: .85px; margin:-2.2em 0 0.55em 2.5em;';
    var closeButtonStyle =
      'margin-left:10px;font-weight:bold;float:right;font-size:22px;line-height:20px;cursor:pointer;color:red;';
    var messageBox =
      '<span style="' +
      closeButtonStyle +
      '" onclick="this.parentElement.style.display=\'none\';">&times;</span><img src="https://java.com/js/alert_16.png"><div style="' +
      messageStyle +
      '"><p>' +
      message +
      '</p>';

    var divTag = document.createElement('div');
    divTag.id = 'messagebox';
    divTag.setAttribute('style', mbStyle);
    divTag.innerHTML = messageBox;
    document.body.appendChild(divTag);
  }

  //checks where given version string matches query
  //
  //NB: assume format is correct. Can add format check later if needed
  // from dtjava.js
  function versionCheckEx(query, version) {
    if (query == null || query.length == 0) return true;

    var c = query.charAt(query.length - 1);

    //if it is not explicit pattern but does not have update version then need to append *
    if (c != '+' && c != '*' && query.indexOf('_') != -1 && c != '_') {
      query = query + '*';
      c = '*';
    }

    query = query.substring(0, query.length - 1);
    //if query ends with ".", "_" then we want to strip it to allow match of "1.6.*" to shorter form such as "1.6"
    //TODO: add support for match of "1.7.0*" to "1.7"?
    if (query.length > 0) {
      var z = query.charAt(query.length - 1);
      if (z == '.' || z == '_') {
        query = query.substring(0, query.length - 1);
      }
    }
    if (c == '*') {
      //it is match if version starts from it
      return version.indexOf(query) == 0;
    } else if (c == '+') {
      //match if query string is lexicographically smaller
      return query <= version;
    }
    return false;
  }

  function doVersionCheck(versionPattern, noplugin) {
    var index = 0;

    var matchData = versionPattern.match(version_regex_with_family_modifier);
    if (matchData != null) {
      if (noplugin) {
        return true;
      }
      // default is exact version match
      // examples:
      //    local machine has 1.7.0_04 only installed
      //    exact match request is "1.7.0_05":  return false
      //    family match request is "1.7.0*":   return true
      //    minimum match request is "1.6+":    return true
      var familyMatch = false;
      var minMatch = false;

      var patternArray = new Array();

      for (var i = 1; i < matchData.length; ++i) {
        // browser dependency here.
        // Fx sets 'undefined', IE sets '' string for unmatched groups
        if (typeof matchData[i] == 'string' && matchData[i] != '') {
          patternArray[index] = matchData[i];
          index++;
        }
      }

      if (patternArray[patternArray.length - 1] == '+') {
        // + specified in request - doing a minimum match
        minMatch = true;
        familyMatch = false;
        patternArray.length--;
      } else if (patternArray[patternArray.length - 1] == '*') {
        // * specified in request - doing a family match
        minMatch = false;
        familyMatch = true;
        patternArray.length--;
      } else if (patternArray.length < 4) {
        // versionPattern does not include all four version components
        // and does not end with a star or plus, it will be treated as
        // if it ended with a star. (family match)
        minMatch = false;
        familyMatch = true;
      }

      var list = deployJava$1.getJREs();
      for (var j = 0; j < list.length; ++j) {
        if (deployJava$1.compareVersionToPattern(list[j], patternArray, familyMatch, minMatch)) {
          return true;
        }
      }

      return false;
    } else {
      var msg = 'Invalid versionPattern passed to versionCheck: ' + versionPattern;
      log('[versionCheck()] ' + msg);
      alert(msg);
      return false;
    }
  }

  function isWebStartFound() {
    return doVersionCheck('1.7.0+', false);
  }

  function isAbsoluteUrl(url) {
    var protocols = ['http://', 'https://', 'file://'];
    for (var i = 0; i < protocols.length; i++) {
      if (url.toLowerCase().startsWith(protocols[i])) {
        return true;
      }
    }
    return false;
  }

  function getAbsoluteUrl(jnlp) {
    var absoluteUrl;
    if (isAbsoluteUrl(jnlp)) {
      absoluteUrl = jnlp;
    } else {
      var location = window.location.href;
      var pos = location.lastIndexOf('/');
      var docbase = pos > -1 ? location.substring(0, pos + 1) : location + '/';
      absoluteUrl = docbase + jnlp;
    }
    return absoluteUrl;
  }

  function launchWithJnlpProtocol(jnlp) {
    document.location = 'jnlp:' + getAbsoluteUrl(jnlp);
  }

  function isNoPluginWebBrowser() {
    var browser = deployJava$1.getBrowser();
    if (
      browser == 'Edge' ||
      deployJava$1.browserName2 == 'Chrome' ||
      (deployJava$1.browserName2 == 'FirefoxNoPlugin' && !doVersionCheck('1.8*', false)) ||
      deployJava$1.browserName2 == 'NoActiveX'
    ) {
      return true;
    }
    return false;
  }

  function getWebStartLaunchIconURL() {
    var imageUrl = '//java.com/js/webstart.png';
    try {
      // for http/https; use protocol less url; use http for all other protocol
      return document.location.protocol.indexOf('http') != -1 ? imageUrl : 'https:' + imageUrl;
    } catch (err) {
      return 'https:' + imageUrl;
    }
  }

  // GetJava page
  function constructGetJavaURL(query) {
    var getJavaURL = 'https://java.com/dt-redirect';

    if (query == null || query.length == 0) return getJavaURL;
    if (query.charAt(0) == '&') {
      query = query.substring(1, query.length);
    }
    return getJavaURL + '?' + query;
  }

  function arHas(ar, attr) {
    var len = ar.length;
    for (var i = 0; i < len; i++) {
      if (ar[i] === attr) return true;
    }
    return false;
  }

  function isValidAppletAttr(attr) {
    return arHas(applet_valid_attrs, attr.toLowerCase());
  }

  /**
   * returns true if we can enable DT plugin auto-install without chance of
   * deadlock on cert mismatch dialog
   *
   * requestedJREVersion param is optional - if null, it will be
   * treated as installing any JRE version
   *
   * DT plugin for 6uX only knows about JRE installer signed by SUN cert.
   * If it encounter Oracle signed JRE installer, it will have chance of
   * deadlock when running with IE.  This function is to guard against this.
   */
  function enableWithoutCertMisMatchWorkaround(requestedJREVersion) {
    // Non-IE browser are okay
    if ('MSIE' != deployJava$1.browserName) return true;

    // if DT plugin is 10.0.0 or above, return true
    // This is because they are aware of both SUN and Oracle signature and
    // will not show cert mismatch dialog that might cause deadlock
    if (
      deployJava$1.compareVersionToPattern(
        deployJava$1.getPlugin().version,
        ['10', '0', '0'],
        false,
        true
      )
    ) {
      return true;
    }

    // If we got there, DT plugin is 6uX

    if (requestedJREVersion == null) {
      // if requestedJREVersion is not defined - it means ANY.
      // can not guarantee it is safe to install ANY version because 6uX
      // DT does not know about Oracle certificates and may deadlock
      return false;
    }

    // 6u32 or earlier JRE installer used Sun certificate
    // 6u33+ uses Oracle's certificate
    // DT in JRE6 does not know about Oracle certificate => can only
    // install 6u32 or earlier without risk of deadlock
    return !versionCheckEx('1.6.0_33+', requestedJREVersion);
  }

  /* HTML attribute filters */

  var deployJava$1 = {
    debug: null,

    /* version of deployJava.js */
    version: '20120801',

    firefoxJavaVersion: null,
    useStaticMimeType: false,

    myInterval: null,
    preInstallJREList: null,
    brand: null,
    locale: null,
    installType: null,

    EAInstallEnabled: false,
    EarlyAccessURL: null,

    // mime-type of the DeployToolkit plugin object
    oldMimeType: 'application/npruntime-scriptable-plugin;DeploymentToolkit',
    mimeType: 'application/java-deployment-toolkit',

    /* location of the Java Web Start launch button graphic is right next to
     * deployJava.js at:
     *    https://java.com/js/webstart.png
     *
     * Use protocol less url here for http/https support
     */
    launchButtonPNG: getWebStartLaunchIconURL(),

    browserName: null,
    browserName2: null,

    /**
     * Returns an array of currently-installed JRE version strings.
     * Version strings are of the form #.#[.#[_#]], with the function returning
     * as much version information as it can determine, from just family
     * versions ("1.4.2", "1.5") through the full version ("1.5.0_06").
     *
     * Detection is done on a best-effort basis.  Under some circumstances
     * only the highest installed JRE version will be detected, and
     * JREs older than 1.4.2 will not always be detected.
     */
    getJREs: function () {
      var list = new Array();
      if (this.isPluginInstalled()) {
        var plugin = this.getPlugin();
        var VMs = plugin.jvms;
        for (var i = 0; i < VMs.getLength(); i++) {
          list[i] = VMs.get(i).version;
        }
      } else {
        var browser = this.getBrowser();

        if (browser == 'MSIE') {
          if (this.testUsingActiveX('9')) {
            list[0] = '9';
          } else if (this.testUsingActiveX('1.8.0')) {
            list[0] = '1.8.0';
          } else if (this.testUsingActiveX('1.7.0')) {
            list[0] = '1.7.0';
          } else if (this.testUsingActiveX('1.6.0')) {
            list[0] = '1.6.0';
          } else if (this.testUsingActiveX('1.5.0')) {
            list[0] = '1.5.0';
          } else if (this.testUsingActiveX('1.4.2')) {
            list[0] = '1.4.2';
          } else if (this.testForMSVM()) {
            list[0] = '1.1';
          }
        } else if (browser == 'Netscape Family') {
          this.getJPIVersionUsingMimeType();
          if (this.firefoxJavaVersion != null) {
            list[0] = this.firefoxJavaVersion;
          } else if (this.testUsingMimeTypes('9')) {
            list[0] = '9';
          } else if (this.testUsingMimeTypes('1.8')) {
            list[0] = '1.8.0';
          } else if (this.testUsingMimeTypes('1.7')) {
            list[0] = '1.7.0';
          } else if (this.testUsingMimeTypes('1.6')) {
            list[0] = '1.6.0';
          } else if (this.testUsingMimeTypes('1.5')) {
            list[0] = '1.5.0';
          } else if (this.testUsingMimeTypes('1.4.2')) {
            list[0] = '1.4.2';
          } else if (this.browserName2 == 'Safari') {
            if (this.testUsingPluginsArray('9')) {
              list[0] = '9';
            } else if (this.testUsingPluginsArray('1.8')) {
              list[0] = '1.8.0';
            } else if (this.testUsingPluginsArray('1.7')) {
              list[0] = '1.7.0';
            } else if (this.testUsingPluginsArray('1.6')) {
              list[0] = '1.6.0';
            } else if (this.testUsingPluginsArray('1.5')) {
              list[0] = '1.5.0';
            } else if (this.testUsingPluginsArray('1.4.2')) {
              list[0] = '1.4.2';
            }
          }
        }
      }

      if (this.debug) {
        for (var j = 0; j < list.length; ++j) {
          log('[getJREs()] We claim to have detected Java SE ' + list[j]);
        }
      }

      return list;
    },

    /**
     * Calls this.installLatestJRE() if the requested version of JRE is not installed.
     *
     * The requestVersion string is of the form #[.#[.#[_#]]][+|*],
     * which includes strings such as "1.4", "1.5.0*", and "1.6.0_02+".
     * A star (*) means "any version starting within this family" and
     * a plus (+) means "any version greater or equal to this".
     * "1.5.0*" * matches 1.5.0_06 but not 1.6.0_01, whereas
     * "1.5.0+" matches both.
     *
     */
    installJRE: function (requestVersion) {
      log(
        'The Deployment Toolkit installJRE()  method no longer installs JRE. It just checks ' +
          'if the requested version of JRE is installed and calls installLatestJRE() otherwise. ' +
          'More Information on usage of the Deployment Toolkit can be found in the ' +
          'Deployment Guide at https://docs.oracle.com/javase/8/docs/technotes/guides/deploy/'
      );
      if (requestVersion == 'undefined' || requestVersion == null) {
        requestVersion = '1.1';
      }

      var matchData = requestVersion.match(version_regex_with_family_modifier);

      if (matchData == null) {
        log('Invalid requestVersion argument to installJRE(): ' + requestVersion);
        requestVersion = '1.6';
      }
      if (!this.versionCheck(requestVersion)) {
        return this.installLatestJRE();
      }

      return true;
    },

    /**
     * returns true if jre auto install for the requestedJREVersion is enabled
     * for the local system; false otherwise
     *
     * requestedJREVersion param is optional - if not specified, it will be
     * treated as installing any JRE version
     *
     * DT plugin for 6uX only knows about JRE installer signed by SUN cert.
     * If it encounter Oracle signed JRE installer, it will have chance of
     * deadlock when running with IE.  This function is to guard against this.
     */
    isAutoInstallEnabled: function (requestedJREVersion) {
      // if no DT plugin, return false
      if (!this.isPluginInstalled()) return false;

      if (typeof requestedJREVersion == 'undefined') {
        requestedJREVersion = null;
      }

      return enableWithoutCertMisMatchWorkaround(requestedJREVersion);
    },

    /**
     * returns true if jre install callback is supported
     * callback support is added since dt plugin version 10.2.0 or above
     */
    isCallbackSupported: function () {
      return (
        this.isPluginInstalled() &&
        this.compareVersionToPattern(this.getPlugin().version, ['10', '2', '0'], false, true)
      );
    },

    /**
     * Redirects the browser window to the java.com JRE installation page,
     * and (if possible) redirects back to the current URL upon successful
     * installation, if the installed version of JRE is below the security
     * baseline or Deployment Toolkit plugin is not installed or disabled.
     *
     */
    installLatestJRE: function () {
      log(
        "The Deployment Toolkit installLatestJRE() method no longer installs JRE. If user's version of " +
          'Java is below the security baseline it redirects user to java.com to get an updated JRE. ' +
          'More Information on usage of the Deployment Toolkit can be found in the Deployment Guide at ' +
          '://docs.oracle.com/javase/8/docs/technotes/guides/deploy/'
      );

      if (!this.isPluginInstalled() || !this.getPlugin().installLatestJRE()) {
        var browser = this.getBrowser();
        var platform = navigator.platform.toLowerCase();
        if (browser == 'MSIE') {
          return this.IEInstall();
        } else if (browser == 'Netscape Family' && platform.indexOf('win32') != -1) {
          return this.FFInstall();
        } else {
          location.href = constructGetJavaURL(
            (this.locale != null ? '&locale=' + this.locale : '') +
              (this.brand != null ? '&brand=' + this.brand : '')
          );
        }
        // we have to return false although there may be an install
        // in progress now, when complete it may go to return page
        return false;
      }
      return true;
    },

    /**
     * Ensures that an appropriate JRE is installed and then runs an applet.
     * minimumVersion is of the form #[.#[.#[_#]]], and is the minimum
     * JRE version necessary to run this applet.  minimumVersion is optional,
     * defaulting to the value "1.1" (which matches any JRE).
     * If an equal or greater JRE is detected, runApplet() will call
     * writeAppletTag(attributes, parameters) to output the applet tag,
     * otherwise it will call installJRE(minimumVersion + '+').
     *
     * After installJRE() is called, the script will attempt to detect that the
     * JRE installation has completed and begin running the applet, but there
     * are circumstances (such as when the JRE installation requires a browser
     * restart) when this cannot be fulfilled.
     *
     * As with writeAppletTag(), this function should only be called prior to
     * the web page being completely rendered.  Note that version wildcards
     * (star (*) and plus (+)) are not supported, and including them in the
     * minimumVersion will result in an error message.
     */
    runApplet: function (attributes, parameters, minimumVersion) {
      if (minimumVersion == 'undefined' || minimumVersion == null) {
        minimumVersion = '1.1';
      }

      var matchData = minimumVersion.match(version_regex_strict);

      if (matchData != null) {
        var browser = this.getBrowser();
        if (browser != '?') {
          if (isNoPluginWebBrowser()) {
            var readyStateCheck = setInterval(function () {
              if (document.readyState == 'complete') {
                clearInterval(readyStateCheck);
                showMessageBox();
              }
            }, 15);
            log('[runApplet()] Java Plug-in is not supported by this browser');
            return;
          }

          if (this.versionCheck(minimumVersion + '+')) {
            this.writeAppletTag(attributes, parameters);
          } else if (this.installJRE(minimumVersion + '+')) {
            this.writeAppletTag(attributes, parameters);
          }
        } else {
          // for unknown or Safari - just try to show applet
          this.writeAppletTag(attributes, parameters);
        }
      } else {
        log('[runApplet()] Invalid minimumVersion argument to runApplet():' + minimumVersion);
      }
    },

    /**
     * Outputs an applet tag with the specified attributes and parameters, where
     * both attributes and parameters are associative arrays.  Each key/value
     * pair in attributes becomes an attribute of the applet tag itself, while
     * key/value pairs in parameters become <PARAM> tags.  No version checking
     * or other special behaviors are performed; the tag is simply written to
     * the page using document.writeln().
     *
     * As document.writeln() is generally only safe to use while the page is
     * being rendered, you should never call this function after the page
     * has been completed.
     */
    writeAppletTag: function (attributes, parameters) {
      var startApplet = '<' + 'applet ';
      var params = '';
      var endApplet = '<' + '/' + 'applet' + '>';
      var addCodeAttribute = true;

      if (null == parameters || typeof parameters != 'object') {
        parameters = new Object();
      }

      for (var attribute in attributes) {
        if (!isValidAppletAttr(attribute)) {
          parameters[attribute] = attributes[attribute];
        } else {
          startApplet += ' ' + attribute + '="' + attributes[attribute] + '"';
          if (attribute == 'code') {
            addCodeAttribute = false;
          }
        }
      }

      var codebaseParam = false;
      for (var parameter in parameters) {
        if (parameter == 'codebase_lookup') {
          codebaseParam = true;
        }
        // Originally, parameter 'object' was used for serialized
        // applets, later, to avoid confusion with object tag in IE
        // the 'java_object' was added.  Plugin supports both.
        if (parameter == 'object' || parameter == 'java_object' || parameter == 'java_code') {
          addCodeAttribute = false;
        }
        params += '<param name="' + parameter + '" value="' + parameters[parameter] + '"/>';
      }
      if (!codebaseParam) {
        params += '<param name="codebase_lookup" value="false"/>';
      }

      if (addCodeAttribute) {
        startApplet += ' code="dummy"';
      }
      startApplet += '>';

      document.write(startApplet + '\n' + params + '\n' + endApplet);
    },

    /**
     * Returns true if there is a matching JRE version currently installed
     * (among those detected by getJREs()).  The versionPattern string is
     * of the form #[.#[.#[_#]]][+|*], which includes strings such as "1.4",
     * "1.5.0*", and "1.6.0_02+".
     * A star (*) means "any version within this family" and a plus (+) means
     * "any version greater or equal to the specified version".  "1.5.0*"
     * matches 1.5.0_06 but not 1.6.0_01, whereas "1.5.0+" matches both.
     *
     * If the versionPattern does not include all four version components
     * but does not end with a star or plus, it will be treated as if it
     * ended with a star.  "1.5" is exactly equivalent to "1.5*", and will
     * match any version number beginning with "1.5".
     *
     * If getJREs() is unable to detect the precise version number, a match
     * could be ambiguous.  For example if getJREs() detects "1.5", there is
     * no way to know whether the JRE matches "1.5.0_06+".  versionCheck()
     * compares only as much of the version information as could be detected,
     * so versionCheck("1.5.0_06+") would return true in in this case.
     *
     * Invalid versionPattern will result in a JavaScript error alert.
     * versionPatterns which are valid but do not match any existing JRE
     * release (e.g. "32.65+") will always return false.
     */
    versionCheck: function (versionPattern) {
      return doVersionCheck(versionPattern, isNoPluginWebBrowser());
    },

    /**
     * Returns true if an installation of Java Web Start of the specified
     * minimumVersion can be detected.  minimumVersion is optional, and
     * if not specified, '1.4.2' will be used.
     * (Versions earlier than 1.4.2 may not be detected.)
     */
    isWebStartInstalled: function (minimumVersion) {
      if (isNoPluginWebBrowser()) {
        return true;
      }
      var browser = this.getBrowser();
      if (browser == '?') {
        // we really don't know - better to try to use it than reinstall
        return true;
      }

      if (minimumVersion == 'undefined' || minimumVersion == null) {
        minimumVersion = '1.4.2';
      }

      var retval = false;
      var matchData = minimumVersion.match(version_regex_strict);
      if (matchData != null) {
        retval = this.versionCheck(minimumVersion + '+');
      } else {
        log(
          '[isWebStartInstaller()] Invalid minimumVersion argument to isWebStartInstalled(): ' +
            minimumVersion
        );
        retval = this.versionCheck('1.4.2+');
      }
      return retval;
    },

    // obtain JPI version using navigator.mimeTypes array
    // if found, set the version to this.firefoxJavaVersion
    getJPIVersionUsingMimeType: function () {
      var i, s, m;
      // Walk through the full list of mime types.
      // Try static MIME type first (for JRE versions earlier than JRE 9)
      for (i = 0; i < navigator.mimeTypes.length; ++i) {
        s = navigator.mimeTypes[i].type;
        m = s.match(/^application\/x-java-applet;jpi-version=(.*)$/);
        if (m != null) {
          this.firefoxJavaVersion = m[1];
          this.useStaticMimeType = true;
          return;
        }
      }

      for (i = 0; i < navigator.mimeTypes.length; ++i) {
        s = navigator.mimeTypes[i].type;
        m = s.match(/^application\/x-java-applet;version=(.*)$/);
        if (m != null) {
          if (
            this.firefoxJavaVersion == null ||
            this.compareVersions(m[1], this.firefoxJavaVersion)
          ) {
            this.firefoxJavaVersion = m[1];
          }
        }
      }
    },

    // launch the specified JNLP application using the passed in jnlp file
    // the jnlp file does not need to have a codebase
    // this requires JRE 7 or above to work
    // if machine has no JRE 7 or above, we will try to auto-install and then launch
    // (function will return false if JRE auto-install failed)
    launchWebStartApplication: function (jnlp) {
      this.getJPIVersionUsingMimeType();

      // make sure we are JRE 7 or above
      if (isWebStartFound() == false) {
        if (isNoPluginWebBrowser()) {
          launchWithJnlpProtocol(jnlp);
        } else if (this.installJRE('1.7.0+') == false || this.isWebStartInstalled('1.7.0') == false) {
          return false;
        }
      }

      var jnlpDocbase = null;

      // use document.documentURI for docbase
      if (document.documentURI) {
        jnlpDocbase = document.documentURI;
      }

      // fallback to document.URL if documentURI not available
      if (jnlpDocbase == null) {
        jnlpDocbase = document.URL;
      }

      var browser = this.getBrowser();

      var launchTag;

      if (browser == 'MSIE') {
        launchTag =
          '<' +
          'object classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" ' +
          'width="0" height="0">' +
          '<' +
          'PARAM name="launchjnlp" value="' +
          jnlp +
          '"' +
          '>' +
          '<' +
          'PARAM name="docbase" value="' +
          encodeURIComponent(jnlpDocbase) +
          '"' +
          '>' +
          '<' +
          '/' +
          'object' +
          '>';
      } else if (browser == 'Netscape Family') {
        launchTag =
          '<embed type="' +
          (this.useStaticMimeType
            ? 'application/x-java-applet;jpi-version='
            : 'application/x-java-applet;version=') +
          this.firefoxJavaVersion +
          '" ' +
          'width="0" height="0" ' +
          'launchjnlp="' +
          jnlp +
          '"' +
          'docbase="' +
          encodeURIComponent(jnlpDocbase) +
          '"' +
          ' />';
      }

      if (document.body == 'undefined' || document.body == null) {
        document.write(launchTag);
        // go back to original page, otherwise current page becomes blank
        document.location = jnlpDocbase;
      } else {
        var divTag = document.createElement('div');
        divTag.id = 'div1';
        divTag.style.position = 'relative';
        divTag.style.left = '-10000px';
        divTag.style.margin = '0px auto';
        divTag.className = 'dynamicDiv';
        divTag.innerHTML = launchTag;
        document.body.appendChild(divTag);
      }
    },

    createWebStartLaunchButtonEx: function (jnlp) {
      var url = "javascript:deployJava.launchWebStartApplication('" + jnlp + "');";

      document.write(
        '<' +
          'a href="' +
          url +
          '" onMouseOver="window.status=\'\'; ' +
          'return true;"><' +
          'img ' +
          'src="' +
          this.launchButtonPNG +
          '" ' +
          'border="0" /><' +
          '/' +
          'a' +
          '>'
      );
    },

    /**
     * Outputs a launch button for the specified JNLP URL.  When clicked, the
     * button will ensure that an appropriate JRE is installed and then launch
     * the JNLP application.  minimumVersion is of the form #[.#[.#[_#]]], and
     * is the minimum JRE version necessary to run this JNLP application.
     * minimumVersion is optional, and if it is not specified, '1.4.2'
     * will be used.
     * If an appropriate JRE or Web Start installation is detected,
     * the JNLP application will be launched, otherwise installLatestJRE()
     * will be called.
     *
     * After installLatestJRE() is called, the script will attempt to detect
     * that the JRE installation has completed and launch the JNLP application,
     * but there are circumstances (such as when the JRE installation
     * requires a browser restart) when this cannot be fulfilled.
     */
    createWebStartLaunchButton: function (jnlp, minimumVersion) {
      var url =
        'javascript:' +
        'if (!deployJava.isWebStartInstalled(&quot;' +
        minimumVersion +
        '&quot;)) {' +
        'if (deployJava.installLatestJRE()) {' +
        'if (deployJava.launch(&quot;' +
        jnlp +
        '&quot;)) {}' +
        '}' +
        '} else {' +
        'if (deployJava.launch(&quot;' +
        jnlp +
        '&quot;)) {}' +
        '}';

      document.write(
        '<' +
          'a href="' +
          url +
          '" onMouseOver="window.status=\'\'; ' +
          'return true;"><' +
          'img ' +
          'src="' +
          this.launchButtonPNG +
          '" ' +
          'border="0" /><' +
          '/' +
          'a' +
          '>'
      );
    },

    /**
     * Launch a JNLP application, (using the plugin if available)
     */
    launch: function (jnlp) {
      /*
       * Using the plugin to launch Java Web Start is disabled for the time being
       */
      document.location = jnlp;
      return true;
    },

    /**
     * Launch a JNLP application, using JNLP protocol handler
     */
    launchEx: function (jnlp) {
      launchWithJnlpProtocol(jnlp);
      return true;
    },

    /*
     * returns true if the ActiveX or XPI plugin is installed
     */
    isPluginInstalled: function () {
      var plugin = this.getPlugin();
      if (plugin && plugin.jvms) {
        return true;
      } else {
        return false;
      }
    },

    /*
     * returns true if the plugin is installed and AutoUpdate is enabled
     */
    isAutoUpdateEnabled: function () {
      if (this.isPluginInstalled()) {
        return this.getPlugin().isAutoUpdateEnabled();
      }
      return false;
    },

    /*
     * sets AutoUpdate on if plugin is installed
     */
    setAutoUpdateEnabled: function () {
      if (this.isPluginInstalled()) {
        return this.getPlugin().setAutoUpdateEnabled();
      }
      return false;
    },

    /*
     * sets the preferred install type : null, online, kernel
     */
    setInstallerType: function (_type) {
      log(
        'The Deployment Toolkit no longer installs JRE. Method setInstallerType() is no-op. ' +
          'More Information on usage of the Deployment Toolkit can be found in the Deployment Guide at ' +
          '://docs.oracle.com/javase/8/docs/technotes/guides/deploy/'
      );

      return false;
    },

    /*
     * sets additional package list - to be used by kernel installer
     */
    setAdditionalPackages: function (_packageList) {
      log(
        'The Deployment Toolkit no longer installs JRE. Method setAdditionalPackages() is no-op. ' +
          'More Information on usage of the Deployment Toolkit can be found in the Deployment Guide at ' +
          '://docs.oracle.com/javase/8/docs/technotes/guides/deploy/'
      );
      return false;
    },

    /*
     * sets preference to install Early Access versions if available
     */
    setEarlyAccess: function (enabled) {
      this.EAInstallEnabled = enabled;
    },

    /*
     * Determines if the next generation plugin (Plugin II) is default
     */
    isPlugin2: function () {
      if (this.isPluginInstalled()) {
        if (this.versionCheck('1.6.0_10+')) {
          try {
            return this.getPlugin().isPlugin2();
          } catch (err) {
            // older plugin w/o isPlugin2() function -
          }
        }
      }
      return false;
    },

    //support native DT plugin?
    allowPlugin: function () {
      this.getBrowser();

      // Safari and Opera browsers find the plugin but it
      // doesn't work, so until we can get it to work - don't use it.
      var ret = 'Safari' != this.browserName2 && 'Opera' != this.browserName2;

      return ret;
    },

    getPlugin: function () {
      this.refresh();

      var ret = null;
      if (this.allowPlugin()) {
        ret = document.getElementById('deployJavaPlugin');
      }
      return ret;
    },

    compareVersionToPattern: function (version, patternArray, familyMatch, minMatch) {
      if (version == undefined || patternArray == undefined) {
        return false;
      }
      var matchData = version.match(version_regex_strict);
      if (matchData != null) {
        var index = 0;
        var result = new Array();

        for (var i = 1; i < matchData.length; ++i) {
          if (typeof matchData[i] == 'string' && matchData[i] != '') {
            result[index] = matchData[i];
            index++;
          }
        }

        var l = Math.min(result.length, patternArray.length);

        // result contains what is installed in local machine
        // patternArray is what is being requested by application
        if (minMatch) {
          // minimum version match, return true if what we have (installed)
          // is greater or equal to what is requested.  false otherwise.
          for (var j = 0; j < l; ++j) {
            var resultTemp = parseInt(result[j]);
            var patternArrayTemp = parseInt(patternArray[j]);
            if (resultTemp < patternArrayTemp) {
              return false;
            } else if (resultTemp > patternArrayTemp) {
              return true;
            }
          }
          return true;
        } else {
          for (var k = 0; k < l; ++k) {
            if (result[k] != patternArray[k]) return false;
          }
          if (familyMatch) {
            // family match - return true as long as what we have
            // (installed) matches up to the request pattern
            return true;
          } else {
            // exact match
            // result and patternArray needs to have exact same content
            return result.length == patternArray.length;
          }
        }
      } else {
        return false;
      }
    },

    getBrowser: function () {
      if (this.browserName == null) {
        var browser = navigator.userAgent.toLowerCase();

        log('[getBrowser()] navigator.userAgent.toLowerCase() -> ' + browser);

        // order is important here.  Safari userAgent contains mozilla,
        // IE 11 userAgent contains mozilla and netscape,
        // and Chrome userAgent contains both mozilla and safari.
        if (browser.indexOf('edge') != -1) {
          this.browserName = 'Edge';
          this.browserName2 = 'Edge';
        } else if (browser.indexOf('msie') != -1 && browser.indexOf('opera') == -1) {
          this.browserName = 'MSIE';
          this.browserName2 = 'MSIE';
        } else if (browser.indexOf('trident') != -1 || browser.indexOf('Trident') != -1) {
          this.browserName = 'MSIE';
          this.browserName2 = 'MSIE';
          // For Windows 8 and Windows 8.1 check for Metro mode
          if (browser.indexOf('windows nt 6.3') != -1 || browser.indexOf('windows nt 6.2') != -1) {
            try {
              // try to create a known ActiveX object
              new ActiveXObject('htmlfile');
            } catch (e) {
              // ActiveX is disabled
              this.browserName2 = 'NoActiveX';
            }
          }
        } else if (browser.indexOf('iphone') != -1) {
          // this included both iPhone and iPad
          this.browserName = 'Netscape Family';
          this.browserName2 = 'iPhone';
        } else if (browser.indexOf('firefox') != -1 && browser.indexOf('opera') == -1) {
          this.browserName = 'Netscape Family';
          if (this.isPluginInstalled()) {
            this.browserName2 = 'Firefox';
          } else {
            this.browserName2 = 'FirefoxNoPlugin';
          }
        } else if (browser.indexOf('chrome') != -1) {
          this.browserName = 'Netscape Family';
          this.browserName2 = 'Chrome';
        } else if (browser.indexOf('safari') != -1) {
          this.browserName = 'Netscape Family';
          this.browserName2 = 'Safari';
        } else if (browser.indexOf('mozilla') != -1 && browser.indexOf('opera') == -1) {
          this.browserName = 'Netscape Family';
          this.browserName2 = 'Other';
        } else if (browser.indexOf('opera') != -1) {
          this.browserName = 'Netscape Family';
          this.browserName2 = 'Opera';
        } else {
          this.browserName = '?';
          this.browserName2 = 'unknown';
        }

        log('[getBrowser()] Detected browser name:' + this.browserName + ', ' + this.browserName2);
      }
      return this.browserName;
    },

    testUsingActiveX: function (version) {
      var objectName = 'JavaWebStart.isInstalled.' + version + '.0';

      // we need the typeof check here for this to run on FF/Chrome
      // the check needs to be in place here - cannot even pass ActiveXObject
      // as arg to another function
      if (typeof ActiveXObject == 'undefined' || !ActiveXObject) {
        log('[testUsingActiveX()] Browser claims to be IE, but no ActiveXObject object?');
        return false;
      }

      try {
        return new ActiveXObject(objectName) != null;
      } catch (exception) {
        return false;
      }
    },

    testForMSVM: function () {
      var clsid = '{08B0E5C0-4FCB-11CF-AAA5-00401C608500}';

      if (typeof oClientCaps != 'undefined') {
        var v = oClientCaps.getComponentVersion(clsid, 'ComponentID');
        if (v == '' || v == '5,0,5000,0') {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },

    testUsingMimeTypes: function (version) {
      if (!navigator.mimeTypes) {
        log('[testUsingMimeTypes()] Browser claims to be Netscape family, but no mimeTypes[] array?');
        return false;
      }

      for (var i = 0; i < navigator.mimeTypes.length; ++i) {
        var s = navigator.mimeTypes[i].type;
        var m = s.match(/^application\/x-java-applet\x3Bversion=(1\.8|1\.7|1\.6|1\.5|1\.4\.2)$/);
        if (m != null) {
          if (this.compareVersions(m[1], version)) {
            return true;
          }
        }
      }
      return false;
    },

    testUsingPluginsArray: function (version) {
      if (!navigator.plugins || !navigator.plugins.length) {
        return false;
      }
      var platform = navigator.platform.toLowerCase();

      for (var i = 0; i < navigator.plugins.length; ++i) {
        var s = navigator.plugins[i].description;
        if (s.search(/^Java Switchable Plug-in (Cocoa)/) != -1) {
          // Safari on MAC
          if (this.compareVersions('1.5.0', version)) {
            return true;
          }
        } else if (s.search(/^Java/) != -1) {
          if (platform.indexOf('win') != -1) {
            // still can't tell - opera, safari on windows
            // return true for 1.5.0 and 1.6.0
            if (this.compareVersions('1.5.0', version) || this.compareVersions('1.6.0', version)) {
              return true;
            }
          }
        }
      }
      // if above dosn't work on Apple or Windows, just allow 1.5.0
      if (this.compareVersions('1.5.0', version)) {
        return true;
      }
      return false;
    },

    IEInstall: function () {
      location.href = constructGetJavaURL(
        (this.locale != null ? '&locale=' + this.locale : '') +
          (this.brand != null ? '&brand=' + this.brand : '')
      );

      // should not actually get here
      return false;
    },

    done: function (_name, _result) {},

    FFInstall: function () {
      location.href = constructGetJavaURL(
        (this.locale != null ? '&locale=' + this.locale : '') +
          (this.brand != null ? '&brand=' + this.brand : '') +
          (this.installType != null ? '&type=' + this.installType : '')
      );

      // should not actually get here
      return false;
    },

    // return true if 'installed' (considered as a JRE version string) is
    // greater than or equal to 'required' (again, a JRE version string).
    compareVersions: function (installed, required) {
      var a = installed.split('.');
      var b = required.split('.');

      for (var i = 0; i < a.length; ++i) {
        a[i] = Number(a[i]);
      }
      for (var j = 0; j < b.length; ++j) {
        b[j] = Number(b[j]);
      }
      if (a.length == 2) {
        a[2] = 0;
      }

      if (a[0] > b[0]) return true;
      if (a[0] < b[0]) return false;

      if (a[1] > b[1]) return true;
      if (a[1] < b[1]) return false;

      if (a[2] > b[2]) return true;
      if (a[2] < b[2]) return false;

      return true;
    },

    enableAlerts: function () {
      // reset this so we can show the browser detection
      this.browserName = null;
      this.debug = true;
    },

    poll: function () {
      this.refresh();
      var postInstallJREList = this.getJREs();

      if (this.preInstallJREList.length == 0 && postInstallJREList.length != 0) {
        clearInterval(this.myInterval);
      }

      if (
        this.preInstallJREList.length != 0 &&
        postInstallJREList.length != 0 &&
        this.preInstallJREList[0] != postInstallJREList[0]
      ) {
        clearInterval(this.myInterval);
      }
    },

    writePluginTag: function () {
      var browser = this.getBrowser();

      if (browser == 'MSIE') {
        document.write(
          '<' +
            'object classid="clsid:CAFEEFAC-DEC7-0000-0001-ABCDEFFEDCBA" ' +
            'id="deployJavaPlugin" width="0" height="0">' +
            '<' +
            '/' +
            'object' +
            '>'
        );
      } else if (browser == 'Netscape Family' && this.allowPlugin()) {
        this.writeEmbedTag();
      }
    },

    refresh: function () {
      navigator.plugins.refresh(false);

      var browser = this.getBrowser();
      if (browser == 'Netscape Family' && this.allowPlugin()) {
        var plugin = document.getElementById('deployJavaPlugin');
        // only do this again if no plugin
        if (plugin == null) {
          this.writeEmbedTag();
        }
      }
    },

    writeEmbedTag: function () {
      var written = false;
      if (navigator.mimeTypes != null) {
        for (var i = 0; i < navigator.mimeTypes.length; i++) {
          if (navigator.mimeTypes[i].type == this.mimeType) {
            if (navigator.mimeTypes[i].enabledPlugin) {
              document.write(
                '<' + 'embed id="deployJavaPlugin" type="' + this.mimeType + '" hidden="true" />'
              );
              written = true;
            }
          }
        }
        // if we ddn't find new mimeType, look for old mimeType
        if (!written)
          for (var j = 0; j < navigator.mimeTypes.length; j++) {
            if (navigator.mimeTypes[j].type == this.oldMimeType) {
              if (navigator.mimeTypes[j].enabledPlugin) {
                document.write(
                  '<' + 'embed id="deployJavaPlugin" type="' + this.oldMimeType + '" hidden="true" />'
                );
              }
            }
          }
      }
    },
  }; // deployJava object

  deployJava$1.writePluginTag();
  if (deployJava$1.locale == null) {
    var loc = null;

    if (loc == null)
      try {
        loc = navigator.userLanguage;
      } catch (err) {
        // ignore error
      }

    if (loc == null)
      try {
        loc = navigator.systemLanguage;
      } catch (err) {
        // ignore error
      }

    if (loc == null)
      try {
        loc = navigator.language;
      } catch (err) {
        // ignore error
      }

    if (loc != null) {
      loc.replace('-', '_');
      deployJava$1.locale = loc;
    }
  }

  var deployJava_1 = deployJava$1;

  var deployJava = deployJava_1;

  // Get Java Version.  Return a string containing the Java Version.
  var javaDetection = function getJavaVersion() {
    return deployJava.getJREs().toString();
  };

  /*!    SWFObject v2.3.20130521 <http://github.com/swfobject/swfobject>
      is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
  */

  /* global ActiveXObject: false */
  /* eslint-disable strict */

  var UNDEF = "undefined",
      OBJECT = "object",
      SHOCKWAVE_FLASH = "Shockwave Flash",
      SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
      FLASH_MIME_TYPE = "application/x-shockwave-flash",
      EXPRESS_INSTALL_ID = "SWFObjectExprInst",
      ON_READY_STATE_CHANGE = "onreadystatechange",

      win = window,
      doc = document,
      nav = navigator,

      plugin = false,
      domLoadFnArr = [],
      regObjArr = [],
      objIdArr = [],
      listenersArr = [],
      storedFbContent,
      storedFbContentId,
      storedCallbackFn,
      storedCallbackObj,
      isDomLoaded = false,
      isExpressInstallActive = false,
      dynamicStylesheet,
      dynamicStylesheetMedia,
      autoHideShow = true,
      encodeURIEnabled = false,

  /* Centralized function for browser feature detection
      - User agent string detection is only used when no good alternative is possible
      - Is executed directly for optimal performance
  */
  ua = function () {
      var w3cdom = typeof doc.getElementById !== UNDEF && typeof doc.getElementsByTagName !== UNDEF && typeof doc.createElement !== UNDEF,
          u = nav.userAgent.toLowerCase(),
          p = nav.platform.toLowerCase(),
          windows = p ? /win/.test(p) : /win/.test(u),
          mac = p ? /mac/.test(p) : /mac/.test(u),
          webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
          ie = nav.appName === "Microsoft Internet Explorer",
          playerVersion = [0, 0, 0],
          d = null;
      if (typeof nav.plugins !== UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] === OBJECT) {
          d = nav.plugins[SHOCKWAVE_FLASH].description;
          // nav.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
          if (d && (typeof nav.mimeTypes !== UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {
              plugin = true;
              ie = false; // cascaded feature detection for Internet Explorer
              d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
              playerVersion[0] = toInt(d.replace(/^(.*)\..*$/, "$1"));
              playerVersion[1] = toInt(d.replace(/^.*\.(.*)\s.*$/, "$1"));
              playerVersion[2] = /[a-zA-Z]/.test(d) ? toInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1")) : 0;
          }
      }
      else if (typeof win.ActiveXObject !== UNDEF) {
          try {
              var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
              if (a) { // a will return null when ActiveX is disabled
                  d = a.GetVariable("$version");
                  if (d) {
                      ie = true; // cascaded feature detection for Internet Explorer
                      d = d.split(" ")[1].split(",");
                      playerVersion = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                  }
              }
          }
          catch (e) {
              // ignore error
          }
      }
      return {w3: w3cdom, pv: playerVersion, wk: webkit, ie: ie, win: windows, mac: mac};
  }();

  /* Cross-browser onDomLoad
      - Will fire an event as soon as the DOM of a web page is loaded
      - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
      - Regular onload serves as fallback
  */
  (function () {
      if (!ua.w3) { return; }
      if ((typeof doc.readyState !== UNDEF && (doc.readyState === "complete" || doc.readyState === "interactive")) || (typeof doc.readyState === UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically
          callDomLoadFunctions();
      }
      if (!isDomLoaded) {
          if (typeof doc.addEventListener !== UNDEF) {
              doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
          }
          if (ua.ie) {
              doc.attachEvent(ON_READY_STATE_CHANGE, function detach() {
                  if (doc.readyState === "complete") {
                      doc.detachEvent(ON_READY_STATE_CHANGE, detach);
                      callDomLoadFunctions();
                  }
              });
              if (win == top) { // if not inside an iframe
                  (function checkDomLoadedIE() {
                      if (isDomLoaded) { return; }
                      try {
                          doc.documentElement.doScroll("left");
                      }
                      catch (e) {
                          setTimeout(checkDomLoadedIE, 0);
                          return;
                      }
                      callDomLoadFunctions();
                  }());
              }
          }
          if (ua.wk) {
              (function checkDomLoadedWK() {
                  if (isDomLoaded) { return; }
                  if (!/loaded|complete/.test(doc.readyState)) {
                      setTimeout(checkDomLoadedWK, 0);
                      return;
                  }
                  callDomLoadFunctions();
              }());
          }
      }
  }());

  function callDomLoadFunctions() {
      if (isDomLoaded || !document.getElementsByTagName("body")[0]) { return; }
      try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
          var t, span = createElement("span");
          span.style.display = "none"; //hide the span in case someone has styled spans via CSS
          t = doc.getElementsByTagName("body")[0].appendChild(span);
          t.parentNode.removeChild(t);
          t = null; //clear the variables
          span = null;
      }
      catch (e) { return; }
      isDomLoaded = true;
      var dl = domLoadFnArr.length;
      for (var i = 0; i < dl; i++) {
          domLoadFnArr[i]();
      }
  }

  function addDomLoadEvent(fn) {
      if (isDomLoaded) {
          fn();
      }
      else {
          domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
      }
  }

  /* Cross-browser onload
      - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
      - Will fire an event as soon as a web page including all of its assets are loaded
      */
  function addLoadEvent(fn) {
      if (typeof win.addEventListener !== UNDEF) {
          win.addEventListener("load", fn, false);
      }
      else if (typeof doc.addEventListener !== UNDEF) {
          doc.addEventListener("load", fn, false);
      }
      else if (typeof win.attachEvent !== UNDEF) {
          addListener(win, "onload", fn);
      }
      else if (typeof win.onload === "function") {
          var fnOld = win.onload;
          win.onload = function () {
              fnOld();
              fn();
          };
      }
      else {
          win.onload = fn;
      }
  }

  /* Detect the Flash Player version for non-Internet Explorer browsers
      - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
          a. Both release and build numbers can be detected
          b. Avoid wrong descriptions by corrupt installers provided by Adobe
          c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
      - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
  */
  function testPlayerVersion() {
      var b = doc.getElementsByTagName("body")[0];
      var o = createElement(OBJECT);
      o.setAttribute("style", "visibility: hidden;");
      o.setAttribute("type", FLASH_MIME_TYPE);
      var t = b.appendChild(o);
      if (t) {
          var counter = 0;
          (function checkGetVariable() {
              if (typeof t.GetVariable !== UNDEF) {
                  try {
                      var d = t.GetVariable("$version");
                      if (d) {
                          d = d.split(" ")[1].split(",");
                          ua.pv = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                      }
                  } catch (e) {
                      //t.GetVariable("$version") is known to fail in Flash Player 8 on Firefox
                      //If this error is encountered, assume FP8 or lower. Time to upgrade.
                      ua.pv = [8, 0, 0];
                  }
              }
              else if (counter < 10) {
                  counter++;
                  setTimeout(checkGetVariable, 10);
                  return;
              }
              b.removeChild(o);
              t = null;
              matchVersions();
          }());
      }
      else {
          matchVersions();
      }
  }

  /* Perform Flash Player and SWF version matching; static publishing only
  */
  function matchVersions() {
      var rl = regObjArr.length;
      if (rl > 0) {
          for (var i = 0; i < rl; i++) { // for each registered object element
              var id = regObjArr[i].id;
              var cb = regObjArr[i].callbackFn;
              var cbObj = {success: false, id: id};
              if (ua.pv[0] > 0) {
                  var obj = getElementById(id);
                  if (obj) {
                      if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                          setVisibility(id, true);
                          if (cb) {
                              cbObj.success = true;
                              cbObj.ref = getObjectById(id);
                              cbObj.id = id;
                              cb(cbObj);
                          }
                      }
                      else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                          var att = {};
                          att.data = regObjArr[i].expressInstall;
                          att.width = obj.getAttribute("width") || "0";
                          att.height = obj.getAttribute("height") || "0";
                          if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
                          if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
                          // parse HTML object param element's name-value pairs
                          var par = {};
                          var p = obj.getElementsByTagName("param");
                          var pl = p.length;
                          for (var j = 0; j < pl; j++) {
                              if (p[j].getAttribute("name").toLowerCase() !== "movie") {
                                  par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                              }
                          }
                          showExpressInstall(att, par, id, cb);
                      }
                      else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display fallback content instead of SWF
                          displayFbContent(obj);
                          if (cb) { cb(cbObj); }
                      }
                  }
              }
              else { // if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or fallback content)
                  setVisibility(id, true);
                  if (cb) {
                      var o = getObjectById(id); // test whether there is an HTML object element or not
                      if (o && typeof o.SetVariable !== UNDEF) {
                          cbObj.success = true;
                          cbObj.ref = o;
                          cbObj.id = o.id;
                      }
                      cb(cbObj);
                  }
              }
          }
      }
  }

  /* Main function
      - Will preferably execute onDomLoad, otherwise onload (as a fallback)
  */
  domLoadFnArr[0] = function () {
      if (plugin) {
          testPlayerVersion();
      }
      else {
          matchVersions();
      }
  };

  function getObjectById(objectIdStr) {
      var r = null,
          o = getElementById(objectIdStr);

      if (o && o.nodeName.toUpperCase() === "OBJECT") {
          //If targeted object is valid Flash file
          if (typeof o.SetVariable !== UNDEF) {
              r = o;
          } else {
              //If SetVariable is not working on targeted object but a nested object is
              //available, assume classic nested object markup. Return nested object.

              //If SetVariable is not working on targeted object and there is no nested object,
              //return the original object anyway. This is probably new simplified markup.

              r = o.getElementsByTagName(OBJECT)[0] || o;
          }
      }

      return r;
  }

  /* Requirements for Adobe Express Install
      - only one instance can be active at a time
      - fp 6.0.65 or higher
      - Win/Mac OS only
      - no Webkit engines older than version 312
  */
  function canExpressInstall() {
      return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
  }

  /* Show the Adobe Express Install dialog
      - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
  */
  function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {

      var obj = getElementById(replaceElemIdStr);

      //Ensure that replaceElemIdStr is really a string and not an element
      replaceElemIdStr = getId(replaceElemIdStr);

      isExpressInstallActive = true;
      storedCallbackFn = callbackFn || null;
      storedCallbackObj = {success: false, id: replaceElemIdStr};

      if (obj) {
          if (obj.nodeName.toUpperCase() === "OBJECT") { // static publishing
              storedFbContent = abstractFbContent(obj);
              storedFbContentId = null;
          }
          else { // dynamic publishing
              storedFbContent = obj;
              storedFbContentId = replaceElemIdStr;
          }
          att.id = EXPRESS_INSTALL_ID;
          if (typeof att.width === UNDEF || (!/%$/.test(att.width) && toInt(att.width) < 310)) { att.width = "310"; }
          if (typeof att.height === UNDEF || (!/%$/.test(att.height) && toInt(att.height) < 137)) { att.height = "137"; }
          var pt = ua.ie ? "ActiveX" : "PlugIn",
              fv = "MMredirectURL=" + encodeURIComponent(win.location.toString().replace(/&/g, "%26")) + "&MMplayerType=" + pt + "&MMdoctitle=" + encodeURIComponent(doc.title.slice(0, 47) + " - Flash Player Installation");
          if (typeof par.flashvars !== UNDEF) {
              par.flashvars += "&" + fv;
          }
          else {
              par.flashvars = fv;
          }
          // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
          // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
          if (ua.ie && obj.readyState != 4) {
              var newObj = createElement("div");
              replaceElemIdStr += "SWFObjectNew";
              newObj.setAttribute("id", replaceElemIdStr);
              obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
              obj.style.display = "none";
              removeSWF(obj); //removeSWF accepts elements now
          }
          createSWF(att, par, replaceElemIdStr);
      }
  }

  /* Functions to abstract and display fallback content
  */
  function displayFbContent(obj) {
      if (ua.ie && obj.readyState != 4) {
          // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
          // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
          obj.style.display = "none";
          var el = createElement("div");
          obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the fallback content
          el.parentNode.replaceChild(abstractFbContent(obj), el);
          removeSWF(obj); //removeSWF accepts elements now
      }
      else {
          obj.parentNode.replaceChild(abstractFbContent(obj), obj);
      }
  }

  function abstractFbContent(obj) {
      var ac = createElement("div");
      if (ua.win && ua.ie) {
          ac.innerHTML = obj.innerHTML;
      }
      else {
          var nestedObj = obj.getElementsByTagName(OBJECT)[0];
          if (nestedObj) {
              var c = nestedObj.childNodes;
              if (c) {
                  var cl = c.length;
                  for (var i = 0; i < cl; i++) {
                      if (!(c[i].nodeType == 1 && c[i].nodeName === "PARAM") && !(c[i].nodeType == 8)) {
                          ac.appendChild(c[i].cloneNode(true));
                      }
                  }
              }
          }
      }
      return ac;
  }

  function createIeObject(url, paramStr) {
      var div = createElement("div");
      div.innerHTML = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='" + url + "'>" + paramStr + "</object>";
      return div.firstChild;
  }

  /* Cross-browser dynamic SWF creation
  */
  function createSWF(attObj, parObj, id) {
      var r, el = getElementById(id);
      id = getId(id); // ensure id is truly an ID and not an element

      if (ua.wk && ua.wk < 312) { return r; }

      if (el) {
          var o = (ua.ie) ? createElement("div") : createElement(OBJECT),
              attr,
              attrLower,
              param;

          if (typeof attObj.id === UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the fallback content
              attObj.id = id;
          }

          //Add params
          for (param in parObj) {
              //filter out prototype additions from other potential libraries and IE specific param element
              if (Object.prototype.hasOwnProperty.call(parObj, param) && param.toLowerCase() !== "movie") {
                  createObjParam(o, param, parObj[param]);
              }
          }

          //Create IE object, complete with param nodes
          if (ua.ie) { o = createIeObject(attObj.data, o.innerHTML); }

          //Add attributes to object
          for (attr in attObj) {
              if (Object.prototype.hasOwnProperty.call(attObj, attr)) { // filter out prototype additions from other potential libraries
                  attrLower = attr.toLowerCase();

                  // 'class' is an ECMA4 reserved keyword
                  if (attrLower === "styleclass") {
                      o.setAttribute("class", attObj[attr]);
                  } else if (attrLower !== "classid" && attrLower !== "data") {
                      o.setAttribute(attr, attObj[attr]);
                  }
              }
          }

          if (ua.ie) {
              objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
          } else {
              o.setAttribute("type", FLASH_MIME_TYPE);
              o.setAttribute("data", attObj.data);
          }

          el.parentNode.replaceChild(o, el);
          r = o;
      }

      return r;
  }

  function createObjParam(el, pName, pValue) {
      var p = createElement("param");
      p.setAttribute("name", pName);
      p.setAttribute("value", pValue);
      el.appendChild(p);
  }

  /* Cross-browser SWF removal
      - Especially needed to safely and completely remove a SWF in Internet Explorer
  */
  function removeSWF(id) {
      var obj = getElementById(id);
      if (obj && obj.nodeName.toUpperCase() === "OBJECT") {
          if (ua.ie) {
              obj.style.display = "none";
              (function removeSWFInIE() {
                  if (obj.readyState == 4) {
                      //This step prevents memory leaks in Internet Explorer
                      for (var i in obj) {
                          if (typeof obj[i] === "function") {
                              obj[i] = null;
                          }
                      }
                      obj.parentNode.removeChild(obj);
                  } else {
                      setTimeout(removeSWFInIE, 10);
                  }
              }());
          }
          else {
              obj.parentNode.removeChild(obj);
          }
      }
  }

  function isElement(id) {
      return (id && id.nodeType && id.nodeType === 1);
  }

  function getId(thing) {
      return (isElement(thing)) ? thing.id : thing;
  }

  /* Functions to optimize JavaScript compression
  */
  function getElementById(id) {

      //Allow users to pass an element OR an element's ID
      if (isElement(id)) { return id; }

      var el = null;
      try {
          el = doc.getElementById(id);
      }
      catch (e) {
          // ignore error
      }
      return el;
  }

  function createElement(el) {
      return doc.createElement(el);
  }

  //To aid compression; replaces 14 instances of pareseInt with radix
  function toInt(str) {
      return parseInt(str, 10);
  }

  /* Updated attachEvent function for Internet Explorer
      - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
  */
  function addListener(target, eventType, fn) {
      target.attachEvent(eventType, fn);
      listenersArr[listenersArr.length] = [target, eventType, fn];
  }

  /* Flash Player and SWF content version matching
  */
  function hasPlayerVersion(rv) {
      rv += ""; //Coerce number to string, if needed.
      var pv = ua.pv, v = rv.split(".");
      v[0] = toInt(v[0]);
      v[1] = toInt(v[1]) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
      v[2] = toInt(v[2]) || 0;
      return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
  }

  /* Cross-browser dynamic CSS creation
      - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
  */
  function createCSS(sel, decl, media, newStyle) {
      var h = doc.getElementsByTagName("head")[0];
      if (!h) { return; } // to also support badly authored HTML pages that lack a head element
      var m = (typeof media === "string") ? media : "screen";
      if (newStyle) {
          dynamicStylesheet = null;
          dynamicStylesheetMedia = null;
      }
      if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
          // create dynamic stylesheet + get a global reference to it
          var s = createElement("style");
          s.setAttribute("type", "text/css");
          s.setAttribute("media", m);
          dynamicStylesheet = h.appendChild(s);
          if (ua.ie && typeof doc.styleSheets !== UNDEF && doc.styleSheets.length > 0) {
              dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
          }
          dynamicStylesheetMedia = m;
      }
      // add style rule
      if (dynamicStylesheet) {
          if (typeof dynamicStylesheet.addRule !== UNDEF) {
              dynamicStylesheet.addRule(sel, decl);
          } else if (typeof doc.createTextNode !== UNDEF) {
              dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
          }
      }
  }

  function setVisibility(id, isVisible) {
      if (!autoHideShow) { return; }
      var v = isVisible ? "visible" : "hidden",
          el = getElementById(id);
      if (isDomLoaded && el) {
          el.style.visibility = v;
      } else if (typeof id === "string") {
          createCSS("#" + id, "visibility:" + v);
      }
  }

  /* Filter to avoid XSS attacks
  */
  function urlEncodeIfNecessary(s) {
      var regex = /[\\"<>.;]/;
      var hasBadChars = regex.exec(s) !== null;
      return hasBadChars && typeof encodeURIComponent !== UNDEF ? encodeURIComponent(s) : s;
  }

  /* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
  */
  (function () {
      if (ua.ie) {
          window.attachEvent("onunload", function () {
              // remove listeners to avoid memory leaks
              var ll = listenersArr.length;
              for (var i = 0; i < ll; i++) {
                  listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
              }
              // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
              var il = objIdArr.length;
              for (var j = 0; j < il; j++) {
                  removeSWF(objIdArr[j]);
              }
              // cleanup library's main closures to avoid memory leaks
              for (var k in ua) {
                  ua[k] = null;
              }
              ua = null;
              for (var l in swfobject$1) {
                  swfobject$1[l] = null;
              }
              swfobject$1 = null;
          });
      }
  }());

  var swfobject$1 = {
      /* Public API
          - Reference: http://code.google.com/p/swfobject/wiki/documentation
      */
      registerObject: function (objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
          if (ua.w3 && objectIdStr && swfVersionStr) {
              var regObj = {};
              regObj.id = objectIdStr;
              regObj.swfVersion = swfVersionStr;
              regObj.expressInstall = xiSwfUrlStr;
              regObj.callbackFn = callbackFn;
              regObjArr[regObjArr.length] = regObj;
              setVisibility(objectIdStr, false);
          }
          else if (callbackFn) {
              callbackFn({success: false, id: objectIdStr});
          }
      },

      getObjectById: function (objectIdStr) {
          if (ua.w3) {
              return getObjectById(objectIdStr);
          }
      },

      embedSWF: function (swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {

          var id = getId(replaceElemIdStr),
              callbackObj = {success: false, id: id};

          if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
              setVisibility(id, false);
              addDomLoadEvent(function () {
                  widthStr += ""; // auto-convert to string
                  heightStr += "";
                  var att = {};
                  if (attObj && typeof attObj === OBJECT) {
                      for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                          att[i] = attObj[i];
                      }
                  }
                  att.data = swfUrlStr;
                  att.width = widthStr;
                  att.height = heightStr;
                  var par = {};
                  if (parObj && typeof parObj === OBJECT) {
                      for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                          par[j] = parObj[j];
                      }
                  }
                  if (flashvarsObj && typeof flashvarsObj === OBJECT) {
                      for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                          if (Object.prototype.hasOwnProperty.call(flashvarsObj, k)) {

                              var key = (encodeURIEnabled) ? encodeURIComponent(k) : k,
                                  value = (encodeURIEnabled) ? encodeURIComponent(flashvarsObj[k]) : flashvarsObj[k];

                              if (typeof par.flashvars !== UNDEF) {
                                  par.flashvars += "&" + key + "=" + value;
                              }
                              else {
                                  par.flashvars = key + "=" + value;
                              }

                          }
                      }
                  }
                  if (hasPlayerVersion(swfVersionStr)) { // create SWF
                      var obj = createSWF(att, par, replaceElemIdStr);
                      if (att.id == id) {
                          setVisibility(id, true);
                      }
                      callbackObj.success = true;
                      callbackObj.ref = obj;
                      callbackObj.id = obj.id;
                  }
                  else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
                      att.data = xiSwfUrlStr;
                      showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                      return;
                  }
                  else { // show fallback content
                      setVisibility(id, true);
                  }
                  if (callbackFn) { callbackFn(callbackObj); }
              });
          }
          else if (callbackFn) { callbackFn(callbackObj); }
      },

      switchOffAutoHideShow: function () {
          autoHideShow = false;
      },

      enableUriEncoding: function (bool) {
          encodeURIEnabled = (typeof bool === UNDEF) ? true : bool;
      },

      ua: ua,

      getFlashPlayerVersion: function () {
          return {major: ua.pv[0], minor: ua.pv[1], release: ua.pv[2]};
      },

      hasFlashPlayerVersion: hasPlayerVersion,

      createSWF: function (attObj, parObj, replaceElemIdStr) {
          if (ua.w3) {
              return createSWF(attObj, parObj, replaceElemIdStr);
          }
          else {
              return undefined;
          }
      },

      showExpressInstall: function (att, par, replaceElemIdStr, callbackFn) {
          if (ua.w3 && canExpressInstall()) {
              showExpressInstall(att, par, replaceElemIdStr, callbackFn);
          }
      },

      removeSWF: function (objElemIdStr) {
          if (ua.w3) {
              removeSWF(objElemIdStr);
          }
      },

      createCSS: function (selStr, declStr, mediaStr, newStyleBoolean) {
          if (ua.w3) {
              createCSS(selStr, declStr, mediaStr, newStyleBoolean);
          }
      },

      addDomLoadEvent: addDomLoadEvent,

      addLoadEvent: addLoadEvent,

      getQueryParamValue: function (param) {
          var q = doc.location.search || doc.location.hash;
          if (q) {
              if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
              if (!param) {
                  return urlEncodeIfNecessary(q);
              }
              var pairs = q.split("&");
              for (var i = 0; i < pairs.length; i++) {
                  if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                      return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
                  }
              }
          }
          return "";
      },

      // For internal usage only
      expressInstallCallback: function () {
          if (isExpressInstallActive) {
              var obj = getElementById(EXPRESS_INSTALL_ID);
              if (obj && storedFbContent) {
                  obj.parentNode.replaceChild(storedFbContent, obj);
                  if (storedFbContentId) {
                      setVisibility(storedFbContentId, true);
                      if (ua.ie) { storedFbContent.style.display = "block"; }
                  }
                  if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
              }
              isExpressInstallActive = false;
          }
      },

      version: "2.3"
  };

  var swfobject_1 = swfobject$1;

  var swfobject = swfobject_1;

  // Get Flash Version. Return a string containing the Flash Version.
  var flashDetection = function getFlashVersion() {
    if (this.isFlash()) {
      var objPlayerVersion = swfobject.getFlashPlayerVersion();
      return objPlayerVersion.major + '.' + objPlayerVersion.minor + '.' + objPlayerVersion.release;
    }
    return '';
  };

  var inherits = inheritsExports;
  var ClientJS = client_base.ClientJS;
  var getJavaVersion = javaDetection;
  var getFlashVersion = flashDetection;

  function ClientJSFull() {
    ClientJS.apply(this, arguments);
  }
  inherits(ClientJSFull, ClientJS);

  ClientJSFull.prototype.getJavaVersion = getJavaVersion;
  ClientJSFull.prototype.getFlashVersion = getFlashVersion;

  var ClientJS_1 = ClientJSFull;

  class DeviceDetails { 
    static all() {
      return {
        device_fingerprint: this.deviceFingerprint(),
        user_agent: this.userAgent(),
        browser_name: this.browser(),
        browser_version: this.browserVersion(),
        os: this.os(),
        os_version: this.osVersion(),
        device: this.device(),
        device_type: this.deviceType(),
        timezone: this.timeZone(),
        language: this.language(),
        is_mobile: this.isMobile(),
      }
    }

    static deviceFingerprint = () => this._clientJS().getFingerprint();
    static userAgent = () => this._clientJS().getUserAgent();
    static browser = () => this._clientJS().getBrowser();
    static browserVersion = () => this._clientJS().getBrowserVersion();
    static os = () => this._clientJS().getOS();
    static osVersion = () => this._clientJS().getOSVersion();
    static device = () => this._clientJS().getDevice();
    static deviceType = () => this._clientJS().getDeviceType();
    static timeZone = () => this._clientJS().getTimeZone();
    static language = () => this._clientJS().getLanguage();
    static isMobile = () => this._clientJS().isMobile();

    static _clientJS = () => {
      if(this._clientJSInstance) return this._clientJSInstance;
      this._clientJSInstance = new ClientJS_1();
      return this._clientJSInstance;
    }
  }

  var version = "0.0.126";
  var name = "@swishjam/core";
  var description = "The official Swishjam JS client to instrument your webpages with.";
  var homepage = "https://swishjam.com";
  var repository = {
  	type: "git",
  	url: "https://github.com/swishjam/swishjam/tree/main/sdk/client/npm"
  };
  var main = "src/swishjam.mjs";
  var scripts = {
  };
  var author = "";
  var license = "ISC";
  var devDependencies = {
  	jest: "^29.6.2",
  	"jest-environment-jsdom": "^29.6.2"
  };
  var dependencies = {
  	"@swishjam/clientjs": "^0.2.1"
  };
  var packageJson = {
  	version: version,
  	name: name,
  	description: description,
  	homepage: homepage,
  	repository: repository,
  	main: main,
  	scripts: scripts,
  	author: author,
  	license: license,
  	devDependencies: devDependencies,
  	dependencies: dependencies
  };

  const { version: SDK_VERSION } = packageJson;

  class Event {
    constructor(eventName, data) {
      this.eventName = eventName;
      this.uuid = UUID.generate(`e-${Date.now()}`);
      this.ts = Date.now();
      this.sessionId = DataPersister.get('sessionId');
      this.pageViewId = DataPersister.get('pageViewId');
      this.fingerprint = DeviceDetails.deviceFingerprint();
      this.url = window.location.href;
      this.data = data;
    }

    toJSON() {
      return {
        uuid: this.uuid,
        event: this.eventName,
        timestamp: this.ts,
        device_identifier: this.fingerprint,
        session_identifier: this.sessionId,
        page_view_identifier: this.pageViewId,
        url: this.url,
        device_fingerprint: this.fingerprint,
        source: 'web',
        ...this.data,
        sdk_version: SDK_VERSION,
      }
    }
  }

  class EventManager {
    constructor(options = {}) {
      this.data = [];
      this.numFailedReports = 0;

      this.apiEndpoint = options.apiEndpoint;
      this.apiKey = options.apiKey;
      this.maxSize = options.maxSize || 20;
      this.heartbeatMs = options.heartbeatMs || 10_000;
      this.maxNumFailedReports = options.maxNumFailedReports || 3;
      
      this._initHeartbeat();
    }

    getData = () => this.data;

    recordEvent = async (eventName, properties) => {
      const event = new Event(eventName, properties);
      this.data.push(event.toJSON());
      if (this.data.length >= this.maxSize) {
        await this._reportDataIfNecessary();
      }
      return event;
    }

    flushQueue = async () => {
      return await this._reportDataIfNecessary();
    }

    _initHeartbeat = () => {
      setInterval(async () => {
        await this._reportDataIfNecessary();
      }, this.heartbeatMs);
    }

    _reportDataIfNecessary = async () => {
      try {
        if (this.data.length === 0 || this.numFailedReports >= this.maxNumFailedReports) return;
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Swishjam-Api-Key': this.apiKey,
          },
          body: JSON.stringify(this.data)
        });
        if (response.ok) {
          this.data = [];
        } else {
          this.numFailedReports += 1;
          // console.error('Swishjam failed to report data', response);
        }
      } catch(err) {
        this.numFailedReports += 1;
        // console.error('Swishjam failed to report data', err);
      }
    }
  }

  class Client {
    constructor(options = {}) {
      this.config = this._setConfig(options);
      this.eventManager = new EventManager(this.config);
      this.pageViewManager = new PageViewManager;
      // the order here is important, we want to make sure we have a session before we start listening for page views
      if (!this.getSession()) this.newSession({ registerPageView: false });
      this._initPageViewListeners();
      console.log('SwishjamJS Version:', SDK_VERSION);
    }

    record = (eventName, properties) => {
      return this.eventManager.recordEvent(eventName, properties);
    }

    identify = (userIdentifier, traits) => {
      this._extractOrganizationFromIdentifyCall(traits);
      return this.record('identify', { userIdentifier, ...traits });
    }

    setOrganization = (organizationIdentifier, traits = {}) => {
      const previouslySetOrganization = DataPersister.get('organizationId');
      // set the new organization so the potential new session has the correct organization
      DataPersister.set('organizationId', organizationIdentifier);
      // we assume anytime setOrganization is called with a new org, we want a new session
      if (previouslySetOrganization !== organizationIdentifier) this.newSession();
      this.record('organization', { organizationIdentifier, ...traits });
    }

    getSession = () => {
      return DataPersister.get('sessionId');
    }

    newSession = ({ registerPageView = true }) => {
      // important to set this first because the new Event reads from the DataPersister
      DataPersister.set('sessionId', UUID.generate('s'));
      this.record('new_session', { 
        referrer: this.pageViewManager.previousUrl(),
        ...DeviceDetails.all()
      });
      if (registerPageView) this.pageViewManager.recordPageView();
      return this.getSession();
    }

    _extractOrganizationFromIdentifyCall = identifyTraits => {
      const { organization, org } = identifyTraits;
      if (organization || org) {
        const extractedOrganizationData = organization || org;
        const { organizationIdentifier: extractedOrganizationIdentifier, orgIdentifier, identifier, organizationId, orgId, id } = extractedOrganizationData;
        const organizationIdentifier = extractedOrganizationIdentifier || orgIdentifier || identifier || organizationId || orgId || id;
        let orgTraits = {};
        Object.keys(extractedOrganizationData).forEach(key => {
          if(!['organizationIdentifier', 'orgIdentifier', 'identifier', 'organizationId', 'orgId', 'id'].includes(key)) {
            orgTraits[key] = extractedOrganizationData[key];
          }
        });
        this.setOrganization(organizationIdentifier, orgTraits);
      }
    }

    _initPageViewListeners = () => {
      this.pageViewManager.onNewPage((_newUrl, previousUrl) => {
        DataPersister.set('pageViewId', UUID.generate('pv'));
        this.eventManager.recordEvent('page_view', { referrer: previousUrl });
      });
      window.addEventListener('pagehide', async () => {
        this.eventManager.recordEvent('page_left');
        await this.eventManager.flushQueue();
      });
      this.pageViewManager.recordPageView();
    }

    _setConfig = options => {
      if (!options.apiKey) throw new Error('Swishjam `apiKey` is required');
      const validOptions = ['apiKey', 'apiEndpoint', 'maxEventsInMemory', 'reportingHeartbeatMs', 'debug'];
      Object.keys(options).forEach(key => {
        if (!validOptions.includes(key)) console.warn(`SwishjamJS received unrecognized config: ${key}`);
      });
      return {
        version: SDK_VERSION,
        apiKey: options.apiKey,
        apiEndpoint: options.apiEndpoint || 'https://api2.swishjam.com/api/v1/capture',
        maxEventsInMemory: options.maxEventsInMemory || 20,
        reportingHeartbeatMs: options.reportingHeartbeatMs || 10_000,
        debug: typeof options.debug === 'boolean' ? options.debug : false,
      }
    }
  }

  class Swishjam {
    static init = (options = {}) => {
      if (window.Swishjam && window.Swishjam._client) return window.Swishjam;
      Swishjam._client = new Client(options);
      Swishjam.config = Swishjam._client.config;
      window.Swishjam = Swishjam;
      return Swishjam;
    }

    static event = (eventName, properties) => Swishjam._client.record(eventName, properties);
    static identify = (userIdentifier, traits) => Swishjam._client.identify(userIdentifier, traits);
    static setOrganization = (organizationIdentifier, traits) => Swishjam._client.setOrganization(organizationIdentifier, traits);
    static getSession = () => Swishjam._client.getSession();
    static newSession = () => Swishjam._client.newSession();
  }

  var swishjam = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Swishjam
  });

  exports.SwishjamContext = SwishjamContext;
  exports.SwishjamProvider = SwishjamProvider;
  exports.useSwishjam = useSwishjam;

}));
