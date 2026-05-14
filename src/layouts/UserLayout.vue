<template>
  <div class="app-shell">

    <!-- ── Top Navbar ─────────────────────────────────────────────────── -->
    <header class="top-bar">
      <div class="top-bar-inner">
        <router-link to="/" class="logo-link">
          <div class="logo-icon">
            <Zap :size="14" color="white" :stroke-width="2.5" />
          </div>
          <span class="logo-text gradient-text-orange">BATTLEZONE</span>
        </router-link>

        <!-- Desktop Nav Links (hidden on mobile) -->
        <nav class="desktop-nav">
          <a v-for="link in desktopLinks" :key="link.to"
             :href="link.to"
             @click.prevent="handleNavClick(link.to)"
             class="desktop-nav-link"
             :class="{ active: isActive(link.to) }">
            <component :is="link.icon" :size="16" />
            {{ link.label }}
          </a>
        </nav>

        <div class="top-right">
          <!-- Logged in: wallet + avatar -->
          <template v-if="isLoggedIn">
            <a href="/wallet" @click.prevent="handleNavClick('/wallet')" class="wallet-chip">
              <Wallet :size="13" />
              <span>৳{{ walletTotal }}</span>
            </a>
            <span class="username-text">{{ authStore.user?.username }}</span>
            <router-link to="/profile" class="avatar-link">
              <img :src="avatarUrl" alt="Avatar" />
            </router-link>
          </template>

          <!-- Guest: Login button -->
          <template v-else>
            <button @click="openLoginModal()" class="login-btn">
              <LogIn :size="14" />
              লগইন
            </button>
            <router-link to="/register" class="register-btn">
              রেজিস্টার
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- ── Page Content ───────────────────────────────────────────────── -->
    <main class="page-content">
      <slot />
    </main>

    <!-- ── Bottom Tab Bar (mobile only) ───────────────────────────────── -->
    <nav class="bottom-bar">
      <a v-for="tab in tabs" :key="tab.to"
         :href="tab.to"
         @click.prevent="handleNavClick(tab.to)"
         class="tab-item"
         :class="{ 'tab-active': isActive(tab.to) }">
        <div v-if="isActive(tab.to)" class="tab-indicator" />
        <component :is="tab.icon" :size="20" :stroke-width="isActive(tab.to) ? 2.5 : 1.8" />
        <span class="tab-label">{{ tab.label }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLoginModal } from '@/composables/useLoginModal'
import { useDepositModal } from '@/composables/useDepositModal'
import { Zap, Wallet, Home, Swords, CreditCard, Trophy, User, BarChart2, LogIn } from 'lucide-vue-next'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const route = useRoute()
const router = useRouter()
const { open: openLoginModal } = useLoginModal()
const { open: openDepositModal } = useDepositModal()

const isLoggedIn = computed(() => authStore.isAuthenticated)

// Pages that don't need auth (public)
const publicPaths = ['/', '/login', '/register']

const tabs = [
  { to: '/',           icon: Home,       label: 'Home' },
  { to: '/matches',    icon: Swords,     label: 'Matches' },
  { to: '/wallet',     icon: CreditCard, label: 'Wallet' },
  { to: '/my-matches', icon: Trophy,     label: 'Results' },
  { to: '/profile',    icon: User,       label: 'Profile' },
]

const desktopLinks = [
  { to: '/',           icon: Home,       label: 'Home' },
  { to: '/matches',    icon: Swords,     label: 'Matches' },
  { to: '/wallet',     icon: CreditCard, label: 'Wallet' },
  { to: '/my-matches', icon: Trophy,     label: 'Results' },
  { to: '/leaderboard',icon: BarChart2,  label: 'Ranking' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

/**
 * If the target is a public page (like /), navigate normally.
 * Otherwise, check auth — if not logged in, open login modal.
 */
function handleNavClick(to) {
  if (to === '/wallet' && isLoggedIn.value) {
    openDepositModal()
    return
  }
  
  if (publicPaths.includes(to) || isLoggedIn.value) {
    router.push(to)
  } else {
    openLoginModal(to)
  }
}

const walletTotal = computed(() => {
  const w = walletStore.wallet
  if (!w) return '0.00'
  return (parseFloat(w.main_balance || 0) + parseFloat(w.winning_balance || 0) + parseFloat(w.bonus_balance || 0)).toFixed(2)
})

const avatarUrl = computed(() =>
  authStore.user?.avatar
    ? `/storage/${authStore.user.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'U')}&background=FF4500&color=fff&bold=true`
)

onMounted(() => {
  if (isLoggedIn.value && !walletStore.wallet) {
    walletStore.fetchWallet()
  }
})
</script>

<style scoped>
/* ─── App Shell ───────────────────────────────────────────────────────── */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-page);
  font-family: var(--font-body);
}

/* ─── Top Bar ─────────────────────────────────────────────────────────── */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 60px;
  background: rgba(255, 253, 246, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border-subtle);
}
.top-bar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

/* Logo */
.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-neon-orange), var(--color-neon-red));
}
.logo-text {
  font-weight: 900;
  font-family: var(--font-display);
  letter-spacing: 0.08em;
  font-size: 1rem;
}

/* Desktop Nav — hidden on mobile */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 4px;
}
.desktop-nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}
.desktop-nav-link:hover {
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.04);
}
.desktop-nav-link.active {
  color: var(--color-neon-orange);
  background: rgba(255, 69, 0, 0.1);
}

/* Top Right */
.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wallet-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  background: rgba(160, 200, 120, 0.15);
  border: 1px solid rgba(160, 200, 120, 0.35);
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}
.username-text {
  display: none;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}
.avatar-link img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-neon-orange);
  display: block;
}

/* Guest buttons */
.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, var(--color-neon-orange), var(--color-neon-red));
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}
.register-btn {
  display: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-neon-orange);
  background: rgba(255, 69, 0, 0.1);
  border: 1px solid rgba(255, 69, 0, 0.3);
  text-decoration: none;
  transition: all 0.2s;
}
.register-btn:hover {
  background: rgba(255, 69, 0, 0.18);
}

/* ─── Page Content ────────────────────────────────────────────────────── */
.page-content {
  flex: 1;
  padding-top: 56px;
  padding-bottom: 64px;
  overflow-y: auto;
}

/* ─── Bottom Tab Bar ──────────────────────────────────────────────────── */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: stretch;
  height: 65px;
  background: rgba(255, 253, 246, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--color-border-subtle);
  padding-bottom: env(safe-area-inset-bottom);
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}
.tab-item.tab-active {
  color: var(--color-neon-orange);
}
.tab-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 2px;
  border-radius: 9999px;
  background: var(--color-neon-orange);
  box-shadow: 0 0 8px var(--color-neon-orange);
}
.tab-label {
  font-size: 0.62rem;
  letter-spacing: 0.02em;
  font-weight: 500;
}


/* ═══ Tablet: ≥768px ═════════════════════════════════════════════════ */
@media (min-width: 768px) {
  .top-bar-inner {
    padding: 0 24px;
  }
  .username-text {
    display: block;
  }
  .register-btn {
    display: inline-block;
  }
}


/* ═══ Desktop: ≥1024px ═══════════════════════════════════════════════ */
@media (min-width: 1024px) {
  .desktop-nav {
    display: flex;
  }
  .bottom-bar {
    display: none;
  }
  .page-content {
    padding-bottom: 24px;
  }
  .top-bar-inner {
    padding: 0 20px;
  }
}
</style>
