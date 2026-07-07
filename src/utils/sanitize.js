const INJECTION_CHARS = /[<>{}\\`]/g

export function stripInjection(text) {
  return text.replace(INJECTION_CHARS, '')
}
