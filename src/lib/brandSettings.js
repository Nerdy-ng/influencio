// Brand settings utility — reads/writes logo slots from localStorage
// Components use getLogo(slot) to read; admin panel uses setLogo(slot, url) to write.
// A 'brandior:logo-updated' custom event is dispatched so components update live.

export const LOGO_SLOTS = {
  header:  { key: 'brandior_logo_header',  label: 'Header / Navbar Logo' },
  footer:  { key: 'brandior_logo_footer',  label: 'Footer Logo' },
  auth:    { key: 'brandior_logo_auth',    label: 'Login & Signup Logo' },
}

export function getLogo(slot) {
  const config = LOGO_SLOTS[slot]
  if (!config) return ''
  return localStorage.getItem(config.key) || ''
}

export function setLogo(slot, url) {
  const config = LOGO_SLOTS[slot]
  if (!config) return
  if (url) {
    localStorage.setItem(config.key, url)
  } else {
    localStorage.removeItem(config.key)
  }
  window.dispatchEvent(new CustomEvent('brandior:logo-updated', { detail: { slot } }))
}

export function removeLogo(slot) {
  setLogo(slot, '')
}
