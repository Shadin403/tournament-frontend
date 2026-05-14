import { ref } from 'vue'

// Global reactive state for login modal
const isOpen = ref(false)
const pendingRoute = ref(null)

export function useLoginModal() {
  function open(targetRoute = null) {
    pendingRoute.value = targetRoute
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    pendingRoute.value = null
  }

  function onLoginSuccess(router) {
    const route = pendingRoute.value
    close()
    if (route && router) {
      router.push(route)
    }
  }

  return { isOpen, pendingRoute, open, close, onLoginSuccess }
}
