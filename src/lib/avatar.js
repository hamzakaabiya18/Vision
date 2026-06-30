/* Single source of truth for "what initials represent this user" and for
   rendering a consistent local (non-network) initials avatar — so a brand
   new user never shows a random/unrelated photo before they upload one. */
export function getUserInitials(user) {
  const name = (user?.fullName || user?.name || '').trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  const username = (user?.username || '').trim()
  if (username) return username.slice(0, 2).toUpperCase()
  return 'VI'
}

const PALETTE = ['#008080', '#0077aa', '#5a7a3a', '#7b2cbf', '#d4560a', '#0055aa', '#9c6fd6', '#1a6bb5']
function colorFor(seed) {
  const str = String(seed || '')
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return PALETTE[Math.abs(h) % PALETTE.length]
}

/* Avatar priority: uploaded photo > local initials. Never falls back to a
   random stock/personal-looking photo for a real user. */
export function getAvatarSrc(user) {
  return user?.avatarUrl || user?.photoURL || user?.profileImage || null
}

export function getAvatarColor(user) {
  return colorFor(user?._id || user?.id || user?.username || user?.fullName)
}
