const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('vision_token') || ''
}

function ajaxRequest(method, endpoint, data) {
  if (typeof window === 'undefined' || !window.$) {
    return Promise.reject(new Error('jQuery not available'))
  }
  return new Promise((resolve, reject) => {
    window.$.ajax({
      url: `${BASE}${endpoint}`,
      method,
      contentType: 'application/json',
      data: data ? JSON.stringify(data) : undefined,
      headers: { Authorization: `Bearer ${getToken()}` },
      success: resolve,
      error: (xhr) => reject(new Error(xhr.responseJSON?.message || 'Ajax error')),
    })
  })
}

function cleanParams(params) {
  const out = {}
  Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') out[k] = v })
  return out
}

export const ajax = {
  /* ── Activity operations ── */
  searchActivities: (params)    => ajaxRequest('GET',    '/activities/search?' + new URLSearchParams(cleanParams(params))),
  postComment:      (id, body)  => ajaxRequest('POST',   `/activities/${id}/comment`, body),
  likeActivity:     (id)        => ajaxRequest('POST',   `/activities/${id}/like`),
  deleteActivity:   (id)        => ajaxRequest('DELETE', `/activities/${id}`),
  updateActivity:   (id, data)  => ajaxRequest('PUT',    `/activities/${id}`, data),

  /* ── User operations ── */
  searchUsers:      (params)    => ajaxRequest('GET',    '/users?' + new URLSearchParams(cleanParams(params))),
  getProfile:       (id)        => ajaxRequest('GET',    `/users/${id}/profile`),
  followUser:       (id)        => ajaxRequest('POST',   `/users/${id}/follow`),
  unfollowUser:     (id)        => ajaxRequest('DELETE', `/users/${id}/follow`),

  /* ── Group operations ── */
  searchGroups:     (params)    => ajaxRequest('GET',    '/groups?' + new URLSearchParams(cleanParams(params))),
  joinGroup:        (id)        => ajaxRequest('POST',   `/groups/${id}/join`),
  leaveGroup:       (id)        => ajaxRequest('DELETE', `/groups/${id}/join`),

  /* ── Route operations ── */
  searchRoutes:     (params)    => ajaxRequest('GET',    '/routes?' + new URLSearchParams(cleanParams(params))),

  /* ── Stats ── */
  getStats:         ()          => ajaxRequest('GET',    '/stats/me'),
  getGlobalStats:   ()          => ajaxRequest('GET',    '/stats/global'),
}
