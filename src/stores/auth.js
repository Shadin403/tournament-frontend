import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('battlezone_token'))
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isModerator = computed(() => ['admin', 'moderator'].includes(user.value?.role))

  async function init() {
    if (token.value) {
      try {
        const { data } = await api.get('/auth/me')
        user.value = data.data
      } catch {
        logout()
      }
    }
    initialized.value = true
  }

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    token.value = data.data.token
    user.value = data.data.user
    localStorage.setItem('battlezone_token', token.value)
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload)
    token.value = data.data.token
    user.value = data.data.user
    localStorage.setItem('battlezone_token', token.value)
  }

  async function logout() {
    try {
      if (token.value) await api.post('/auth/logout')
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('battlezone_token')
    }
  }

  function updateUser(updatedUser) {
    user.value = { ...user.value, ...updatedUser }
  }

  return { user, token, initialized, isAuthenticated, isAdmin, isModerator, init, login, register, logout, updateUser }
})
