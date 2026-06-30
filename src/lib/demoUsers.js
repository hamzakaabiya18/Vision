/* Centralized, curated demo/seed identities. Each persona has a distinct,
   sport-matched photo — never a generic shared default, never repeated
   across personas. Used to seed an empty feed/inbox for new accounts so
   the app doesn't look bare before a user has real connections. */
export const DEMO_FEED_USERS = {
  runner:    { username:'marcus_runs',  fullName:'Marcus Chen',    avatarUrl:'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80',  verified:true  },
  cyclist:   { username:'sara_cycles',  fullName:'Sara Valeri',    avatarUrl:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80', verified:true  },
  hiker:     { username:'leo_trails',   fullName:'Leo Brooks',     avatarUrl:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80', verified:false },
  swimmer:   { username:'nadia_tri',    fullName:'Nadia Kowalski', avatarUrl:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80', verified:true  },
  gymAthlete:{ username:'james_lifts',  fullName:'James Okafor',   avatarUrl:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80', verified:false },
}

export const DEMO_CONVERSATION_PEOPLE = [
  { _id:'demo1', fullName:'Running Mentor',   username:'running_mentor',   avatarUrl:'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=80&q=80',  isDemo:true, last:'Ask me anything about pacing and training plans.' },
  { _id:'demo2', fullName:'Cycling Partner',  username:'cycling_partner',  avatarUrl:'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=80&q=80', isDemo:true, last:'Looking for a ride buddy this weekend?' },
  { _id:'demo3', fullName:'Recovery Advisor', username:'recovery_advisor', avatarUrl:'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=80&q=80', isDemo:true, last:'Remember — rest days build fitness too.' },
]
