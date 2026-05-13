<template>
  <div class="flex flex-col min-h-screen" style="background-color: var(--color-bg-darkest); font-family: var(--font-body);">

    <!-- Top Navbar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
            style="background: rgba(10,10,15,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--color-border-subtle);">

      <router-link to="/dashboard" class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-md flex items-center justify-center"
             style="background: linear-gradient(135deg, var(--color-neon-orange), var(--color-neon-red));">
          <Zap :size="14" color="white" :stroke-width="2.5" />
        </div>
        <span class="font-black gradient-text-orange"
              style="font-family: var(--font-display); letter-spacing: 0.08em; font-size: 1rem;">
          BATTLEZONE
        </span>
      </router-link>

      <div class="flex items-center gap-2">
        <router-link to="/wallet" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                     style="background: rgba(255,69,0,0.15); border: 1px solid rgba(255,69,0,0.35); color: var(--color-neon-orange);">
          <Wallet :size="13" />
          <span>৳{{ walletTotal }}</span>
        </router-link>

        <span class="text-sm font-medium hidden sm:block" style="color: var(--color-text-secondary);">
          {{ authStore.user?.username }}
        </span>

        <router-link to="/profile">
          <img :src="avatarUrl" class="w-8 h-8 rounded-full object-cover"
               style="border: 2px solid var(--color-neon-orange);" />
        </router-link>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-1 pt-14 pb-16 overflow-y-auto">
      <slot />
    </main>

    <!-- Bottom Tab Bar -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 flex"
         style="background: rgba(10,10,15,0.97); backdrop-filter: blur(20px); border-top: 1px solid var(--color-border-subtle); height: 60px;">

      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative"
        :class="isActive(tab.to) ? 'tab-active' : 'tab-inactive'">

        <div v-if="isActive(tab.to)"
             class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
             style="background: var(--color-neon-orange); box-shadow: 0 0 8px var(--color-neon-orange);" />

        <component :is="tab.icon" :size="20" :stroke-width="isActive(tab.to) ? 2.5 : 1.8" />
        <span style="font-size: 0.62rem; letter-spacing: 0.02em; font-weight: 500;">{{ tab.label }}</span>
      </router-link>

    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { Zap, Wallet, Home, Swords, CreditCard, Trophy, User } from 'lucide-vue-next'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const route = useRoute()

const tabs = [
  { to: '/',           icon: Home,       label: 'Home' },
  { to: '/matches',    icon: Swords,      label: 'Matches' },
  { to: '/wallet',     icon: CreditCard,  label: 'Wallet' },
  { to: '/my-matches', icon: Trophy,      label: 'Results' },
  { to: '/profile',    icon: User,        label: 'Profile' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const walletTotal = computed(() => {
  const w = walletStore.wallet
  if (!w) return '0.00'
  return (
    parseFloat(w.main_balance || 0) +
    parseFloat(w.winning_balance || 0) +
    parseFloat(w.bonus_balance || 0)
  ).toFixed(2)
})

const avatarUrl = computed(() =>
  authStore.user?.avatar
    ? `/storage/${authStore.user.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'U')}&background=FF4500&color=fff&bold=true`
)

onMounted(() => {
  if (authStore.isAuthenticated && !walletStore.wallet) {
    walletStore.fetchWallet()
  }
})
</script>

<style scoped>
.tab-active {
  color: var(--color-neon-orange);
}
.tab-inactive {
  color: var(--color-text-muted);
}
.tab-inactive:hover {
  color: var(--color-text-secondary);
}
</style>
