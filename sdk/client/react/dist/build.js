var We = { exports: {} }, p = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Sr;
function xt() {
  if (Sr)
    return p;
  Sr = 1;
  var A = Symbol.for("react.element"), d = Symbol.for("react.portal"), te = Symbol.for("react.fragment"), $ = Symbol.for("react.strict_mode"), K = Symbol.for("react.profiler"), V = Symbol.for("react.provider"), U = Symbol.for("react.context"), W = Symbol.for("react.forward_ref"), ne = Symbol.for("react.suspense"), G = Symbol.for("react.memo"), Y = Symbol.for("react.lazy"), z = Symbol.iterator;
  function ae(t) {
    return t === null || typeof t != "object" ? null : (t = z && t[z] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var D = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, B = Object.assign, le = {};
  function x(t, u, l) {
    this.props = t, this.context = u, this.refs = le, this.updater = l || D;
  }
  x.prototype.isReactComponent = {}, x.prototype.setState = function(t, u) {
    if (typeof t != "object" && typeof t != "function" && t != null)
      throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, t, u, "setState");
  }, x.prototype.forceUpdate = function(t) {
    this.updater.enqueueForceUpdate(this, t, "forceUpdate");
  };
  function de() {
  }
  de.prototype = x.prototype;
  function Q(t, u, l) {
    this.props = t, this.context = u, this.refs = le, this.updater = l || D;
  }
  var J = Q.prototype = new de();
  J.constructor = Q, B(J, x.prototype), J.isPureReactComponent = !0;
  var F = Array.isArray, O = Object.prototype.hasOwnProperty, j = { current: null }, L = { key: !0, ref: !0, __self: !0, __source: !0 };
  function H(t, u, l) {
    var h, v = {}, _ = null, w = null;
    if (u != null)
      for (h in u.ref !== void 0 && (w = u.ref), u.key !== void 0 && (_ = "" + u.key), u)
        O.call(u, h) && !L.hasOwnProperty(h) && (v[h] = u[h]);
    var g = arguments.length - 2;
    if (g === 1)
      v.children = l;
    else if (1 < g) {
      for (var b = Array(g), k = 0; k < g; k++)
        b[k] = arguments[k + 2];
      v.children = b;
    }
    if (t && t.defaultProps)
      for (h in g = t.defaultProps, g)
        v[h] === void 0 && (v[h] = g[h]);
    return { $$typeof: A, type: t, key: _, ref: w, props: v, _owner: j.current };
  }
  function pe(t, u) {
    return { $$typeof: A, type: t.type, key: u, ref: t.ref, props: t.props, _owner: t._owner };
  }
  function oe(t) {
    return typeof t == "object" && t !== null && t.$$typeof === A;
  }
  function ke(t) {
    var u = { "=": "=0", ":": "=2" };
    return "$" + t.replace(/[=:]/g, function(l) {
      return u[l];
    });
  }
  var ve = /\/+/g;
  function ue(t, u) {
    return typeof t == "object" && t !== null && t.key != null ? ke("" + t.key) : u.toString(36);
  }
  function X(t, u, l, h, v) {
    var _ = typeof t;
    (_ === "undefined" || _ === "boolean") && (t = null);
    var w = !1;
    if (t === null)
      w = !0;
    else
      switch (_) {
        case "string":
        case "number":
          w = !0;
          break;
        case "object":
          switch (t.$$typeof) {
            case A:
            case d:
              w = !0;
          }
      }
    if (w)
      return w = t, v = v(w), t = h === "" ? "." + ue(w, 0) : h, F(v) ? (l = "", t != null && (l = t.replace(ve, "$&/") + "/"), X(v, u, l, "", function(k) {
        return k;
      })) : v != null && (oe(v) && (v = pe(v, l + (!v.key || w && w.key === v.key ? "" : ("" + v.key).replace(ve, "$&/") + "/") + t)), u.push(v)), 1;
    if (w = 0, h = h === "" ? "." : h + ":", F(t))
      for (var g = 0; g < t.length; g++) {
        _ = t[g];
        var b = h + ue(_, g);
        w += X(_, u, l, b, v);
      }
    else if (b = ae(t), typeof b == "function")
      for (t = b.call(t), g = 0; !(_ = t.next()).done; )
        _ = _.value, b = h + ue(_, g++), w += X(_, u, l, b, v);
    else if (_ === "object")
      throw u = String(t), Error("Objects are not valid as a React child (found: " + (u === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : u) + "). If you meant to render a collection of children, use an array instead.");
    return w;
  }
  function I(t, u, l) {
    if (t == null)
      return t;
    var h = [], v = 0;
    return X(t, h, "", "", function(_) {
      return u.call(l, _, v++);
    }), h;
  }
  function M(t) {
    if (t._status === -1) {
      var u = t._result;
      u = u(), u.then(function(l) {
        (t._status === 0 || t._status === -1) && (t._status = 1, t._result = l);
      }, function(l) {
        (t._status === 0 || t._status === -1) && (t._status = 2, t._result = l);
      }), t._status === -1 && (t._status = 0, t._result = u);
    }
    if (t._status === 1)
      return t._result.default;
    throw t._result;
  }
  var c = { current: null }, q = { transition: null }, ye = { ReactCurrentDispatcher: c, ReactCurrentBatchConfig: q, ReactCurrentOwner: j };
  return p.Children = { map: I, forEach: function(t, u, l) {
    I(t, function() {
      u.apply(this, arguments);
    }, l);
  }, count: function(t) {
    var u = 0;
    return I(t, function() {
      u++;
    }), u;
  }, toArray: function(t) {
    return I(t, function(u) {
      return u;
    }) || [];
  }, only: function(t) {
    if (!oe(t))
      throw Error("React.Children.only expected to receive a single React element child.");
    return t;
  } }, p.Component = x, p.Fragment = te, p.Profiler = K, p.PureComponent = Q, p.StrictMode = $, p.Suspense = ne, p.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ye, p.cloneElement = function(t, u, l) {
    if (t == null)
      throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + t + ".");
    var h = B({}, t.props), v = t.key, _ = t.ref, w = t._owner;
    if (u != null) {
      if (u.ref !== void 0 && (_ = u.ref, w = j.current), u.key !== void 0 && (v = "" + u.key), t.type && t.type.defaultProps)
        var g = t.type.defaultProps;
      for (b in u)
        O.call(u, b) && !L.hasOwnProperty(b) && (h[b] = u[b] === void 0 && g !== void 0 ? g[b] : u[b]);
    }
    var b = arguments.length - 2;
    if (b === 1)
      h.children = l;
    else if (1 < b) {
      g = Array(b);
      for (var k = 0; k < b; k++)
        g[k] = arguments[k + 2];
      h.children = g;
    }
    return { $$typeof: A, type: t.type, key: v, ref: _, props: h, _owner: w };
  }, p.createContext = function(t) {
    return t = { $$typeof: U, _currentValue: t, _currentValue2: t, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, t.Provider = { $$typeof: V, _context: t }, t.Consumer = t;
  }, p.createElement = H, p.createFactory = function(t) {
    var u = H.bind(null, t);
    return u.type = t, u;
  }, p.createRef = function() {
    return { current: null };
  }, p.forwardRef = function(t) {
    return { $$typeof: W, render: t };
  }, p.isValidElement = oe, p.lazy = function(t) {
    return { $$typeof: Y, _payload: { _status: -1, _result: t }, _init: M };
  }, p.memo = function(t, u) {
    return { $$typeof: G, type: t, compare: u === void 0 ? null : u };
  }, p.startTransition = function(t) {
    var u = q.transition;
    q.transition = {};
    try {
      t();
    } finally {
      q.transition = u;
    }
  }, p.unstable_act = function() {
    throw Error("act(...) is not supported in production builds of React.");
  }, p.useCallback = function(t, u) {
    return c.current.useCallback(t, u);
  }, p.useContext = function(t) {
    return c.current.useContext(t);
  }, p.useDebugValue = function() {
  }, p.useDeferredValue = function(t) {
    return c.current.useDeferredValue(t);
  }, p.useEffect = function(t, u) {
    return c.current.useEffect(t, u);
  }, p.useId = function() {
    return c.current.useId();
  }, p.useImperativeHandle = function(t, u, l) {
    return c.current.useImperativeHandle(t, u, l);
  }, p.useInsertionEffect = function(t, u) {
    return c.current.useInsertionEffect(t, u);
  }, p.useLayoutEffect = function(t, u) {
    return c.current.useLayoutEffect(t, u);
  }, p.useMemo = function(t, u) {
    return c.current.useMemo(t, u);
  }, p.useReducer = function(t, u, l) {
    return c.current.useReducer(t, u, l);
  }, p.useRef = function(t) {
    return c.current.useRef(t);
  }, p.useState = function(t) {
    return c.current.useState(t);
  }, p.useSyncExternalStore = function(t, u, l) {
    return c.current.useSyncExternalStore(t, u, l);
  }, p.useTransition = function() {
    return c.current.useTransition();
  }, p.version = "18.2.0", p;
}
var fe = { exports: {} };
/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
fe.exports;
var Or;
function Ft() {
  return Or || (Or = 1, function(A, d) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var te = "18.2.0", $ = Symbol.for("react.element"), K = Symbol.for("react.portal"), V = Symbol.for("react.fragment"), U = Symbol.for("react.strict_mode"), W = Symbol.for("react.profiler"), ne = Symbol.for("react.provider"), G = Symbol.for("react.context"), Y = Symbol.for("react.forward_ref"), z = Symbol.for("react.suspense"), ae = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), B = Symbol.for("react.lazy"), le = Symbol.for("react.offscreen"), x = Symbol.iterator, de = "@@iterator";
      function Q(e) {
        if (e === null || typeof e != "object")
          return null;
        var r = x && e[x] || e[de];
        return typeof r == "function" ? r : null;
      }
      var J = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, F = {
        transition: null
      }, O = {
        current: null,
        // Used to reproduce behavior of `batchedUpdates` in legacy mode.
        isBatchingLegacy: !1,
        didScheduleLegacyUpdate: !1
      }, j = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, L = {}, H = null;
      function pe(e) {
        H = e;
      }
      L.setExtraStackFrame = function(e) {
        H = e;
      }, L.getCurrentStack = null, L.getStackAddendum = function() {
        var e = "";
        H && (e += H);
        var r = L.getCurrentStack;
        return r && (e += r() || ""), e;
      };
      var oe = !1, ke = !1, ve = !1, ue = !1, X = !1, I = {
        ReactCurrentDispatcher: J,
        ReactCurrentBatchConfig: F,
        ReactCurrentOwner: j
      };
      I.ReactDebugCurrentFrame = L, I.ReactCurrentActQueue = O;
      function M(e) {
        {
          for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), a = 1; a < r; a++)
            n[a - 1] = arguments[a];
          q("warn", e, n);
        }
      }
      function c(e) {
        {
          for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), a = 1; a < r; a++)
            n[a - 1] = arguments[a];
          q("error", e, n);
        }
      }
      function q(e, r, n) {
        {
          var a = I.ReactDebugCurrentFrame, o = a.getStackAddendum();
          o !== "" && (r += "%s", n = n.concat([o]));
          var s = n.map(function(i) {
            return String(i);
          });
          s.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, s);
        }
      }
      var ye = {};
      function t(e, r) {
        {
          var n = e.constructor, a = n && (n.displayName || n.name) || "ReactClass", o = a + "." + r;
          if (ye[o])
            return;
          c("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", r, a), ye[o] = !0;
        }
      }
      var u = {
        /**
         * Checks whether or not this composite component is mounted.
         * @param {ReactClass} publicInstance The instance we want to test.
         * @return {boolean} True if mounted, false otherwise.
         * @protected
         * @final
         */
        isMounted: function(e) {
          return !1;
        },
        /**
         * Forces an update. This should only be invoked when it is known with
         * certainty that we are **not** in a DOM transaction.
         *
         * You may want to call this when you know that some deeper aspect of the
         * component's state has changed but `setState` was not called.
         *
         * This will not invoke `shouldComponentUpdate`, but it will invoke
         * `componentWillUpdate` and `componentDidUpdate`.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueForceUpdate: function(e, r, n) {
          t(e, "forceUpdate");
        },
        /**
         * Replaces all of the state. Always use this or `setState` to mutate state.
         * You should treat `this.state` as immutable.
         *
         * There is no guarantee that `this.state` will be immediately updated, so
         * accessing `this.state` after calling this method may return the old value.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} completeState Next state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueReplaceState: function(e, r, n, a) {
          t(e, "replaceState");
        },
        /**
         * Sets a subset of the state. This only exists because _pendingState is
         * internal. This provides a merging strategy that is not available to deep
         * properties which is confusing. TODO: Expose pendingState or don't use it
         * during the merge.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} partialState Next partial state to be merged with state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} Name of the calling function in the public API.
         * @internal
         */
        enqueueSetState: function(e, r, n, a) {
          t(e, "setState");
        }
      }, l = Object.assign, h = {};
      Object.freeze(h);
      function v(e, r, n) {
        this.props = e, this.context = r, this.refs = h, this.updater = n || u;
      }
      v.prototype.isReactComponent = {}, v.prototype.setState = function(e, r) {
        if (typeof e != "object" && typeof e != "function" && e != null)
          throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, e, r, "setState");
      }, v.prototype.forceUpdate = function(e) {
        this.updater.enqueueForceUpdate(this, e, "forceUpdate");
      };
      {
        var _ = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
        }, w = function(e, r) {
          Object.defineProperty(v.prototype, e, {
            get: function() {
              M("%s(...) is deprecated in plain JavaScript React classes. %s", r[0], r[1]);
            }
          });
        };
        for (var g in _)
          _.hasOwnProperty(g) && w(g, _[g]);
      }
      function b() {
      }
      b.prototype = v.prototype;
      function k(e, r, n) {
        this.props = e, this.context = r, this.refs = h, this.updater = n || u;
      }
      var Pe = k.prototype = new b();
      Pe.constructor = k, l(Pe, v.prototype), Pe.isPureReactComponent = !0;
      function kr() {
        var e = {
          current: null
        };
        return Object.seal(e), e;
      }
      var Pr = Array.isArray;
      function he(e) {
        return Pr(e);
      }
      function jr(e) {
        {
          var r = typeof Symbol == "function" && Symbol.toStringTag, n = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
          return n;
        }
      }
      function Ar(e) {
        try {
          return Ye(e), !1;
        } catch {
          return !0;
        }
      }
      function Ye(e) {
        return "" + e;
      }
      function me(e) {
        if (Ar(e))
          return c("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", jr(e)), Ye(e);
      }
      function Ir(e, r, n) {
        var a = e.displayName;
        if (a)
          return a;
        var o = r.displayName || r.name || "";
        return o !== "" ? n + "(" + o + ")" : n;
      }
      function ze(e) {
        return e.displayName || "Context";
      }
      function N(e) {
        if (e == null)
          return null;
        if (typeof e.tag == "number" && c("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
          return e.displayName || e.name || null;
        if (typeof e == "string")
          return e;
        switch (e) {
          case V:
            return "Fragment";
          case K:
            return "Portal";
          case W:
            return "Profiler";
          case U:
            return "StrictMode";
          case z:
            return "Suspense";
          case ae:
            return "SuspenseList";
        }
        if (typeof e == "object")
          switch (e.$$typeof) {
            case G:
              var r = e;
              return ze(r) + ".Consumer";
            case ne:
              var n = e;
              return ze(n._context) + ".Provider";
            case Y:
              return Ir(e, e.render, "ForwardRef");
            case D:
              var a = e.displayName || null;
              return a !== null ? a : N(e.type) || "Memo";
            case B: {
              var o = e, s = o._payload, i = o._init;
              try {
                return N(i(s));
              } catch {
                return null;
              }
            }
          }
        return null;
      }
      var ie = Object.prototype.hasOwnProperty, Be = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
      }, He, qe, je;
      je = {};
      function Ke(e) {
        if (ie.call(e, "ref")) {
          var r = Object.getOwnPropertyDescriptor(e, "ref").get;
          if (r && r.isReactWarning)
            return !1;
        }
        return e.ref !== void 0;
      }
      function Ge(e) {
        if (ie.call(e, "key")) {
          var r = Object.getOwnPropertyDescriptor(e, "key").get;
          if (r && r.isReactWarning)
            return !1;
        }
        return e.key !== void 0;
      }
      function $r(e, r) {
        var n = function() {
          He || (He = !0, c("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: n,
          configurable: !0
        });
      }
      function Dr(e, r) {
        var n = function() {
          qe || (qe = !0, c("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: n,
          configurable: !0
        });
      }
      function xr(e) {
        if (typeof e.ref == "string" && j.current && e.__self && j.current.stateNode !== e.__self) {
          var r = N(j.current.type);
          je[r] || (c('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', r, e.ref), je[r] = !0);
        }
      }
      var Ae = function(e, r, n, a, o, s, i) {
        var f = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: $,
          // Built-in properties that belong on the element
          type: e,
          key: r,
          ref: n,
          props: i,
          // Record the component responsible for creating this element.
          _owner: s
        };
        return f._store = {}, Object.defineProperty(f._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: !1
        }), Object.defineProperty(f, "_self", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: a
        }), Object.defineProperty(f, "_source", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: o
        }), Object.freeze && (Object.freeze(f.props), Object.freeze(f)), f;
      };
      function Fr(e, r, n) {
        var a, o = {}, s = null, i = null, f = null, y = null;
        if (r != null) {
          Ke(r) && (i = r.ref, xr(r)), Ge(r) && (me(r.key), s = "" + r.key), f = r.__self === void 0 ? null : r.__self, y = r.__source === void 0 ? null : r.__source;
          for (a in r)
            ie.call(r, a) && !Be.hasOwnProperty(a) && (o[a] = r[a]);
        }
        var m = arguments.length - 2;
        if (m === 1)
          o.children = n;
        else if (m > 1) {
          for (var E = Array(m), R = 0; R < m; R++)
            E[R] = arguments[R + 2];
          Object.freeze && Object.freeze(E), o.children = E;
        }
        if (e && e.defaultProps) {
          var C = e.defaultProps;
          for (a in C)
            o[a] === void 0 && (o[a] = C[a]);
        }
        if (s || i) {
          var S = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          s && $r(o, S), i && Dr(o, S);
        }
        return Ae(e, s, i, f, y, j.current, o);
      }
      function Lr(e, r) {
        var n = Ae(e.type, r, e.ref, e._self, e._source, e._owner, e.props);
        return n;
      }
      function Mr(e, r, n) {
        if (e == null)
          throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
        var a, o = l({}, e.props), s = e.key, i = e.ref, f = e._self, y = e._source, m = e._owner;
        if (r != null) {
          Ke(r) && (i = r.ref, m = j.current), Ge(r) && (me(r.key), s = "" + r.key);
          var E;
          e.type && e.type.defaultProps && (E = e.type.defaultProps);
          for (a in r)
            ie.call(r, a) && !Be.hasOwnProperty(a) && (r[a] === void 0 && E !== void 0 ? o[a] = E[a] : o[a] = r[a]);
        }
        var R = arguments.length - 2;
        if (R === 1)
          o.children = n;
        else if (R > 1) {
          for (var C = Array(R), S = 0; S < R; S++)
            C[S] = arguments[S + 2];
          o.children = C;
        }
        return Ae(e.type, s, i, f, y, m, o);
      }
      function Z(e) {
        return typeof e == "object" && e !== null && e.$$typeof === $;
      }
      var Qe = ".", Nr = ":";
      function Vr(e) {
        var r = /[=:]/g, n = {
          "=": "=0",
          ":": "=2"
        }, a = e.replace(r, function(o) {
          return n[o];
        });
        return "$" + a;
      }
      var Je = !1, Ur = /\/+/g;
      function Xe(e) {
        return e.replace(Ur, "$&/");
      }
      function Ie(e, r) {
        return typeof e == "object" && e !== null && e.key != null ? (me(e.key), Vr("" + e.key)) : r.toString(36);
      }
      function _e(e, r, n, a, o) {
        var s = typeof e;
        (s === "undefined" || s === "boolean") && (e = null);
        var i = !1;
        if (e === null)
          i = !0;
        else
          switch (s) {
            case "string":
            case "number":
              i = !0;
              break;
            case "object":
              switch (e.$$typeof) {
                case $:
                case K:
                  i = !0;
              }
          }
        if (i) {
          var f = e, y = o(f), m = a === "" ? Qe + Ie(f, 0) : a;
          if (he(y)) {
            var E = "";
            m != null && (E = Xe(m) + "/"), _e(y, r, E, "", function(Dt) {
              return Dt;
            });
          } else
            y != null && (Z(y) && (y.key && (!f || f.key !== y.key) && me(y.key), y = Lr(
              y,
              // Keep both the (mapped) and old keys if they differ, just as
              // traverseAllChildren used to do for objects as children
              n + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
              (y.key && (!f || f.key !== y.key) ? (
                // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                // eslint-disable-next-line react-internal/safe-string-coercion
                Xe("" + y.key) + "/"
              ) : "") + m
            )), r.push(y));
          return 1;
        }
        var R, C, S = 0, T = a === "" ? Qe : a + Nr;
        if (he(e))
          for (var Oe = 0; Oe < e.length; Oe++)
            R = e[Oe], C = T + Ie(R, Oe), S += _e(R, r, n, C, o);
        else {
          var Ue = Q(e);
          if (typeof Ue == "function") {
            var Rr = e;
            Ue === Rr.entries && (Je || M("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Je = !0);
            for (var It = Ue.call(Rr), Cr, $t = 0; !(Cr = It.next()).done; )
              R = Cr.value, C = T + Ie(R, $t++), S += _e(R, r, n, C, o);
          } else if (s === "object") {
            var wr = String(e);
            throw new Error("Objects are not valid as a React child (found: " + (wr === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : wr) + "). If you meant to render a collection of children, use an array instead.");
          }
        }
        return S;
      }
      function ge(e, r, n) {
        if (e == null)
          return e;
        var a = [], o = 0;
        return _e(e, a, "", "", function(s) {
          return r.call(n, s, o++);
        }), a;
      }
      function Wr(e) {
        var r = 0;
        return ge(e, function() {
          r++;
        }), r;
      }
      function Yr(e, r, n) {
        ge(e, function() {
          r.apply(this, arguments);
        }, n);
      }
      function zr(e) {
        return ge(e, function(r) {
          return r;
        }) || [];
      }
      function Br(e) {
        if (!Z(e))
          throw new Error("React.Children.only expected to receive a single React element child.");
        return e;
      }
      function Hr(e) {
        var r = {
          $$typeof: G,
          // As a workaround to support multiple concurrent renderers, we categorize
          // some renderers as primary and others as secondary. We only expect
          // there to be two concurrent renderers at most: React Native (primary) and
          // Fabric (secondary); React DOM (primary) and React ART (secondary).
          // Secondary renderers store their context values on separate fields.
          _currentValue: e,
          _currentValue2: e,
          // Used to track how many concurrent renderers this context currently
          // supports within in a single renderer. Such as parallel server rendering.
          _threadCount: 0,
          // These are circular
          Provider: null,
          Consumer: null,
          // Add these to use same hidden class in VM as ServerContext
          _defaultValue: null,
          _globalName: null
        };
        r.Provider = {
          $$typeof: ne,
          _context: r
        };
        var n = !1, a = !1, o = !1;
        {
          var s = {
            $$typeof: G,
            _context: r
          };
          Object.defineProperties(s, {
            Provider: {
              get: function() {
                return a || (a = !0, c("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?")), r.Provider;
              },
              set: function(i) {
                r.Provider = i;
              }
            },
            _currentValue: {
              get: function() {
                return r._currentValue;
              },
              set: function(i) {
                r._currentValue = i;
              }
            },
            _currentValue2: {
              get: function() {
                return r._currentValue2;
              },
              set: function(i) {
                r._currentValue2 = i;
              }
            },
            _threadCount: {
              get: function() {
                return r._threadCount;
              },
              set: function(i) {
                r._threadCount = i;
              }
            },
            Consumer: {
              get: function() {
                return n || (n = !0, c("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?")), r.Consumer;
              }
            },
            displayName: {
              get: function() {
                return r.displayName;
              },
              set: function(i) {
                o || (M("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", i), o = !0);
              }
            }
          }), r.Consumer = s;
        }
        return r._currentRenderer = null, r._currentRenderer2 = null, r;
      }
      var se = -1, $e = 0, Ze = 1, qr = 2;
      function Kr(e) {
        if (e._status === se) {
          var r = e._result, n = r();
          if (n.then(function(s) {
            if (e._status === $e || e._status === se) {
              var i = e;
              i._status = Ze, i._result = s;
            }
          }, function(s) {
            if (e._status === $e || e._status === se) {
              var i = e;
              i._status = qr, i._result = s;
            }
          }), e._status === se) {
            var a = e;
            a._status = $e, a._result = n;
          }
        }
        if (e._status === Ze) {
          var o = e._result;
          return o === void 0 && c(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, o), "default" in o || c(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`, o), o.default;
        } else
          throw e._result;
      }
      function Gr(e) {
        var r = {
          // We use these fields to store the result.
          _status: se,
          _result: e
        }, n = {
          $$typeof: B,
          _payload: r,
          _init: Kr
        };
        {
          var a, o;
          Object.defineProperties(n, {
            defaultProps: {
              configurable: !0,
              get: function() {
                return a;
              },
              set: function(s) {
                c("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), a = s, Object.defineProperty(n, "defaultProps", {
                  enumerable: !0
                });
              }
            },
            propTypes: {
              configurable: !0,
              get: function() {
                return o;
              },
              set: function(s) {
                c("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), o = s, Object.defineProperty(n, "propTypes", {
                  enumerable: !0
                });
              }
            }
          });
        }
        return n;
      }
      function Qr(e) {
        e != null && e.$$typeof === D ? c("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e != "function" ? c("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e) : e.length !== 0 && e.length !== 2 && c("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."), e != null && (e.defaultProps != null || e.propTypes != null) && c("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
        var r = {
          $$typeof: Y,
          render: e
        };
        {
          var n;
          Object.defineProperty(r, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return n;
            },
            set: function(a) {
              n = a, !e.name && !e.displayName && (e.displayName = a);
            }
          });
        }
        return r;
      }
      var er;
      er = Symbol.for("react.module.reference");
      function rr(e) {
        return !!(typeof e == "string" || typeof e == "function" || e === V || e === W || X || e === U || e === z || e === ae || ue || e === le || oe || ke || ve || typeof e == "object" && e !== null && (e.$$typeof === B || e.$$typeof === D || e.$$typeof === ne || e.$$typeof === G || e.$$typeof === Y || // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        e.$$typeof === er || e.getModuleId !== void 0));
      }
      function Jr(e, r) {
        rr(e) || c("memo: The first argument must be a component. Instead received: %s", e === null ? "null" : typeof e);
        var n = {
          $$typeof: D,
          type: e,
          compare: r === void 0 ? null : r
        };
        {
          var a;
          Object.defineProperty(n, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return a;
            },
            set: function(o) {
              a = o, !e.name && !e.displayName && (e.displayName = o);
            }
          });
        }
        return n;
      }
      function P() {
        var e = J.current;
        return e === null && c(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`), e;
      }
      function Xr(e) {
        var r = P();
        if (e._context !== void 0) {
          var n = e._context;
          n.Consumer === e ? c("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?") : n.Provider === e && c("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
        }
        return r.useContext(e);
      }
      function Zr(e) {
        var r = P();
        return r.useState(e);
      }
      function et(e, r, n) {
        var a = P();
        return a.useReducer(e, r, n);
      }
      function rt(e) {
        var r = P();
        return r.useRef(e);
      }
      function tt(e, r) {
        var n = P();
        return n.useEffect(e, r);
      }
      function nt(e, r) {
        var n = P();
        return n.useInsertionEffect(e, r);
      }
      function at(e, r) {
        var n = P();
        return n.useLayoutEffect(e, r);
      }
      function ot(e, r) {
        var n = P();
        return n.useCallback(e, r);
      }
      function ut(e, r) {
        var n = P();
        return n.useMemo(e, r);
      }
      function it(e, r, n) {
        var a = P();
        return a.useImperativeHandle(e, r, n);
      }
      function st(e, r) {
        {
          var n = P();
          return n.useDebugValue(e, r);
        }
      }
      function ct() {
        var e = P();
        return e.useTransition();
      }
      function ft(e) {
        var r = P();
        return r.useDeferredValue(e);
      }
      function lt() {
        var e = P();
        return e.useId();
      }
      function dt(e, r, n) {
        var a = P();
        return a.useSyncExternalStore(e, r, n);
      }
      var ce = 0, tr, nr, ar, or, ur, ir, sr;
      function cr() {
      }
      cr.__reactDisabledLog = !0;
      function pt() {
        {
          if (ce === 0) {
            tr = console.log, nr = console.info, ar = console.warn, or = console.error, ur = console.group, ir = console.groupCollapsed, sr = console.groupEnd;
            var e = {
              configurable: !0,
              enumerable: !0,
              value: cr,
              writable: !0
            };
            Object.defineProperties(console, {
              info: e,
              log: e,
              warn: e,
              error: e,
              group: e,
              groupCollapsed: e,
              groupEnd: e
            });
          }
          ce++;
        }
      }
      function vt() {
        {
          if (ce--, ce === 0) {
            var e = {
              configurable: !0,
              enumerable: !0,
              writable: !0
            };
            Object.defineProperties(console, {
              log: l({}, e, {
                value: tr
              }),
              info: l({}, e, {
                value: nr
              }),
              warn: l({}, e, {
                value: ar
              }),
              error: l({}, e, {
                value: or
              }),
              group: l({}, e, {
                value: ur
              }),
              groupCollapsed: l({}, e, {
                value: ir
              }),
              groupEnd: l({}, e, {
                value: sr
              })
            });
          }
          ce < 0 && c("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
      var De = I.ReactCurrentDispatcher, xe;
      function be(e, r, n) {
        {
          if (xe === void 0)
            try {
              throw Error();
            } catch (o) {
              var a = o.stack.trim().match(/\n( *(at )?)/);
              xe = a && a[1] || "";
            }
          return `
` + xe + e;
        }
      }
      var Fe = !1, Ee;
      {
        var yt = typeof WeakMap == "function" ? WeakMap : Map;
        Ee = new yt();
      }
      function fr(e, r) {
        if (!e || Fe)
          return "";
        {
          var n = Ee.get(e);
          if (n !== void 0)
            return n;
        }
        var a;
        Fe = !0;
        var o = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var s;
        s = De.current, De.current = null, pt();
        try {
          if (r) {
            var i = function() {
              throw Error();
            };
            if (Object.defineProperty(i.prototype, "props", {
              set: function() {
                throw Error();
              }
            }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(i, []);
              } catch (T) {
                a = T;
              }
              Reflect.construct(e, [], i);
            } else {
              try {
                i.call();
              } catch (T) {
                a = T;
              }
              e.call(i.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (T) {
              a = T;
            }
            e();
          }
        } catch (T) {
          if (T && a && typeof T.stack == "string") {
            for (var f = T.stack.split(`
`), y = a.stack.split(`
`), m = f.length - 1, E = y.length - 1; m >= 1 && E >= 0 && f[m] !== y[E]; )
              E--;
            for (; m >= 1 && E >= 0; m--, E--)
              if (f[m] !== y[E]) {
                if (m !== 1 || E !== 1)
                  do
                    if (m--, E--, E < 0 || f[m] !== y[E]) {
                      var R = `
` + f[m].replace(" at new ", " at ");
                      return e.displayName && R.includes("<anonymous>") && (R = R.replace("<anonymous>", e.displayName)), typeof e == "function" && Ee.set(e, R), R;
                    }
                  while (m >= 1 && E >= 0);
                break;
              }
          }
        } finally {
          Fe = !1, De.current = s, vt(), Error.prepareStackTrace = o;
        }
        var C = e ? e.displayName || e.name : "", S = C ? be(C) : "";
        return typeof e == "function" && Ee.set(e, S), S;
      }
      function ht(e, r, n) {
        return fr(e, !1);
      }
      function mt(e) {
        var r = e.prototype;
        return !!(r && r.isReactComponent);
      }
      function Re(e, r, n) {
        if (e == null)
          return "";
        if (typeof e == "function")
          return fr(e, mt(e));
        if (typeof e == "string")
          return be(e);
        switch (e) {
          case z:
            return be("Suspense");
          case ae:
            return be("SuspenseList");
        }
        if (typeof e == "object")
          switch (e.$$typeof) {
            case Y:
              return ht(e.render);
            case D:
              return Re(e.type, r, n);
            case B: {
              var a = e, o = a._payload, s = a._init;
              try {
                return Re(s(o), r, n);
              } catch {
              }
            }
          }
        return "";
      }
      var lr = {}, dr = I.ReactDebugCurrentFrame;
      function Ce(e) {
        if (e) {
          var r = e._owner, n = Re(e.type, e._source, r ? r.type : null);
          dr.setExtraStackFrame(n);
        } else
          dr.setExtraStackFrame(null);
      }
      function _t(e, r, n, a, o) {
        {
          var s = Function.call.bind(ie);
          for (var i in e)
            if (s(e, i)) {
              var f = void 0;
              try {
                if (typeof e[i] != "function") {
                  var y = Error((a || "React class") + ": " + n + " type `" + i + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[i] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  throw y.name = "Invariant Violation", y;
                }
                f = e[i](r, i, a, n, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (m) {
                f = m;
              }
              f && !(f instanceof Error) && (Ce(o), c("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", a || "React class", n, i, typeof f), Ce(null)), f instanceof Error && !(f.message in lr) && (lr[f.message] = !0, Ce(o), c("Failed %s type: %s", n, f.message), Ce(null));
            }
        }
      }
      function ee(e) {
        if (e) {
          var r = e._owner, n = Re(e.type, e._source, r ? r.type : null);
          pe(n);
        } else
          pe(null);
      }
      var Le;
      Le = !1;
      function pr() {
        if (j.current) {
          var e = N(j.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
      function gt(e) {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), n = e.lineNumber;
          return `

Check your code at ` + r + ":" + n + ".";
        }
        return "";
      }
      function bt(e) {
        return e != null ? gt(e.__source) : "";
      }
      var vr = {};
      function Et(e) {
        var r = pr();
        if (!r) {
          var n = typeof e == "string" ? e : e.displayName || e.name;
          n && (r = `

Check the top-level render call using <` + n + ">.");
        }
        return r;
      }
      function yr(e, r) {
        if (!(!e._store || e._store.validated || e.key != null)) {
          e._store.validated = !0;
          var n = Et(r);
          if (!vr[n]) {
            vr[n] = !0;
            var a = "";
            e && e._owner && e._owner !== j.current && (a = " It was passed a child from " + N(e._owner.type) + "."), ee(e), c('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', n, a), ee(null);
          }
        }
      }
      function hr(e, r) {
        if (typeof e == "object") {
          if (he(e))
            for (var n = 0; n < e.length; n++) {
              var a = e[n];
              Z(a) && yr(a, r);
            }
          else if (Z(e))
            e._store && (e._store.validated = !0);
          else if (e) {
            var o = Q(e);
            if (typeof o == "function" && o !== e.entries)
              for (var s = o.call(e), i; !(i = s.next()).done; )
                Z(i.value) && yr(i.value, r);
          }
        }
      }
      function mr(e) {
        {
          var r = e.type;
          if (r == null || typeof r == "string")
            return;
          var n;
          if (typeof r == "function")
            n = r.propTypes;
          else if (typeof r == "object" && (r.$$typeof === Y || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          r.$$typeof === D))
            n = r.propTypes;
          else
            return;
          if (n) {
            var a = N(r);
            _t(n, e.props, "prop", a, e);
          } else if (r.PropTypes !== void 0 && !Le) {
            Le = !0;
            var o = N(r);
            c("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", o || "Unknown");
          }
          typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && c("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
      function Rt(e) {
        {
          for (var r = Object.keys(e.props), n = 0; n < r.length; n++) {
            var a = r[n];
            if (a !== "children" && a !== "key") {
              ee(e), c("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", a), ee(null);
              break;
            }
          }
          e.ref !== null && (ee(e), c("Invalid attribute `ref` supplied to `React.Fragment`."), ee(null));
        }
      }
      function _r(e, r, n) {
        var a = rr(e);
        if (!a) {
          var o = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (o += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var s = bt(r);
          s ? o += s : o += pr();
          var i;
          e === null ? i = "null" : he(e) ? i = "array" : e !== void 0 && e.$$typeof === $ ? (i = "<" + (N(e.type) || "Unknown") + " />", o = " Did you accidentally export a JSX literal instead of a component?") : i = typeof e, c("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", i, o);
        }
        var f = Fr.apply(this, arguments);
        if (f == null)
          return f;
        if (a)
          for (var y = 2; y < arguments.length; y++)
            hr(arguments[y], e);
        return e === V ? Rt(f) : mr(f), f;
      }
      var gr = !1;
      function Ct(e) {
        var r = _r.bind(null, e);
        return r.type = e, gr || (gr = !0, M("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.")), Object.defineProperty(r, "type", {
          enumerable: !1,
          get: function() {
            return M("Factory.type is deprecated. Access the class directly before passing it to createFactory."), Object.defineProperty(this, "type", {
              value: e
            }), e;
          }
        }), r;
      }
      function wt(e, r, n) {
        for (var a = Mr.apply(this, arguments), o = 2; o < arguments.length; o++)
          hr(arguments[o], a.type);
        return mr(a), a;
      }
      function St(e, r) {
        var n = F.transition;
        F.transition = {};
        var a = F.transition;
        F.transition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          e();
        } finally {
          if (F.transition = n, n === null && a._updatedFibers) {
            var o = a._updatedFibers.size;
            o > 10 && M("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), a._updatedFibers.clear();
          }
        }
      }
      var br = !1, we = null;
      function Ot(e) {
        if (we === null)
          try {
            var r = ("require" + Math.random()).slice(0, 7), n = A && A[r];
            we = n.call(A, "timers").setImmediate;
          } catch {
            we = function(o) {
              br === !1 && (br = !0, typeof MessageChannel > "u" && c("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
              var s = new MessageChannel();
              s.port1.onmessage = o, s.port2.postMessage(void 0);
            };
          }
        return we(e);
      }
      var re = 0, Er = !1;
      function Tt(e) {
        {
          var r = re;
          re++, O.current === null && (O.current = []);
          var n = O.isBatchingLegacy, a;
          try {
            if (O.isBatchingLegacy = !0, a = e(), !n && O.didScheduleLegacyUpdate) {
              var o = O.current;
              o !== null && (O.didScheduleLegacyUpdate = !1, Ve(o));
            }
          } catch (C) {
            throw Se(r), C;
          } finally {
            O.isBatchingLegacy = n;
          }
          if (a !== null && typeof a == "object" && typeof a.then == "function") {
            var s = a, i = !1, f = {
              then: function(C, S) {
                i = !0, s.then(function(T) {
                  Se(r), re === 0 ? Me(T, C, S) : C(T);
                }, function(T) {
                  Se(r), S(T);
                });
              }
            };
            return !Er && typeof Promise < "u" && Promise.resolve().then(function() {
            }).then(function() {
              i || (Er = !0, c("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
            }), f;
          } else {
            var y = a;
            if (Se(r), re === 0) {
              var m = O.current;
              m !== null && (Ve(m), O.current = null);
              var E = {
                then: function(C, S) {
                  O.current === null ? (O.current = [], Me(y, C, S)) : C(y);
                }
              };
              return E;
            } else {
              var R = {
                then: function(C, S) {
                  C(y);
                }
              };
              return R;
            }
          }
        }
      }
      function Se(e) {
        e !== re - 1 && c("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), re = e;
      }
      function Me(e, r, n) {
        {
          var a = O.current;
          if (a !== null)
            try {
              Ve(a), Ot(function() {
                a.length === 0 ? (O.current = null, r(e)) : Me(e, r, n);
              });
            } catch (o) {
              n(o);
            }
          else
            r(e);
        }
      }
      var Ne = !1;
      function Ve(e) {
        if (!Ne) {
          Ne = !0;
          var r = 0;
          try {
            for (; r < e.length; r++) {
              var n = e[r];
              do
                n = n(!0);
              while (n !== null);
            }
            e.length = 0;
          } catch (a) {
            throw e = e.slice(r + 1), a;
          } finally {
            Ne = !1;
          }
        }
      }
      var kt = _r, Pt = wt, jt = Ct, At = {
        map: ge,
        forEach: Yr,
        count: Wr,
        toArray: zr,
        only: Br
      };
      d.Children = At, d.Component = v, d.Fragment = V, d.Profiler = W, d.PureComponent = k, d.StrictMode = U, d.Suspense = z, d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = I, d.cloneElement = Pt, d.createContext = Hr, d.createElement = kt, d.createFactory = jt, d.createRef = kr, d.forwardRef = Qr, d.isValidElement = Z, d.lazy = Gr, d.memo = Jr, d.startTransition = St, d.unstable_act = Tt, d.useCallback = ot, d.useContext = Xr, d.useDebugValue = st, d.useDeferredValue = ft, d.useEffect = tt, d.useId = lt, d.useImperativeHandle = it, d.useInsertionEffect = nt, d.useLayoutEffect = at, d.useMemo = ut, d.useReducer = et, d.useRef = rt, d.useState = Zr, d.useSyncExternalStore = dt, d.useTransition = ct, d.version = te, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(fe, fe.exports)), fe.exports;
}
process.env.NODE_ENV === "production" ? We.exports = xt() : We.exports = Ft();
var Te = We.exports;
const Tr = Te.createContext(), Lt = () => Te.useContext(Tr), Mt = ({ apiKey: A, apiEndpoint: d, children: te }) => {
  const [$, K] = Te.useState();
  return Te.useEffect(() => {
    (async () => {
      if (typeof window < "u" && !$) {
        const U = (await import("./swishjam-842b0a40.js")).default, W = new U({ apiKey: A, apiEndpoint: d });
        return K(W), $;
      }
    })();
  }, []), /* @__PURE__ */ React.createElement(Tr.Provider, { value: $ }, te);
};
export {
  Tr as SwishjamContext,
  Mt as SwishjamProvider,
  Lt as useSwishjam
};
