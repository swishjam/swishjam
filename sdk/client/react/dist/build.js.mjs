import { createContext as c, useContext as m, useState as w, useEffect as u } from "react";
const e = c(), d = () => m(e), h = ({ apiKey: n, apiEndpoint: i, children: s }) => {
  const [t, o] = w();
  return u(() => {
    (async () => {
      if (typeof window < "u" && !t) {
        const a = (await import("./swishjam-0ff231fb.mjs")).default, r = new a({ apiKey: n, apiEndpoint: i });
        return o(r), t;
      }
    })();
  }, []), /* @__PURE__ */ React.createElement(e.Provider, { value: t }, s);
};
export {
  e as SwishjamContext,
  h as SwishjamProvider,
  d as useSwishjam
};
