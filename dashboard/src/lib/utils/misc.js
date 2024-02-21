export const safelyParseURL = url => {
  try {
    return new URL(url)
  } catch (err) {
    return {}
  }
}

export const humanizeVariable = variableName => {
  try {
    return variableName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(/\s+/)
      .map(w => `${w[0].toUpperCase()}${w.slice(1, w.length)}`)
      .join(' ')
  } catch (err) {
    return variableName;
  }
}