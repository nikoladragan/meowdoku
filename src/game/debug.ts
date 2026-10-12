// Dev-only switches, active only when import.meta.env.DEV is true.
const params = new URLSearchParams(import.meta.env.DEV ? window.location.search : '')

export const debugCats = params.has('debug')
export const debugArt = params.has('art')
