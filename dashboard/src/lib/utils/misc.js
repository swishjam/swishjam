export const safelyParseURL = url => {
  try {
    return new URL(url)
  } catch (err) {
    return {}
  }
}

export const humanizeVariable = variableName => {
  try {
    // unless every letter is capitalized
    if (variableName === variableName.toUpperCase()) {
      return variableName
        .split('_')
        .map(w => `${w[0].toUpperCase()}${w.slice(1, w.length)}`)
        .join(' ')
    } else {
      return variableName
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim()
        .split(/\s+/)
        .map(w => `${w[0].toUpperCase()}${w.slice(1, w.length)}`)
        .join(' ')
    }
  } catch (err) {
    return variableName;
  }
}