<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import PublicLayout from '@/layouts/PublicLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginModal from '@/components/LoginModal.vue'
import DepositModal from '@/components/DepositModal.vue'

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// Load theme colors from API on app start
onMounted(async () => {
  themeStore.loadTheme()
  if (!authStore.initialized) {
    await authStore.init()
  }
})

const layout = computed(() => {
  if (!authStore.initialized) return null
  
  const layoutName = route.meta?.layout
  if (layoutName === 'admin') return AdminLayout
  if (layoutName === 'auth') return AuthLayout
  if (layoutName === 'public') return PublicLayout
  return UserLayout
})
</script>

<template>
  <VApp>
    <div v-if="!authStore.initialized" class="d-flex align-center justify-center" style="height: 100vh; background: #121212;">
      <div class="text-center">
        <VProgressCircular indeterminate color="primary" size="64" width="6" />
        <div class="mt-4 text-white font-weight-bold">Loading Tunament...</div>
      </div>
    </div>

    <component v-else :is="layout">
      <router-view />
    </component>

    <!-- Global Modals -->
    <LoginModal />
    <DepositModal />
  </VApp>
</template>
