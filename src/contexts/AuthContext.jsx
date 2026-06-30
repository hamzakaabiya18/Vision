import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API       = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'vision_token'
const USER_KEY  = 'vision_user'

// sessionStorage isolates each browser tab so multiple accounts can be open simultaneously
const store = {
  get:    (key) => sessionStorage.getItem(key),
  set:    (key, val) => sessionStorage.setItem(key, val),
  remove: (key) => sessionStorage.removeItem(key),
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function hydrate() {
      const token  = store.get(TOKEN_KEY)
      const cached = store.get(USER_KEY)
      if (!token) { setLoading(false); return }

      if (cached) {
        try { setCurrentUser(JSON.parse(cached)) } catch {}
      }

      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const { user } = await res.json()
          setCurrentUser(user)
          store.set(USER_KEY, JSON.stringify(user))
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
    store.remove(TOKEN_KEY)
    store.remove(USER_KEY)
    setCurrentUser(null)
  }

  const login = useCallback(async ({ emailOrUsername, password }) => {
    let res
    try {
      res = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ emailOrUsername, password }),
      })
    } catch {
      throw new Error('Cannot reach the server. Please make sure the backend is running.')
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Invalid email/username or password')
    store.set(TOKEN_KEY, data.token)
    store.set(USER_KEY, JSON.stringify(data.user))
    setCurrentUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (fields) => {
    let res
    try {
      res = await fetch(`${API}/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(fields),
      })
    } catch {
      throw new Error('Cannot reach the server. Please make sure the backend is running.')
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Signup failed')
    store.set(TOKEN_KEY, data.token)
    store.set(USER_KEY, JSON.stringify(data.user))
    setCurrentUser(data.user)
    return data.user
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
      store.set(USER_KEY, JSON.stringify(next))
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
  return sessionStorage.getItem(TOKEN_KEY) || null
}
