const evalSdkMethod = (method, ...args) => {
  if (typeof window !== 'undefined') {
    if (window.Swishjam) {
      return window.Swishjam[method](...args)
    } else if (['event', 'identify', 'setOrganization', 'logout'].includes(method)) {
      window.swishjamEvents = (window.swishjamEvents || []).concat([{ method, args }])
    }
  }
}

export const swishjam = {
  event: (name, attrs = {}) => evalSdkMethod('event', name, attrs),
  identify: (identifier, attrs = {}) => evalSdkMethod('identify', identifier, attrs),
  setOrganization: (identifier, attrs = {}) => evalSdkMethod('setOrganization', identifier, attrs),
  newSession: () => evalSdkMethod('newSession'),
  logout: () => evalSdkMethod('logout'),
  getSession: () => evalSdkMethod('getSession'),
}