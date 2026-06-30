import { getUserInitials, getAvatarSrc, getAvatarColor } from '../lib/avatar'

/* Reusable identity avatar. If the user has an uploaded photo, show it.
   Otherwise render a local initials badge — never a random stock or
   another user's photo. Demo/seed users may carry curated `avatarUrl`s
   (see src/lib/demoUsers.js) and render through the same "photo" path. */
export default function Avatar({ user, size = 40, style, border, onClick }) {
  const src = getAvatarSrc(user)
  const common = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    border: border || 'none', cursor: onClick ? 'pointer' : 'default',
    ...style,
  }

  if (src) {
    return (
      <img
        src={src}
        alt={user?.fullName || user?.username || 'User'}
        onClick={onClick}
        style={{ ...common, objectFit: 'cover' }}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex') }}
      />
    )
  }

  return (
    <div
      onClick={onClick}
      style={{
        ...common,
        background: getAvatarColor(user),
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: Math.max(11, size * 0.36), fontFamily: 'inherit',
        letterSpacing: '.02em',
      }}
    >
      {getUserInitials(user)}
    </div>
  )
}
