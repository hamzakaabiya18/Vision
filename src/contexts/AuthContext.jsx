import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API       = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'vision_token'
const USER_KEY  = 'vision_user'

function makeDemoUser(emailOrUsername = '') {
  const name = emailOrUsername.includes('@')
    ? emailOrUsername.split('@')[0]
    : (emailOrUsername || 'athlete')
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_')
  return {
    _id:            'demo-' + slug,
    fullName:       name.charAt(0).toUpperCase() + name.slice(1) + ' (Demo)',
    username:       slug,
    email:          emailOrUsername.includes('@') ? emailOrUsername : slug + '@demo.app',
    avatarUrl:      '',
    bio:            'Demo athlete — connect the backend to enable real accounts.',
    sportTags:      ['Running', 'Cycling'],
    followersCount: 0,
    followingCount: 0,
    activitiesCount:0,
    isDemo:         true,
  }
}

function makeDemoUserFromSignup(fields) {
  return {
    _id:            'demo-' + fields.username,
    fullName:       fields.fullName,
    username:       fields.username,
    email:          fields.email,
    avatarUrl:      '',
    bio:            '',
    sportTags:      fields.sports || [],
    followersCount: 0,
    followingCount: 0,
    activitiesCount:0,
    isDemo:         true,
  }
}

function isOfflineError(err) {
  return err.name === 'TypeError' || err.message === 'Failed to fetch' || err.message?.includes('fetch')
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function hydrate() {
      const token  = localStorage.getItem(TOKEN_KEY)
      const cached = localStorage.getItem(USER_KEY)
      if (!token) { setLoading(false); return }

      if (cached) {
        try { setCurrentUser(JSON.parse(cached)) } catch {}
      }

      if (token === 'demo-token') { setLoading(false); return }

      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const { user } = await res.json()
          setCurrentUser(user)
          localStorage.setItem(USER_KEY, JSON.stringify(user))
        } else {
          clear()
        }
      } catch {
        /* Backend offline — keep cached user */
      } finally {
        setLoading(false)
      }
    }
    hydrate()
  }, [])

  function clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setCurrentUser(null)
  }

  const login = useCallback(async ({ emailOrUsername, password }) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ emailOrUsername, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setCurrentUser(data.user)
      return data.user
    } catch (err) {
      if (isOfflineError(err)) {
        const demo = makeDemoUser(emailOrUsername)
        localStorage.setItem(TOKEN_KEY, 'demo-token')
        localStorage.setItem(USER_KEY, JSON.stringify(demo))
        setCurrentUser(demo)
        return demo
      }
      throw err
    }
  }, [])

  const signup = useCallback(async (fields) => {
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Signup failed')
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setCurrentUser(data.user)
      return data.user
    } catch (err) {
      if (isOfflineError(err)) {
        const demo = makeDemoUserFromSignup(fields)
        localStorage.setItem(TOKEN_KEY, 'demo-token')
        localStorage.setItem(USER_KEY, JSON.stringify(demo))
        setCurrentUser(demo)
        return demo
      }
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    clear()
    try {
      const s = window.__visionSocket
      if (s) { s.disconnect(); window.__visionSocket = null }
    } catch {}
  }, [])

  const updateUser = useCallback((patch) => {
    setCurrentUser(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}
