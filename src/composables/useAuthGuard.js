import { useAuthStore } from '@/stores/auth'
import { useLoginModal } from '@/composables/useLoginModal'
import { useRouter } from 'vue-router'

/**
 * Auth-guarded navigation. If not logged in, opens login modal.
 * If logged in, navigates normally.
 */
export function useAuthGuard() {
  const authStore = useAuthStore()
  const { open } = useLoginModal()
  const router = useRouter()

  function guardedPush(to) {
    if (authStore.isAuthenticated) {
      router.push(to)
    } else {
      open(to)
    }
  }

  function guardedClick(to, event) {
    if (!authStore.isAuthenticated) {
      if (event) event.preventDefault()
      open(to)
      return false
    }
    return true
  }

  return { guardedPush, guardedClick, isAuthenticated: authStore.isAuthenticated }
}
