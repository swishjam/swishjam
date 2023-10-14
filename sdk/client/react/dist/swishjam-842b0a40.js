var Se = Object.defineProperty;
var ke = (B, o, c) => o in B ? Se(B, o, { enumerable: !0, configurable: !0, writable: !0, value: c }) : B[o] = c;
var m = (B, o, c) => (ke(B, typeof o != "symbol" ? o + "" : o, c), c);
var R = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
class Ce {
  constructor() {
    m(this, "currentUrl", () => this._currentUrl);
    m(this, "previousUrl", () => this._previousUrl || document.referrer);
    m(this, "onNewPage", (o) => {
      this.newPageCallbacks.push(o);
    });
    m(this, "recordPageView", () => {
      const o = window.location.href;
      this._previousUrl = this._currentUrl || document.referrer, this._currentUrl = o, this.newPageCallbacks.forEach((c) => c(this.currentUrl(), this.previousUrl()));
    });
    m(this, "_listenForSoftNavigations", () => {
      if (window.addEventListener("hashchange", this.recordPageView), window.addEventListener("popstate", this.recordPageView), window.history.pushState) {
        const o = window.history.pushState, c = this;
        window.history.pushState = function() {
          o.apply(this, arguments), c.recordPageView();
        };
      }
    });
    this.newPageCallbacks = [], this._listenForSoftNavigations();
  }
}
class X {
}
m(X, "generate", (o) => `${o ? `${o}-` : ""}xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.replace(/x/g, (c) => {
  const p = Math.random() * 16 | 0;
  return (c == "x" ? p : p & 3 | 8).toString(16);
}));
class V {
  static set(o, c) {
    const p = this.all();
    return p[o] = c, sessionStorage.setItem("swishjam", JSON.stringify(p)), c;
  }
  static get(o) {
    return this.all()[o];
  }
  static all() {
    return JSON.parse(sessionStorage.getItem("swishjam") || "{}");
  }
}
var ve = { exports: {} };
(function(B, o) {
  (function(c, p) {
    B.exports = p();
  })(R, function() {
    return function(c) {
      var p = {};
      function d(n) {
        if (p[n])
          return p[n].exports;
        var l = p[n] = { i: n, l: !1, exports: {} };
        return c[n].call(l.exports, l, l.exports, d), l.l = !0, l.exports;
      }
      return d.m = c, d.c = p, d.d = function(n, l, g) {
        d.o(n, l) || Object.defineProperty(n, l, { enumerable: !0, get: g });
      }, d.r = function(n) {
        typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(n, "__esModule", { value: !0 });
      }, d.t = function(n, l) {
        if (1 & l && (n = d(n)), 8 & l || 4 & l && typeof n == "object" && n && n.__esModule)
          return n;
        var g = /* @__PURE__ */ Object.create(null);
        if (d.r(g), Object.defineProperty(g, "default", { enumerable: !0, value: n }), 2 & l && typeof n != "string")
          for (var M in n)
            d.d(g, M, (function(f) {
              return n[f];
            }).bind(null, M));
        return g;
      }, d.n = function(n) {
        var l = n && n.__esModule ? function() {
          return n.default;
        } : function() {
          return n;
        };
        return d.d(l, "a", l), l;
      }, d.o = function(n, l) {
        return Object.prototype.hasOwnProperty.call(n, l);
      }, d.p = "", d(d.s = 0);
    }([function(c, p, d) {
      var n, l, g = d(1)(), M = d(3), f = d(4), _ = d(6), k = function() {
        var a = new f();
        return n = a.getResult(), l = new _(), this;
      };
      k.prototype = { getSoftwareVersion: function() {
        return "0.1.11";
      }, getBrowserData: function() {
        return n;
      }, getFingerprint: function() {
        var a = "|", e = n.ua, t = this.getScreenPrint(), i = this.getPlugins(), r = this.getFonts(), s = this.isLocalStorage(), A = this.isSessionStorage(), O = this.getTimeZone(), b = this.getLanguage(), h = this.getSystemLanguage(), I = this.isCookie(), j = this.getCanvasPrint();
        return M(e + a + t + a + i + a + r + a + s + a + A + a + O + a + b + a + h + a + I + a + j, 256);
      }, getCustomFingerprint: function() {
        for (var a = "|", e = "", t = 0; t < arguments.length; t++)
          e += arguments[t] + a;
        return M(e, 256);
      }, getUserAgent: function() {
        return n.ua;
      }, getUserAgentLowerCase: function() {
        return n.ua.toLowerCase();
      }, getBrowser: function() {
        return n.browser.name;
      }, getBrowserVersion: function() {
        return n.browser.version;
      }, getBrowserMajorVersion: function() {
        return n.browser.major;
      }, isIE: function() {
        return /IE/i.test(n.browser.name);
      }, isChrome: function() {
        return /Chrome/i.test(n.browser.name);
      }, isFirefox: function() {
        return /Firefox/i.test(n.browser.name);
      }, isSafari: function() {
        return /Safari/i.test(n.browser.name);
      }, isMobileSafari: function() {
        return /Mobile\sSafari/i.test(n.browser.name);
      }, isOpera: function() {
        return /Opera/i.test(n.browser.name);
      }, getEngine: function() {
        return n.engine.name;
      }, getEngineVersion: function() {
        return n.engine.version;
      }, getOS: function() {
        return n.os.name;
      }, getOSVersion: function() {
        return n.os.version;
      }, isWindows: function() {
        return /Windows/i.test(n.os.name);
      }, isMac: function() {
        return /Mac/i.test(n.os.name);
      }, isLinux: function() {
        return /Linux/i.test(n.os.name);
      }, isUbuntu: function() {
        return /Ubuntu/i.test(n.os.name);
      }, isSolaris: function() {
        return /Solaris/i.test(n.os.name);
      }, getDevice: function() {
        return n.device.model;
      }, getDeviceType: function() {
        return n.device.type;
      }, getDeviceVendor: function() {
        return n.device.vendor;
      }, getCPU: function() {
        return n.cpu.architecture;
      }, isMobile: function() {
        var a = n.ua || navigator.vendor || window.opera;
        return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
      }, isMobileMajor: function() {
        return this.isMobileAndroid() || this.isMobileBlackBerry() || this.isMobileIOS() || this.isMobileOpera() || this.isMobileWindows();
      }, isMobileAndroid: function() {
        return !!n.ua.match(/Android/i);
      }, isMobileOpera: function() {
        return !!n.ua.match(/Opera Mini/i);
      }, isMobileWindows: function() {
        return !!n.ua.match(/IEMobile/i);
      }, isMobileBlackBerry: function() {
        return !!n.ua.match(/BlackBerry/i);
      }, isMobileIOS: function() {
        return !!n.ua.match(/iPhone|iPad|iPod/i);
      }, isIphone: function() {
        return !!n.ua.match(/iPhone/i);
      }, isIpad: function() {
        return !!n.ua.match(/iPad/i);
      }, isIpod: function() {
        return !!n.ua.match(/iPod/i);
      }, getScreenPrint: function() {
        return "Current Resolution: " + this.getCurrentResolution() + ", Available Resolution: " + this.getAvailableResolution() + ", Color Depth: " + this.getColorDepth() + ", Device XDPI: " + this.getDeviceXDPI() + ", Device YDPI: " + this.getDeviceYDPI();
      }, getColorDepth: function() {
        return screen.colorDepth;
      }, getCurrentResolution: function() {
        return screen.width + "x" + screen.height;
      }, getAvailableResolution: function() {
        return screen.availWidth + "x" + screen.availHeight;
      }, getDeviceXDPI: function() {
        return screen.deviceXDPI;
      }, getDeviceYDPI: function() {
        return screen.deviceYDPI;
      }, getPlugins: function() {
        for (var a = "", e = 0; e < navigator.plugins.length; e++)
          e == navigator.plugins.length - 1 ? a += navigator.plugins[e].name : a += navigator.plugins[e].name + ", ";
        return a;
      }, isJava: function() {
        return navigator.javaEnabled();
      }, getJavaVersion: function() {
        throw new Error("Please use client.java.js or client.js if you need this functionality!");
      }, isFlash: function() {
        return !!navigator.plugins["Shockwave Flash"];
      }, getFlashVersion: function() {
        throw new Error("Please use client.flash.js or client.js if you need this functionality!");
      }, isSilverlight: function() {
        return !!navigator.plugins["Silverlight Plug-In"];
      }, getSilverlightVersion: function() {
        return this.isSilverlight() ? navigator.plugins["Silverlight Plug-In"].description : "";
      }, isMimeTypes: function() {
        return !(!navigator.mimeTypes || !navigator.mimeTypes.length);
      }, getMimeTypes: function() {
        var a = "";
        if (navigator.mimeTypes)
          for (var e = 0; e < navigator.mimeTypes.length; e++)
            e == navigator.mimeTypes.length - 1 ? a += navigator.mimeTypes[e].description : a += navigator.mimeTypes[e].description + ", ";
        return a;
      }, isFont: function(a) {
        return l.detect(a);
      }, getFonts: function() {
        for (var a = ["Abadi MT Condensed Light", "Adobe Fangsong Std", "Adobe Hebrew", "Adobe Ming Std", "Agency FB", "Aharoni", "Andalus", "Angsana New", "AngsanaUPC", "Aparajita", "Arab", "Arabic Transparent", "Arabic Typesetting", "Arial Baltic", "Arial Black", "Arial CE", "Arial CYR", "Arial Greek", "Arial TUR", "Arial", "Batang", "BatangChe", "Bauhaus 93", "Bell MT", "Bitstream Vera Serif", "Bodoni MT", "Bookman Old Style", "Braggadocio", "Broadway", "Browallia New", "BrowalliaUPC", "Calibri Light", "Calibri", "Californian FB", "Cambria Math", "Cambria", "Candara", "Castellar", "Casual", "Centaur", "Century Gothic", "Chalkduster", "Colonna MT", "Comic Sans MS", "Consolas", "Constantia", "Copperplate Gothic Light", "Corbel", "Cordia New", "CordiaUPC", "Courier New Baltic", "Courier New CE", "Courier New CYR", "Courier New Greek", "Courier New TUR", "Courier New", "DFKai-SB", "DaunPenh", "David", "DejaVu LGC Sans Mono", "Desdemona", "DilleniaUPC", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Engravers MT", "Eras Bold ITC", "Estrangelo Edessa", "EucrosiaUPC", "Euphemia", "Eurostile", "FangSong", "Forte", "FrankRuehl", "Franklin Gothic Heavy", "Franklin Gothic Medium", "FreesiaUPC", "French Script MT", "Gabriola", "Gautami", "Georgia", "Gigi", "Gisha", "Goudy Old Style", "Gulim", "GulimChe", "GungSeo", "Gungsuh", "GungsuhChe", "Haettenschweiler", "Harrington", "Hei S", "HeiT", "Heisei Kaku Gothic", "Hiragino Sans GB", "Impact", "Informal Roman", "IrisUPC", "Iskoola Pota", "JasmineUPC", "KacstOne", "KaiTi", "Kalinga", "Kartika", "Khmer UI", "Kino MT", "KodchiangUPC", "Kokila", "Kozuka Gothic Pr6N", "Lao UI", "Latha", "Leelawadee", "Levenim MT", "LilyUPC", "Lohit Gujarati", "Loma", "Lucida Bright", "Lucida Console", "Lucida Fax", "Lucida Sans Unicode", "MS Gothic", "MS Mincho", "MS PGothic", "MS PMincho", "MS Reference Sans Serif", "MS UI Gothic", "MV Boli", "Magneto", "Malgun Gothic", "Mangal", "Marlett", "Matura MT Script Capitals", "Meiryo UI", "Meiryo", "Menlo", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Sans Serif", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU-ExtB", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "Miriam Fixed", "Miriam", "Mongolian Baiti", "MoolBoran", "NSimSun", "Narkisim", "News Gothic MT", "Niagara Solid", "Nyala", "PMingLiU", "PMingLiU-ExtB", "Palace Script MT", "Palatino Linotype", "Papyrus", "Perpetua", "Plantagenet Cherokee", "Playbill", "Prelude Bold", "Prelude Condensed Bold", "Prelude Condensed Medium", "Prelude Medium", "PreludeCompressedWGL Black", "PreludeCompressedWGL Bold", "PreludeCompressedWGL Light", "PreludeCompressedWGL Medium", "PreludeCondensedWGL Black", "PreludeCondensedWGL Bold", "PreludeCondensedWGL Light", "PreludeCondensedWGL Medium", "PreludeWGL Black", "PreludeWGL Bold", "PreludeWGL Light", "PreludeWGL Medium", "Raavi", "Rachana", "Rockwell", "Rod", "Sakkal Majalla", "Sawasdee", "Script MT Bold", "Segoe Print", "Segoe Script", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Segoe UI", "Shonar Bangla", "Showcard Gothic", "Shruti", "SimHei", "SimSun", "SimSun-ExtB", "Simplified Arabic Fixed", "Simplified Arabic", "Snap ITC", "Sylfaen", "Symbol", "Tahoma", "Times New Roman Baltic", "Times New Roman CE", "Times New Roman CYR", "Times New Roman Greek", "Times New Roman TUR", "Times New Roman", "TlwgMono", "Traditional Arabic", "Trebuchet MS", "Tunga", "Tw Cen MT Condensed Extra Bold", "Ubuntu", "Umpush", "Univers", "Utopia", "Utsaah", "Vani", "Verdana", "Vijaya", "Vladimir Script", "Vrinda", "Webdings", "Wide Latin", "Wingdings"], e = "", t = 0; t < a.length; t++)
          l.detect(a[t]) && (e += t == a.length - 1 ? a[t] : a[t] + ", ");
        return e;
      }, isLocalStorage: function() {
        try {
          return !!g.localStorage;
        } catch {
          return !0;
        }
      }, isSessionStorage: function() {
        try {
          return !!g.sessionStorage;
        } catch {
          return !0;
        }
      }, isCookie: function() {
        return navigator.cookieEnabled;
      }, getTimeZone: function() {
        var a, e;
        return a = /* @__PURE__ */ new Date(), (e = String(-a.getTimezoneOffset() / 60)) < 0 ? "-" + ("0" + (e *= -1)).slice(-2) : "+" + ("0" + e).slice(-2);
      }, getLanguage: function() {
        return navigator.language;
      }, getSystemLanguage: function() {
        return navigator.systemLanguage || window.navigator.language;
      }, isCanvas: function() {
        var a = document.createElement("canvas");
        try {
          return !(!a.getContext || !a.getContext("2d"));
        } catch {
          return !1;
        }
      }, getCanvasPrint: function() {
        var a, e = document.createElement("canvas");
        try {
          a = e.getContext("2d");
        } catch {
          return "";
        }
        var t = "ClientJS,org <canvas> 1.0";
        return a.textBaseline = "top", a.font = "14px 'Arial'", a.textBaseline = "alphabetic", a.fillStyle = "#f60", a.fillRect(125, 1, 62, 20), a.fillStyle = "#069", a.fillText(t, 2, 15), a.fillStyle = "rgba(102, 204, 0, 0.7)", a.fillText(t, 4, 17), e.toDataURL();
      } }, p.ClientJS = k;
    }, function(c, p, d) {
      var n = d(2);
      c.exports = function() {
        return typeof R == "object" && R && R.Math === Math && R.Array === Array ? R : n;
      };
    }, function(c, p, d) {
      typeof self < "u" ? c.exports = self : typeof window < "u" ? c.exports = window : c.exports = Function("return this")();
    }, function(c, p, d) {
      c.exports = function(n, l) {
        var g, M, f, _, k, a, e, t;
        for (g = 3 & n.length, M = n.length - g, f = l, k = 3432918353, a = 461845907, t = 0; t < M; )
          e = 255 & n.charCodeAt(t) | (255 & n.charCodeAt(++t)) << 8 | (255 & n.charCodeAt(++t)) << 16 | (255 & n.charCodeAt(++t)) << 24, ++t, f = 27492 + (65535 & (_ = 5 * (65535 & (f = (f ^= e = (65535 & (e = (e = (65535 & e) * k + (((e >>> 16) * k & 65535) << 16) & 4294967295) << 15 | e >>> 17)) * a + (((e >>> 16) * a & 65535) << 16) & 4294967295) << 13 | f >>> 19)) + ((5 * (f >>> 16) & 65535) << 16) & 4294967295)) + ((58964 + (_ >>> 16) & 65535) << 16);
        switch (e = 0, g) {
          case 3:
            e ^= (255 & n.charCodeAt(t + 2)) << 16;
          case 2:
            e ^= (255 & n.charCodeAt(t + 1)) << 8;
          case 1:
            f ^= e = (65535 & (e = (e = (65535 & (e ^= 255 & n.charCodeAt(t))) * k + (((e >>> 16) * k & 65535) << 16) & 4294967295) << 15 | e >>> 17)) * a + (((e >>> 16) * a & 65535) << 16) & 4294967295;
        }
        return f ^= n.length, f = 2246822507 * (65535 & (f ^= f >>> 16)) + ((2246822507 * (f >>> 16) & 65535) << 16) & 4294967295, f = 3266489909 * (65535 & (f ^= f >>> 13)) + ((3266489909 * (f >>> 16) & 65535) << 16) & 4294967295, (f ^= f >>> 16) >>> 0;
      };
    }, function(c, p, d) {
      var n;
      (function(l, g) {
        var M = "function", f = "undefined", _ = "object", k = "string", a = "major", e = "model", t = "name", i = "type", r = "vendor", s = "version", A = "architecture", O = "console", b = "mobile", h = "tablet", I = "smarttv", j = "wearable", Q = "embedded", q = "Amazon", H = "Apple", se = "ASUS", ce = "BlackBerry", ye = "Firefox", W = "Google", le = "Huawei", D = "LG", ee = "Microsoft", ue = "Motorola", xe = "Opera", ie = "Samsung", de = "Sharp", K = "Sony", te = "Xiaomi", ne = "Zebra", ge = "Facebook", he = "Chromium OS", we = "Mac OS", Y = function(x) {
          for (var S = {}, w = 0; w < x.length; w++)
            S[x[w].toUpperCase()] = x[w];
          return S;
        }, me = function(x, S) {
          return typeof x === k && G(S).indexOf(G(x)) !== -1;
        }, G = function(x) {
          return x.toLowerCase();
        }, re = function(x, S) {
          if (typeof x === k)
            return x = x.replace(/^\s\s*/, ""), typeof S === f ? x : x.substring(0, 350);
        }, J = function(x, S) {
          for (var w, P, U, v, N, u, T = 0; T < S.length && !N; ) {
            var z = S[T], L = S[T + 1];
            for (w = P = 0; w < z.length && !N && z[w]; )
              if (N = z[w++].exec(x))
                for (U = 0; U < L.length; U++)
                  u = N[++P], typeof (v = L[U]) === _ && v.length > 0 ? v.length === 2 ? typeof v[1] == M ? this[v[0]] = v[1].call(this, u) : this[v[0]] = v[1] : v.length === 3 ? typeof v[1] !== M || v[1].exec && v[1].test ? this[v[0]] = u ? u.replace(v[1], v[2]) : g : this[v[0]] = u ? v[1].call(this, u, v[2]) : g : v.length === 4 && (this[v[0]] = u ? v[3].call(this, u.replace(v[1], v[2])) : g) : this[v] = u || g;
            T += 2;
          }
        }, ae = function(x, S) {
          for (var w in S)
            if (typeof S[w] === _ && S[w].length > 0) {
              for (var P = 0; P < S[w].length; P++)
                if (me(S[w][P], x))
                  return w === "?" ? g : w;
            } else if (me(S[w], x))
              return w === "?" ? g : w;
          return x;
        }, be = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, pe = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [s, [t, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [s, [t, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [t, s], [/opios[\/ ]+([\w\.]+)/i], [s, [t, "Opera Mini"]], [/\bopr\/([\w\.]+)/i], [s, [t, xe]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [t, s], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [s, [t, "UCBrowser"]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [s, [t, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [s, [t, "WeChat"]], [/konqueror\/([\w\.]+)/i], [s, [t, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [s, [t, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [s, [t, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[t, /(.+)/, "$1 Secure Browser"], s], [/\bfocus\/([\w\.]+)/i], [s, [t, "Firefox Focus"]], [/\bopt\/([\w\.]+)/i], [s, [t, "Opera Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [s, [t, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [s, [t, "Dolphin"]], [/coast\/([\w\.]+)/i], [s, [t, "Opera Coast"]], [/miuibrowser\/([\w\.]+)/i], [s, [t, "MIUI Browser"]], [/fxios\/([-\w\.]+)/i], [s, [t, ye]], [/\bqihu|(qi?ho?o?|360)browser/i], [[t, "360 Browser"]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[t, /(.+)/, "$1 Browser"], s], [/(comodo_dragon)\/([\w\.]+)/i], [[t, /_/g, " "], s], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [t, s], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [t], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[t, ge], s], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [t, s], [/\bgsa\/([\w\.]+) .*safari\//i], [s, [t, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [s, [t, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [s, [t, "Chrome Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[t, "Chrome WebView"], s], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [s, [t, "Android Browser"]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [t, s], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [s, [t, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [s, t], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [t, [s, ae, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [t, s], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[t, "Netscape"], s], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [s, [t, "Firefox Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [t, s], [/(cobalt)\/([\w\.]+)/i], [t, [s, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[A, "amd64"]], [/(ia32(?=;))/i], [[A, G]], [/((?:i[346]|x)86)[;\)]/i], [[A, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[A, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[A, "armhf"]], [/windows (ce|mobile); ppc;/i], [[A, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[A, /ower/, "", G]], [/(sun4\w)[;\)]/i], [[A, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[A, G]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [e, [r, ie], [i, h]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [e, [r, ie], [i, b]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [e, [r, H], [i, b]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [e, [r, H], [i, h]], [/(macintosh);/i], [e, [r, H]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [e, [r, de], [i, b]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [e, [r, le], [i, h]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [e, [r, le], [i, b]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[e, /_/g, " "], [r, te], [i, b]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[e, /_/g, " "], [r, te], [i, h]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [e, [r, "OPPO"], [i, b]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [e, [r, "Vivo"], [i, b]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [e, [r, "Realme"], [i, b]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [e, [r, ue], [i, b]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [e, [r, ue], [i, h]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [e, [r, D], [i, h]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [e, [r, D], [i, b]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [e, [r, "Lenovo"], [i, h]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[e, /_/g, " "], [r, "Nokia"], [i, b]], [/(pixel c)\b/i], [e, [r, W], [i, h]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [e, [r, W], [i, b]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [e, [r, K], [i, b]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[e, "Xperia Tablet"], [r, K], [i, h]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [e, [r, "OnePlus"], [i, b]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [e, [r, q], [i, h]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[e, /(.+)/g, "Fire Phone $1"], [r, q], [i, b]], [/(playbook);[-\w\),; ]+(rim)/i], [e, r, [i, h]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [e, [r, ce], [i, b]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [e, [r, se], [i, h]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [e, [r, se], [i, b]], [/(nexus 9)/i], [e, [r, "HTC"], [i, h]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [r, [e, /_/g, " "], [i, b]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [e, [r, "Acer"], [i, h]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [e, [r, "Meizu"], [i, b]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [r, e, [i, b]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [r, e, [i, h]], [/(surface duo)/i], [e, [r, ee], [i, h]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [e, [r, "Fairphone"], [i, b]], [/(u304aa)/i], [e, [r, "AT&T"], [i, b]], [/\bsie-(\w*)/i], [e, [r, "Siemens"], [i, b]], [/\b(rct\w+) b/i], [e, [r, "RCA"], [i, h]], [/\b(venue[\d ]{2,7}) b/i], [e, [r, "Dell"], [i, h]], [/\b(q(?:mv|ta)\w+) b/i], [e, [r, "Verizon"], [i, h]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [e, [r, "Barnes & Noble"], [i, h]], [/\b(tm\d{3}\w+) b/i], [e, [r, "NuVision"], [i, h]], [/\b(k88) b/i], [e, [r, "ZTE"], [i, h]], [/\b(nx\d{3}j) b/i], [e, [r, "ZTE"], [i, b]], [/\b(gen\d{3}) b.+49h/i], [e, [r, "Swiss"], [i, b]], [/\b(zur\d{3}) b/i], [e, [r, "Swiss"], [i, h]], [/\b((zeki)?tb.*\b) b/i], [e, [r, "Zeki"], [i, h]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[r, "Dragon Touch"], e, [i, h]], [/\b(ns-?\w{0,9}) b/i], [e, [r, "Insignia"], [i, h]], [/\b((nxa|next)-?\w{0,9}) b/i], [e, [r, "NextBook"], [i, h]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[r, "Voice"], e, [i, b]], [/\b(lvtel\-)?(v1[12]) b/i], [[r, "LvTel"], e, [i, b]], [/\b(ph-1) /i], [e, [r, "Essential"], [i, b]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [e, [r, "Envizen"], [i, h]], [/\b(trio[-\w\. ]+) b/i], [e, [r, "MachSpeed"], [i, h]], [/\btu_(1491) b/i], [e, [r, "Rotor"], [i, h]], [/(shield[\w ]+) b/i], [e, [r, "Nvidia"], [i, h]], [/(sprint) (\w+)/i], [r, e, [i, b]], [/(kin\.[onetw]{3})/i], [[e, /\./g, " "], [r, ee], [i, b]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [e, [r, ne], [i, h]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [e, [r, ne], [i, b]], [/smart-tv.+(samsung)/i], [r, [i, I]], [/hbbtv.+maple;(\d+)/i], [[e, /^/, "SmartTV"], [r, ie], [i, I]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[r, D], [i, I]], [/(apple) ?tv/i], [r, [e, "Apple TV"], [i, I]], [/crkey/i], [[e, "Chromecast"], [r, W], [i, I]], [/droid.+aft(\w)( bui|\))/i], [e, [r, q], [i, I]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [e, [r, de], [i, I]], [/(bravia[\w ]+)( bui|\))/i], [e, [r, K], [i, I]], [/(mitv-\w{5}) bui/i], [e, [r, te], [i, I]], [/Hbbtv.*(technisat) (.*);/i], [r, e, [i, I]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[r, re], [e, re], [i, I]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[i, I]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [r, e, [i, O]], [/droid.+; (shield) bui/i], [e, [r, "Nvidia"], [i, O]], [/(playstation [345portablevi]+)/i], [e, [r, K], [i, O]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [e, [r, ee], [i, O]], [/((pebble))app/i], [r, e, [i, j]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [e, [r, H], [i, j]], [/droid.+; (glass) \d/i], [e, [r, W], [i, j]], [/droid.+; (wt63?0{2,3})\)/i], [e, [r, ne], [i, j]], [/(quest( 2| pro)?)/i], [e, [r, ge], [i, j]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [r, [i, Q]], [/(aeobc)\b/i], [e, [r, q], [i, Q]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [e, [i, b]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [e, [i, h]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[i, h]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[i, b]], [/(android[-\w\. ]{0,9});.+buil/i], [e, [r, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [s, [t, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [s, [t, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [t, s], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [s, t]], os: [[/microsoft (windows) (vista|xp)/i], [t, s], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [t, [s, ae, be]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[t, "Windows"], [s, ae, be]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[s, /_/g, "."], [t, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[t, we], [s, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [s, t], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [t, s], [/\(bb(10);/i], [s, [t, ce]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [s, [t, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [s, [t, "Firefox OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [s, [t, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [s, [t, "watchOS"]], [/crkey\/([\d\.]+)/i], [s, [t, "Chromecast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[t, he], s], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [t, s], [/(sunos) ?([\w\.\d]*)/i], [[t, "Solaris"], s], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [t, s]] }, E = function(x, S) {
          if (typeof x === _ && (S = x, x = g), !(this instanceof E))
            return new E(x, S).getResult();
          var w = typeof l !== f && l.navigator ? l.navigator : g, P = x || (w && w.userAgent ? w.userAgent : ""), U = w && w.userAgentData ? w.userAgentData : g, v = S ? function(u, T) {
            var z = {};
            for (var L in u)
              T[L] && T[L].length % 2 == 0 ? z[L] = T[L].concat(u[L]) : z[L] = u[L];
            return z;
          }(pe, S) : pe, N = w && w.userAgent == P;
          return this.getBrowser = function() {
            var u, T = {};
            return T.name = g, T.version = g, J.call(T, P, v.browser), T.major = typeof (u = T.version) === k ? u.replace(/[^\d\.]/g, "").split(".")[0] : g, N && w && w.brave && typeof w.brave.isBrave == M && (T.name = "Brave"), T;
          }, this.getCPU = function() {
            var u = {};
            return u.architecture = g, J.call(u, P, v.cpu), u;
          }, this.getDevice = function() {
            var u = {};
            return u.vendor = g, u.model = g, u.type = g, J.call(u, P, v.device), N && !u.type && U && U.mobile && (u.type = b), N && u.model == "Macintosh" && w && typeof w.standalone !== f && w.maxTouchPoints && w.maxTouchPoints > 2 && (u.model = "iPad", u.type = h), u;
          }, this.getEngine = function() {
            var u = {};
            return u.name = g, u.version = g, J.call(u, P, v.engine), u;
          }, this.getOS = function() {
            var u = {};
            return u.name = g, u.version = g, J.call(u, P, v.os), N && !u.name && U && U.platform != "Unknown" && (u.name = U.platform.replace(/chrome os/i, he).replace(/macos/i, we)), u;
          }, this.getResult = function() {
            return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
          }, this.getUA = function() {
            return P;
          }, this.setUA = function(u) {
            return P = typeof u === k && u.length > 350 ? re(u, 350) : u, this;
          }, this.setUA(P), this;
        };
        E.VERSION = "1.0.35", E.BROWSER = Y([t, s, a]), E.CPU = Y([A]), E.DEVICE = Y([e, r, i, O, b, I, h, j, Q]), E.ENGINE = E.OS = Y([t, s]), typeof p !== f ? (typeof c !== f && c.exports && (p = c.exports = E), p.UAParser = E) : d(5) ? (n = (function() {
          return E;
        }).call(p, d, p, c)) === g || (c.exports = n) : typeof l !== f && (l.UAParser = E);
        var F = typeof l !== f && (l.jQuery || l.Zepto);
        if (F && !F.ua) {
          var Z = new E();
          F.ua = Z.getResult(), F.ua.get = function() {
            return Z.getUA();
          }, F.ua.set = function(x) {
            Z.setUA(x);
            var S = Z.getResult();
            for (var w in S)
              F.ua[w] = S[w];
          };
        }
      })(typeof window == "object" ? window : this);
    }, function(c, p) {
      (function(d) {
        c.exports = d;
      }).call(this, {});
    }, function(c, p) {
      c.exports = function() {
        var d = ["monospace", "sans-serif", "serif"], n = document.getElementsByTagName("body")[0], l = document.createElement("span");
        l.style.fontSize = "72px", l.innerHTML = "mmmmmmmmmmlli";
        var g = {}, M = {};
        for (var f in d)
          l.style.fontFamily = d[f], n.appendChild(l), g[d[f]] = l.offsetWidth, M[d[f]] = l.offsetHeight, n.removeChild(l);
        this.detect = function(_) {
          var k = !1;
          for (var a in d) {
            l.style.fontFamily = _ + "," + d[a], n.appendChild(l);
            var e = l.offsetWidth != g[d[a]] || l.offsetHeight != M[d[a]];
            n.removeChild(l), k = k || e;
          }
          return k;
        };
      };
    }]);
  });
})(ve);
var Me = ve.exports;
const y = class y {
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
      is_mobile: this.isMobile()
    };
  }
};
m(y, "deviceFingerprint", () => y._clientJS().getFingerprint()), m(y, "userAgent", () => y._clientJS().getUserAgent()), m(y, "browser", () => y._clientJS().getBrowser()), m(y, "browserVersion", () => y._clientJS().getBrowserVersion()), m(y, "os", () => y._clientJS().getOS()), m(y, "osVersion", () => y._clientJS().getOSVersion()), m(y, "device", () => y._clientJS().getDevice()), m(y, "deviceType", () => y._clientJS().getDeviceType()), m(y, "timeZone", () => y._clientJS().getTimeZone()), m(y, "language", () => y._clientJS().getLanguage()), m(y, "isMobile", () => y._clientJS().isMobile()), m(y, "_clientJS", () => (y._clientJSInstance || (y._clientJSInstance = new Me.ClientJS()), y._clientJSInstance));
let $ = y;
const Pe = "0.0.126", Te = "@swishjam/core", Ie = "The official Swishjam JS client to instrument your webpages with.", Be = "https://swishjam.com", Ee = {
  type: "git",
  url: "https://github.com/swishjam/swishjam/tree/main/sdk/client/npm"
}, _e = "src/swishjam.mjs", Ae = {}, Ue = "", Le = "ISC", Ne = {
  jest: "^29.6.2",
  "jest-environment-jsdom": "^29.6.2"
}, je = {
  "@swishjam/clientjs": "^0.2.1"
}, Oe = {
  version: Pe,
  name: Te,
  description: Ie,
  homepage: Be,
  repository: Ee,
  main: _e,
  scripts: Ae,
  author: Ue,
  license: Le,
  devDependencies: Ne,
  dependencies: je
}, { version: oe } = Oe;
class ze {
  constructor(o, c) {
    this.eventName = o, this.uuid = X.generate(`e-${Date.now()}`), this.ts = Date.now(), this.sessionId = V.get("sessionId"), this.pageViewId = V.get("pageViewId"), this.fingerprint = $.deviceFingerprint(), this.url = window.location.href, this.data = c;
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
      source: "web",
      ...this.data,
      sdk_version: oe
    };
  }
}
class Ve {
  constructor(o = {}) {
    m(this, "getData", () => this.data);
    m(this, "recordEvent", async (o, c) => {
      const p = new ze(o, c);
      return this.data.push(p.toJSON()), this.data.length >= this.maxSize && await this._reportDataIfNecessary(), p;
    });
    m(this, "flushQueue", async () => await this._reportDataIfNecessary());
    m(this, "_initHeartbeat", () => {
      setInterval(async () => {
        await this._reportDataIfNecessary();
      }, this.heartbeatMs);
    });
    m(this, "_reportDataIfNecessary", async () => {
      try {
        if (this.data.length === 0 || this.numFailedReports >= this.maxNumFailedReports)
          return;
        (await fetch(this.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Swishjam-Api-Key": this.apiKey
          },
          body: JSON.stringify(this.data)
        })).ok ? this.data = [] : this.numFailedReports += 1;
      } catch {
        this.numFailedReports += 1;
      }
    });
    this.data = [], this.numFailedReports = 0, this.apiEndpoint = o.apiEndpoint, this.apiKey = o.apiKey, this.maxSize = o.maxSize || 20, this.heartbeatMs = o.heartbeatMs || 1e4, this.maxNumFailedReports = o.maxNumFailedReports || 3, this._initHeartbeat();
  }
}
class Fe {
  constructor(o = {}) {
    m(this, "record", (o, c) => this.eventManager.recordEvent(o, c));
    m(this, "identify", (o, c) => (this._extractOrganizationFromIdentifyCall(c), this.record("identify", { userIdentifier: o, ...c })));
    m(this, "setOrganization", (o, c = {}) => {
      const p = V.get("organizationId");
      V.set("organizationId", o), p !== o && this.newSession(), this.record("organization", { organizationIdentifier: o, ...c });
    });
    m(this, "getSession", () => V.get("sessionId"));
    m(this, "newSession", ({ registerPageView: o = !0 }) => (V.set("sessionId", X.generate("s")), this.record("new_session", {
      referrer: this.pageViewManager.previousUrl(),
      ...$.all()
    }), o && this.pageViewManager.recordPageView(), this.getSession()));
    m(this, "_extractOrganizationFromIdentifyCall", (o) => {
      const { organization: c, org: p } = o;
      if (c || p) {
        const d = c || p, { organizationIdentifier: n, orgIdentifier: l, identifier: g, organizationId: M, orgId: f, id: _ } = d, k = n || l || g || M || f || _;
        let a = {};
        Object.keys(d).forEach((e) => {
          ["organizationIdentifier", "orgIdentifier", "identifier", "organizationId", "orgId", "id"].includes(e) || (a[e] = d[e]);
        }), this.setOrganization(k, a);
      }
    });
    m(this, "_initPageViewListeners", () => {
      this.pageViewManager.onNewPage((o, c) => {
        V.set("pageViewId", X.generate("pv")), this.eventManager.recordEvent("page_view", { referrer: c });
      }), window.addEventListener("pagehide", async () => {
        this.eventManager.recordEvent("page_left"), await this.eventManager.flushQueue();
      }), this.pageViewManager.recordPageView();
    });
    m(this, "_setConfig", (o) => {
      if (!o.apiKey)
        throw new Error("Swishjam `apiKey` is required");
      const c = ["apiKey", "apiEndpoint", "maxEventsInMemory", "reportingHeartbeatMs", "debug"];
      return Object.keys(o).forEach((p) => {
        c.includes(p) || console.warn(`SwishjamJS received unrecognized config: ${p}`);
      }), {
        version: oe,
        apiKey: o.apiKey,
        apiEndpoint: o.apiEndpoint || "https://api2.swishjam.com/api/v1/capture",
        maxEventsInMemory: o.maxEventsInMemory || 20,
        reportingHeartbeatMs: o.reportingHeartbeatMs || 1e4,
        debug: typeof o.debug == "boolean" ? o.debug : !1
      };
    });
    this.config = this._setConfig(o), this.eventManager = new Ve(this.config), this.pageViewManager = new Ce(), this.getSession() || this.newSession({ registerPageView: !1 }), this._initPageViewListeners(), console.log("SwishjamJS Version:", oe);
  }
}
const C = class C {
};
m(C, "init", (o = {}) => window.Swishjam && window.Swishjam._client ? window.Swishjam : (C._client = new Fe(o), C.config = C._client.config, window.Swishjam = C, C)), m(C, "event", (o, c) => C._client.record(o, c)), m(C, "identify", (o, c) => C._client.identify(o, c)), m(C, "setOrganization", (o, c) => C._client.setOrganization(o, c)), m(C, "getSession", () => C._client.getSession()), m(C, "newSession", () => C._client.newSession());
let fe = C;
export {
  fe as default
};
