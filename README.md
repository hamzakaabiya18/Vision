# VISION — Athletic Intelligence

A premium social fitness platform built with Next.js 14, Express.js, MongoDB, Socket.io, D3.js, and React.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, CSS Modules |
| Backend | Express.js + Node.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.io WebSockets |
| Charts | D3.js (bar chart, line chart) |
| Legacy Ajax | jQuery Ajax (course requirement) |
| React Video | `<VideoHero>` — HTML5 video with overlay controls |
| React Canvas | `<RouteCanvas>` — GPS route drawn to Canvas |
| GPS Tracking | `navigator.geolocation.watchPosition` + Haversine formula |
| Font | Inter (Google Fonts via `next/font/google`) |

---

## Project Structure

```
Vision/
├── app/
│   ├── layout.js           # Inter font, root layout
│   ├── page.js             # Auth gate (Login → App)
│   ├── globals.css         # CSS3: text-shadow, transitions, @font-face, border-radius, columns
│   └── api/users/route.js  # Next.js API route (22 seeded athletes)
├── components/
│   ├── Icons.js            # 30+ inline SVG icons (no emoji)
│   ├── Login.js            # Animated circles login screen
│   ├── SignUp.js           # 3-step onboarding
│   ├── AppLayout.js        # Bottom nav (7 tabs), jQuery loader
│   ├── VideoHero.js        # React Video component
│   ├── RouteCanvas.js      # React Canvas component (GPS route)
│   └── tabs/
│       ├── Home.js         # Activity feed, stories, achievements
│       ├── Explore.js      # User discovery, routes, clubs
│       ├── AddActivity.js  # GPS live tracker (Haversine, SVG route)
│       ├── Messages.js     # Real-time chat (Socket.io)
│       ├── Groups.js       # Groups CRUD (jQuery Ajax search)
│       ├── Stats.js        # D3.js bar + line charts, leaderboard
│       └── Profile.js      # Profile, activity log, stats, badges
├── context/
│   └── AuthContext.js      # JWT auth context
├── lib/
│   ├── api.js              # Fetch-based API client
│   ├── socket.js           # Socket.io client
│   └── ajaxClient.js       # jQuery Ajax helper
└── server/
    ├── server.js           # Express + Socket.io entry point
    ├── config/db.js        # MongoDB connection
    ├── models/
    │   ├── User.js         # username, email, bcrypt password, sportTags, followers/following
    │   ├── Activity.js     # sportType, distanceKm, routePoints, likes, comments
    │   ├── Group.js        # name, sportType, members, admin, privacy
    │   ├── Comment.js      # user, activity, body
    │   └── Message.js      # sender, receiver, body, readAt
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── activityController.js
    │   ├── groupController.js
    │   ├── messageController.js
    │   └── statsController.js
    ├── routes/             # RESTful routes for all resources
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification, adminOnly
    │   └── errorMiddleware.js  # Centralised error handler
    └── seed/seed.js        # 22 users, 50+ activities, 8 groups, comments, messages
```

---

## Mongoose Models (3+)

1. **User** — username, email, hashed password, bio, sportTags, followers/following, totalKm, role
2. **Activity** — user ref, sportType, distanceKm, durationMinutes, elevationGainM, routePoints, likes, comments
3. **Group** — name, sportType, privacy (open/invite), admin, members array
4. **Comment** — user ref, activity ref, body, timestamps
5. **Message** — sender, receiver, body, readAt, timestamps

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user (bcrypt hash) |
| POST | /api/auth/login | Login → JWT token |
| GET  | /api/auth/me | Get current user (JWT protected) |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET  | /api/users | Search users (q, sport, limit, offset) |
| GET  | /api/users/:id | Get user profile |
| PUT  | /api/users/me/profile | Update own profile |
| POST | /api/users/:id/follow | Follow / unfollow |
| GET  | /api/users/:id/activities | User's public activities |

### Activities
| Method | Endpoint | Description |
|---|---|---|
| GET  | /api/activities/feed | Following feed |
| GET  | /api/activities/search | Search (q, sport, minDist, maxDist, location) |
| POST | /api/activities | Create activity |
| GET  | /api/activities/:id | Get activity |
| PUT  | /api/activities/:id | Update (owner only) |
| DELETE | /api/activities/:id | Delete (owner/admin) |
| POST | /api/activities/:id/like | Toggle like |
| POST | /api/activities/:id/comment | Add comment |

### Groups
| Method | Endpoint | Description |
|---|---|---|
| GET  | /api/groups | Search groups (q, sport, privacy) |
| POST | /api/groups | Create group |
| GET  | /api/groups/:id | Get group |
| PUT  | /api/groups/:id | Update (admin only) |
| DELETE | /api/groups/:id | Delete (admin only) |
| POST | /api/groups/:id/join | Join / leave group |

### Messages / Stats
| Method | Endpoint |
|---|---|
| GET | /api/messages/conversations |
| GET | /api/messages/:userId |
| POST | /api/messages/:userId |
| GET | /api/stats/me |
| GET | /api/stats/global |

---

## Advanced Search (3+ Parameters)

Activities: `q` (text) + `sport` (type) + `minDist` + `maxDist` + `location`  
Groups: `q` (text) + `sport` + `privacy`  
Users: `q` (text) + `sport` + `limit` + `offset`

---

## Real-time Features (Socket.io)

- `user:join` — mark user online, broadcast online list
- `message:send` → `message:receive` — direct message delivery
- `typing:start` / `typing:stop` — typing indicators
- `disconnect` — remove from online map

---

## D3.js Charts

1. **SportBarChart** — animated bar chart showing km per sport with teal→lime gradient bars
2. **MonthlyLineChart** — area + line chart of monthly distance (12-month rolling) with CatmullRom smoothing

Both charts render from live MongoDB aggregation data (with demo fallback when backend is offline).

---

## CSS3 Requirements

| Feature | Usage |
|---|---|
| `text-shadow` | `.vision-brand h1`, sport labels, summary headings |
| `transition` | All buttons, cards, nav items (0.2s ease) |
| `multiple-columns` | Stats grid uses `column-count` layout |
| `@font-face` | Inter loaded via `next/font/google` + `--font-inter` CSS variable |
| `border-radius` | Cards (20px), buttons (14px), avatars (50%), badges (20px) |

---

## Setup

### Frontend

```bash
cd "Final Project/Vision"
npm install
npm run dev        # http://localhost:3000
```

### Backend

```bash
cd "Final Project/Vision/server"
npm install
cp .env.example .env
# Edit .env: add MONGO_URI and JWT_SECRET
npm run dev        # http://localhost:5000
```

### Seed Database

```bash
cd "Final Project/Vision/server"
npm run seed
# Seeds: 22 users · 50+ activities · 8 groups · comments · messages
```

---

## Environment Variables

**`server/.env`** (copy from `.env.example`):
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vision
JWT_SECRET=your-long-random-secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

**`Vision/.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> Never commit `.env` files. Only `.env.example` is committed.

---

## Security

- Passwords hashed with **bcrypt** (12 salt rounds) — never stored in plain text
- Password field excluded from all API responses (`select: false`)
- JWT tokens expire after 30 days
- All data-mutating routes protected by `authMiddleware.protect`
- Admin-only operations gated by `authMiddleware.adminOnly`
- CORS restricted to `CLIENT_URL` env variable

---

## Seed Data

| Resource | Count |
|---|---|
| Users | 22 (international athletes) |
| Activities | 50+ (all 8 sport types) |
| Groups | 8 (open + invite-only) |
| Comments | ~150 (2-3 per activity) |
| Messages | 15 (5 conversation pairs) |

Default admin login after seeding:
- Email: `alex@vision.app`
- Password: `Vision2024!`
