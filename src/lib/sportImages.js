// Centralized, stable image mapping for every sport across VISION.
// All URLs are direct Unsplash CDN links (free to use, no watermark, no logos).
// Each sport has multiple images so the same card photo doesn't repeat for
// every activity of that sport — getSportImage() picks one deterministically
// based on a seed (e.g. the activity/route id) so the same item always shows
// the same image, while different items of the same sport vary.

export const SPORT_IMAGES = {
  Run: [
    'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800&q=80',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
    'https://images.unsplash.com/photo-1473041989931-c5f15c7bc1a5?w=800&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    'https://images.unsplash.com/photo-1535743686920-55e4145369b9?w=800&q=80',
  ],
  Ride: [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
    'https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?w=800&q=80',
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80',
    'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&q=80',
    'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=800&q=80',
  ],
  Hike: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80',
  ],
  Walk: [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&q=80',
    'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800&q=80',
    'https://images.unsplash.com/photo-1465310477141-6fb93167a273?w=800&q=80',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80',
  ],
  Swim: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
    'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&q=80',
    'https://images.unsplash.com/photo-1518911710364-17ec553bde5d?w=800&q=80',
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80',
  ],
  Gym: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=800&q=80',
    'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  ],
  Yoga: [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  ],
  Ski: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80',
    'https://images.unsplash.com/photo-1486078695445-0497c2f58cfe?w=800&q=80',
  ],
  Climb: [
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&q=80',
    'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80',
  ],
  Recovery: [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800&q=80',
  ],
}

// Lowercase / alternate-spelling aliases so any naming convention used across
// the app (AddActivity's lowercase keys, sport filter labels, etc.) resolves.
const ALIASES = {
  running: 'Run', run: 'Run',
  cycling: 'Ride', riding: 'Ride', ride: 'Ride', bike: 'Ride', biking: 'Ride',
  hiking: 'Hike', hike: 'Hike', trail: 'Hike', trailrunning: 'Hike',
  walking: 'Walk', walk: 'Walk',
  swimming: 'Swim', swim: 'Swim',
  gym: 'Gym', strength: 'Gym', weights: 'Gym', workout: 'Gym',
  yoga: 'Yoga',
  skiing: 'Ski', ski: 'Ski',
  climbing: 'Climb', climb: 'Climb', triathlon: 'Climb',
  recovery: 'Recovery', stretching: 'Recovery', rest: 'Recovery',
}

// Generic premium fallback used when the sport type is unknown or missing.
export const DEFAULT_SPORT_IMAGE = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'

function hashSeed(seed) {
  const str = String(seed ?? '')
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Returns a sport-appropriate image URL. Pass a `seed` (e.g. activity._id,
 * route._id, or any stable identifier) so the same item always renders the
 * same image, while different items of the same sport show variety.
 * Without a seed, the first image for that sport is returned.
 */
export function getSportImage(sportType, seed) {
  const key = sportType ? (ALIASES[sportType.toLowerCase()] || sportType) : null
  const list = SPORT_IMAGES[key]
  if (!list || list.length === 0) return DEFAULT_SPORT_IMAGE
  if (seed === undefined || seed === null) return list[0]
  return list[hashSeed(seed) % list.length]
}
