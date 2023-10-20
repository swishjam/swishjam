export const safelyParseURL = url => {
  try {
    return new URL(url)
  } catch (err) {
    return {}
  }
}