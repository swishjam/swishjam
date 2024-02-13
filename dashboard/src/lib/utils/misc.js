export const safelyParseURL = url => {
  try {
    return new URL(url)
  } catch (err) {
    return {}
  }
}

export const humanizeVariable = variableName => {
  return variableName.split('_').map(w => `${w[0].toUpperCase()}${w.slice(1, w.length)}`).join(' ')
}