export const safelyParseURL = url => {
  try {
    return new URL(url)
  } catch (err) {
    return {}
  }
}

const CAPITALIZED_WORDS = ['OS', 'UTM', 'URL', 'GCLID', 'ID']
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
        .replace(/([A-Z][a-z])/g, ' $1') // Only add a space before a capital letter if it is followed by a lowercase letter
        .replace(/_|\./g, ' ')
        .trim()
        .split(/\s+/)
        .map(w => CAPITALIZED_WORDS.includes(w.toUpperCase()) ? w.toUpperCase() : `${w[0].toUpperCase()}${w.slice(1, w.length)}`)
        .join(' ')
    }
  } catch (err) {
    return variableName;
  }
}

export const caseInsensitiveSortedArray = array => {
  return array.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
}

export const isURL = url => {
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}