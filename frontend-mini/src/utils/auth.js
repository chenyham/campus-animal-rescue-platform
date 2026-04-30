import { ref } from 'vue'

const STORAGE_KEY = 'campus-rescue-admin-session'

const readStoredSession = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch (error) {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const authSession = ref(readStoredSession())

export const getSession = () => authSession.value

export const setSession = session => {
  authSession.value = session
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }
}

export const clearSession = () => {
  authSession.value = null
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export const getToken = () => authSession.value?.token || ''
