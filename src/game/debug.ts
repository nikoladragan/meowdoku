// Dev-only switches, active only when import.meta.env.DEV is true.
const params = new URLSearchParams(import.meta.env.DEV && typeof window !== 'undefined' ? window.location.search : '')

export const debugCats = params.has('debug')
export const debugArt = params.has('art')

// ?date=YYYY-MM-DD makes the app treat that date as today.
const date = params.get('date')
export const debugDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null
