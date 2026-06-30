import { getSportImage, DEFAULT_SPORT_IMAGE } from './sportImages'

/* Single source of truth for "what image should this activity card show".
   Priority:
   1. activity.imageUrl   — the user's own uploaded/selected photo
   2. activity.photoUrl   — alias, in case older records used this field
   3. sport-specific fallback (deterministic by activity id, so it never
      changes between renders and never pulls from another activity)
   4. generic default placeholder
   This never reads anything from another user's activity — fallbacks are
   sport-scene stock photos, not personal photos. */
export function getActivityImage(activity) {
  if (!activity) return DEFAULT_SPORT_IMAGE
  if (activity.imageUrl)  return activity.imageUrl
  if (activity.photoUrl)  return activity.photoUrl
  if (activity.media?.[0]?.url) return activity.media[0].url
  return getSportImage(activity.sportType, activity._id) || DEFAULT_SPORT_IMAGE
}
