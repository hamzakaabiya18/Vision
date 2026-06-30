/* Entry Mode is purely a UI routing hint chosen on the login/signup screen.
   It is NEVER itself a permission — real permission always comes from the
   authenticated user's `role` field in the database, re-checked by
   AppLayout after login and enforced again server-side on every
   protected route. */
export const ENTRY_MODE_KEY = 'vision_entry_mode'

export const ENTRY_MODES = [
  { id:'athlete',    label:'Registered Athlete', desc:'Full VISION experience — feed, groups, stats, messages.' },
  { id:'groupOwner', label:'Group Owner',        desc:'Manage your groups and members.' },
  { id:'admin',      label:'Admin',              desc:'Platform dashboard & analytics.' },
  { id:'coachbot',   label:'VISION Coach Bot',   desc:'Chat with HAMZA, ASALA & MAY.' },
  { id:'guest',      label:'Guest',              desc:'Browse public content — no account needed.' },
]
