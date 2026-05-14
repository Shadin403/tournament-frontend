<template>
  <div class="home-page">

    <!-- ── Welcome Row ───────────────────────────────────────────────── -->
    <div class="welcome-row">
      <div class="welcome-text">
        <h1 class="welcome-name">Welcome{{ isLoggedIn ? ', ' + firstName : '' }}! 👋</h1>
        <p class="welcome-sub">Find and join tournaments</p>
      </div>
      <a v-if="isLoggedIn" href="/wallet" @click.prevent="guardedPush('/wallet')" class="wallet-chip">
        <span class="wallet-chip-icon"><Wallet :size="14" /></span>
        <span class="wallet-chip-amount">৳{{ walletTotal }}</span>
      </a>
      <button v-else @click="openLoginModal()" class="wallet-chip wallet-chip--login">
        <span class="wallet-chip-icon"><LogIn :size="14" /></span>
        <span class="wallet-chip-amount">Login</span>
      </button>
    </div>

    <!-- ── Banner Slider (Dynamic) ───────────────────────────────────── -->
    <div class="banner-wrap">
      <!-- Loading skeleton -->
      <div v-if="loading" class="banner-skeleton">
        <div class="banner-skeleton-shimmer"></div>
        <Loader2 :size="28" class="animate-spin banner-skeleton-loader" />
      </div>

      <!-- Actual slider -->
      <div v-else-if="banners.length" class="banner-slider"
           @touchstart="onTouchStart" @touchend="onTouchEnd">
        <transition :name="slideDir" mode="out-in">
          <div :key="current" class="banner-slide">
            <img :src="banners[current].image_url" :alt="banners[current].title" />
            <div class="banner-overlay" />
            <div class="banner-caption">
              <span class="banner-tag">{{ banners[current].tag }}</span>
              <h2 class="banner-title">{{ banners[current].title }}</h2>
              <p v-if="banners[current].subtitle" class="banner-subtitle">{{ banners[current].subtitle }}</p>
              <a :href="banners[current].link || '/matches'" @click.prevent="guardedPush(banners[current].link || '/matches')" class="banner-cta">
                <Swords :size="14" />
                {{ banners[current].button_text || 'Join Now' }}
              </a>
            </div>
          </div>
        </transition>

        <!-- Dots -->
        <div class="banner-dots">
          <button v-for="(_, i) in banners" :key="i" @click="goTo(i)"
                  class="banner-dot" :class="{ active: i === current }" />
        </div>

        <!-- Arrows (desktop) -->
        <button @click="prev" class="banner-arrow banner-arrow-left">
          <ChevronLeft :size="18" color="white" />
        </button>
        <button @click="next" class="banner-arrow banner-arrow-right">
          <ChevronRight :size="18" color="white" />
        </button>
      </div>

      <!-- No banners -->
      <div v-else class="banner-empty">
        <ImageIcon :size="32" />
        <p>No banners available</p>
      </div>
    </div>

    <!-- ── Game Modes (Dynamic) ──────────────────────────────────────── -->
    <div class="section">
      <div class="section-header">
        <div class="section-title-group">
          <span class="section-icon"><LayoutGrid :size="15" /></span>
          <h2 class="section-title">Game Modes</h2>
        </div>
        <a href="/matches" @click.prevent="guardedPush('/matches')" class="section-link">
          View All <ChevronRight :size="13" />
        </a>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="categories-grid">
        <div v-for="i in 4" :key="i" class="category-skeleton">
          <div class="category-skeleton-shimmer"></div>
        </div>
      </div>

      <!-- Actual modes -->
      <div v-else-if="gameModes.length" class="categories-grid">
        <a v-for="mode in gameModes" :key="mode.id"
           :href="`/matches?mode=${mode.slug}`"
           @click.prevent="guardedPush(`/matches?mode=${mode.slug}`)"
           class="category-card">
          <img :src="mode.image_url || '/img/cat_br_match.png'" :alt="mode.name" />
          <div class="category-overlay" />
          <div v-if="mode.badge" class="category-badge" :style="`background: ${mode.badge_color};`">
            {{ mode.badge }}
          </div>
          <div v-if="mode.active_matches_count > 0" class="category-count">
            <span class="category-count-dot"></span>
            {{ mode.active_matches_count }} live
          </div>
          <div class="category-info">
            <p class="category-game">{{ mode.game }}</p>
            <p class="category-name">{{ mode.name }}</p>
          </div>
        </a>
      </div>

      <!-- Empty -->
      <div v-else class="empty-card">
        <Swords :size="28" />
        <p>No game modes available</p>
      </div>
    </div>

    <!-- ── Live Platform Stats ───────────────────────────────────────── -->
    <div class="section">
      <div class="section-header">
        <div class="section-title-group">
          <span class="section-icon"><TrendingUp :size="15" /></span>
          <h2 class="section-title">Live Platform Stats</h2>
        </div>
      </div>
      <div class="stats-grid">
        <div v-for="stat in statsItems" :key="stat.label" class="stat-card">
          <div class="stat-icon-wrap" :style="`background: ${stat.bg}; border-color: ${stat.border};`">
            <component :is="stat.icon" :size="16" :style="`color: ${stat.color};`" />
          </div>
          <div class="stat-text">
            <div class="stat-value" :style="`color: ${stat.color};`">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Quick Actions ─────────────────────────────────────────────── -->
    <div class="section section-last">
      <div class="section-header">
        <div class="section-title-group">
          <span class="section-icon"><Zap :size="15" /></span>
          <h2 class="section-title">Quick Actions</h2>
        </div>
      </div>
      <div class="actions-grid">
        <button v-for="action in quickActions" :key="action.label"
           @click="handleAction(action)"
           class="action-card">
          <div class="action-icon" :style="`background: ${action.bg}; border-color: ${action.border};`">
            <component :is="action.icon" :size="16" :style="`color: ${action.color};`" />
          </div>
          <span class="action-label">{{ action.label }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLoginModal } from '@/composables/useLoginModal'
import { useDepositModal } from '@/composables/useDepositModal'
import api from '@/services/api'
import {
  Wallet, ChevronLeft, ChevronRight, LayoutGrid, TrendingUp,
  Users, Swords, Trophy, Coins, Zap, Loader2, ImageIcon,
  ArrowDownCircle, ArrowUpCircle, Gift, BarChart2, LogIn
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const { open: openLoginModal } = useLoginModal()
const { open: openDepositModal } = useDepositModal()

const isLoggedIn = computed(() => authStore.isAuthenticated)

const loading = ref(true)
const banners = ref([])
const gameModes = ref([])
const platformStats = ref({})

const firstName = computed(() => authStore.user?.name?.split(' ')[0] ?? 'Player')
const walletTotal = computed(() => {
  const w = walletStore.wallet
  if (!w) return '0.00'
  return (parseFloat(w.main_balance || 0) + parseFloat(w.winning_balance || 0) + parseFloat(w.bonus_balance || 0)).toFixed(2)
})

function guardedPush(to) {
  if (isLoggedIn.value) {
    router.push(to)
  } else {
    openLoginModal(to)
  }
}

// ── Banner Slider ─────────────────────────────────────────────────────
const current = ref(0)
const slideDir = ref('slide-left')
let autoTimer = null

function next() { slideDir.value = 'slide-left';  current.value = (current.value + 1) % banners.value.length }
function prev() { slideDir.value = 'slide-right'; current.value = (current.value - 1 + banners.value.length) % banners.value.length }
function goTo(i) { slideDir.value = i > current.value ? 'slide-left' : 'slide-right'; current.value = i }

let touchX = 0
function onTouchStart(e) { touchX = e.touches[0].clientX }
function onTouchEnd(e) { const diff = touchX - e.changedTouches[0].clientX; if (Math.abs(diff) > 40) diff > 0 ? next() : prev() }

// ── Stats ──────────────────────────────────────────────────────────────
const statsItems = computed(() => [
  { icon: Users,  label: 'Players',        value: platformStats.value.total_players?.toLocaleString() ?? '—', color: 'var(--color-neon-orange)', bg: 'rgba(255,69,0,0.1)', border: 'rgba(255,69,0,0.25)' },
  { icon: Swords, label: 'Live Matches',   value: platformStats.value.running_matches ?? '0',                 color: 'var(--color-neon-red)',    bg: 'rgba(255,34,68,0.1)', border: 'rgba(255,34,68,0.25)' },
  { icon: Trophy, label: 'Matches Played', value: platformStats.value.total_matches ?? '—',                   color: 'var(--color-neon-green)',  bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)' },
  { icon: Coins,  label: 'Prize Given',    value: '৳' + formatK(platformStats.value.prize_distributed),       color: 'var(--color-neon-purple)', bg: 'rgba(155,48,255,0.08)',border: 'rgba(155,48,255,0.25)' },
])

// ── Quick Actions ──────────────────────────────────────────────────────
const quickActions = [
  { to: '/wallet/deposit',  icon: ArrowDownCircle, label: 'Deposit',  color: 'var(--color-neon-green)',  bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)', action: 'deposit' },
  { to: '/wallet/withdraw', icon: ArrowUpCircle,   label: 'Withdraw', color: 'var(--color-neon-orange)', bg: 'rgba(255,69,0,0.1)',  border: 'rgba(255,69,0,0.25)' },
  { to: '/referral',        icon: Gift,            label: 'Referral', color: 'var(--color-neon-purple)', bg: 'rgba(155,48,255,0.08)',border: 'rgba(155,48,255,0.25)' },
  { to: '/leaderboard',     icon: BarChart2,       label: 'Ranking',  color: 'var(--color-neon-blue)',   bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)' },
]

function handleAction(action) {
  if (!isLoggedIn.value) {
    openLoginModal(action.to)
    return
  }
  if (action.action === 'deposit') {
    openDepositModal()
  } else {
    router.push(action.to)
  }
}

function formatK(n) {
  if (!n) return '0'
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n
}

onMounted(async () => {
  if (isLoggedIn.value && !walletStore.wallet) walletStore.fetchWallet()

  try {
    const { data } = await api.get('/home')
    banners.value = data.data?.banners ?? []
    gameModes.value = data.data?.game_modes ?? []
  } catch {
    try { const { data: b } = await api.get('/banners'); banners.value = b.data ?? [] } catch {}
    try { const { data: m } = await api.get('/game-modes'); gameModes.value = m.data ?? [] } catch {}
  }
  loading.value = false

  if (banners.value.length > 1) {
    autoTimer = setInterval(next, 4000)
  }

  try { const { data } = await api.get('/stats'); platformStats.value = data.data ?? {} } catch {}
})

onUnmounted(() => clearInterval(autoTimer))
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════
   HOME PAGE — Polished Gaming Theme
   ═══════════════════════════════════════════════════════════════════════ */

.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 16px;
}

/* ─── Welcome Row ─────────────────────────────────────────────────── */
.welcome-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 14px;
}

.welcome-text {}

.welcome-name {
  font-size: 1.05rem;
  font-weight: 800;
  font-family: var(--font-display);
  line-height: 1.3;
  color: var(--color-text-primary, #fff);
  letter-spacing: -0.01em;
}

.welcome-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted, rgba(255,255,255,0.45));
  margin-top: 3px;
  font-weight: 400;
}

/* Wallet Chip */
.wallet-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px 7px 10px;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(255,69,0,0.18) 0%, rgba(255,34,68,0.12) 100%);
  border: 1px solid rgba(255,69,0,0.3);
  color: var(--color-neon-orange, #ff4500);
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.wallet-chip:hover {
  background: linear-gradient(135deg, rgba(255,69,0,0.28) 0%, rgba(255,34,68,0.2) 100%);
  border-color: rgba(255,69,0,0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255,69,0,0.2);
}

.wallet-chip:active {
  transform: translateY(0) scale(0.97);
}

.wallet-chip--login {
  color: var(--color-text-secondary, rgba(255,255,255,0.7));
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border-color: rgba(255,255,255,0.12);
}

.wallet-chip--login:hover {
  color: #fff;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%);
  border-color: rgba(255,255,255,0.25);
  box-shadow: 0 4px 16px rgba(255,255,255,0.06);
}

.wallet-chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(255,69,0,0.2);
  flex-shrink: 0;
}

.wallet-chip--login .wallet-chip-icon {
  background: rgba(255,255,255,0.08);
}

.wallet-chip-amount {
  letter-spacing: 0.01em;
}

/* ─── Banner ──────────────────────────────────────────────────────── */
.banner-wrap {
  padding: 0 16px;
  margin-bottom: 24px;
}

/* Skeleton */
.banner-skeleton {
  position: relative;
  border-radius: 18px;
  aspect-ratio: 16 / 8;
  background: var(--color-bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.06));
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 25%,
    rgba(255,255,255,0.03) 37%,
    transparent 63%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.banner-skeleton-loader {
  color: var(--color-neon-orange, #ff4500);
  position: relative;
  z-index: 1;
}

/* Empty */
.banner-empty {
  border-radius: 18px;
  aspect-ratio: 16 / 8;
  background: var(--color-bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.06));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color-text-muted, rgba(255,255,255,0.35));
  font-size: 0.82rem;
}

/* Slider */
.banner-slider {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  aspect-ratio: 16 / 8;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05);
}

.banner-slide {
  position: absolute;
  inset: 0;
}

.banner-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.05) 70%, transparent 100%),
    linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 60%);
}

.banner-caption {
  position: absolute;
  bottom: 18px;
  left: 18px;
  right: 90px;
  z-index: 2;
}

.banner-tag {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 6px;
  padding: 2px 8px;
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.banner-title {
  font-size: 1.05rem;
  font-weight: 900;
  font-family: var(--font-display);
  color: white;
  line-height: 1.25;
  text-shadow: 0 2px 12px rgba(0,0,0,0.6);
  letter-spacing: -0.01em;
}

.banner-subtitle {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.6);
  margin-top: 4px;
  line-height: 1.4;
}

.banner-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding: 7px 18px;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 800;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-decoration: none;
  color: white;
  background: linear-gradient(135deg, var(--color-neon-orange, #ff4500), var(--color-neon-red, #ff2244));
  box-shadow:
    0 4px 16px rgba(255,69,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.15);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.banner-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.25s;
}

.banner-cta:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 8px 28px rgba(255,69,0,0.45),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.banner-cta:hover::before {
  opacity: 1;
}

.banner-cta:active {
  transform: translateY(0) scale(0.98);
}

/* Dots */
.banner-dots {
  position: absolute;
  bottom: 16px;
  right: 18px;
  display: flex;
  gap: 5px;
  z-index: 5;
  padding: 4px 6px;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.banner-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255,255,255,0.3);
  border: none;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.banner-dot.active {
  width: 18px;
  background: var(--color-neon-orange, #ff4500);
  box-shadow: 0 0 8px rgba(255,69,0,0.5);
}

/* Arrows — hidden on mobile */
.banner-arrow {
  display: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.banner-arrow:hover {
  background: rgba(0,0,0,0.65);
  border-color: rgba(255,255,255,0.2);
  transform: translateY(-50%) scale(1.08);
}

.banner-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.banner-arrow-left { left: 12px; }
.banner-arrow-right { right: 12px; }

/* ─── Section ─────────────────────────────────────────────────────── */
.section {
  padding: 0 16px;
  margin-bottom: 24px;
}

.section-last {
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255,69,0,0.12);
  color: var(--color-neon-orange, #ff4500);
  flex-shrink: 0;
}

.section-title {
  font-size: 0.88rem;
  font-weight: 700;
  font-family: var(--font-display);
  letter-spacing: 0.04em;
  color: var(--color-text-primary, #fff);
}

.section-link {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-neon-orange, #ff4500);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(255,69,0,0.08);
  transition: all 0.2s;
}

.section-link:hover {
  background: rgba(255,69,0,0.16);
}

/* ─── Categories Grid ─────────────────────────────────────────────── */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.category-skeleton {
  position: relative;
  border-radius: 16px;
  aspect-ratio: 4 / 3;
  background: var(--color-bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.06));
  overflow: hidden;
}

.category-skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 25%,
    rgba(255,255,255,0.025) 37%,
    transparent 63%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

/* Category Card */
.category-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  display: block;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08);
}

.category-card:active {
  transform: translateY(0) scale(0.98);
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover img {
  transform: scale(1.08);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 45%, transparent 100%),
    linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 50%);
}

.category-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.56rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
}

.category-count {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.56rem;
  font-weight: 700;
  color: white;
  background: rgba(255, 34, 68, 0.85);
  letter-spacing: 0.03em;
  box-shadow: 0 2px 8px rgba(255,34,68,0.3);
  backdrop-filter: blur(4px);
}

.category-count-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fff;
  animation: live-pulse 1.5s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.category-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
}

.category-game {
  font-size: 0.6rem;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2px;
}

.category-name {
  font-size: 0.92rem;
  font-weight: 900;
  font-family: var(--font-display);
  color: white;
  line-height: 1.2;
  text-shadow: 0 1px 6px rgba(0,0,0,0.8);
  letter-spacing: -0.01em;
}

/* ─── Empty Card ──────────────────────────────────────────────────── */
.empty-card {
  border-radius: 16px;
  padding: 36px 24px;
  background: var(--color-bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.06));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted, rgba(255,255,255,0.35));
  font-size: 0.82rem;
}

/* ─── Stats Grid ──────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: var(--color-bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.06));
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent);
}

.stat-card:hover {
  border-color: rgba(255,255,255,0.1);
  transform: translateY(-1px);
}

.stat-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid;
}

.stat-text {
  min-width: 0;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 900;
  font-family: var(--font-display);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.68rem;
  color: var(--color-text-muted, rgba(255,255,255,0.4));
  margin-top: 2px;
  font-weight: 500;
}

/* ─── Quick Actions ───────────────────────────────────────────────── */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 8px;
  border-radius: 14px;
  background: var(--color-bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.06));
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
}

.action-card:hover {
  border-color: rgba(255,69,0,0.2);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.action-card:active {
  transform: translateY(0) scale(0.96);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  transition: transform 0.25s;
}

.action-card:hover .action-icon {
  transform: scale(1.1);
}

.action-label {
  font-size: 0.66rem;
  font-weight: 600;
  color: var(--color-text-secondary, rgba(255,255,255,0.6));
  text-align: center;
  letter-spacing: 0.02em;
}

/* ─── Slide Transitions ───────────────────────────────────────────── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(1.02);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-60px) scale(0.98);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-60px) scale(1.02);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.98);
}


/* ═══════════════════════════════════════════════════════════════════
   TABLET ≥768px
   ═══════════════════════════════════════════════════════════════════ */
@media (min-width: 768px) {
  .welcome-row {
    padding: 24px 24px 18px;
  }

  .welcome-name {
    font-size: 1.25rem;
  }

  .wallet-chip {
    padding: 9px 20px 9px 12px;
    font-size: 0.88rem;
    border-radius: 14px;
  }

  .wallet-chip-icon {
    width: 30px;
    height: 30px;
  }

  .banner-wrap {
    padding: 0 24px;
    margin-bottom: 32px;
  }

  .banner-slider,
  .banner-skeleton,
  .banner-empty {
    aspect-ratio: 21 / 8;
    border-radius: 22px;
  }

  .banner-caption {
    bottom: 24px;
    left: 24px;
    right: 110px;
  }

  .banner-tag {
    font-size: 0.65rem;
    padding: 3px 10px;
  }

  .banner-title {
    font-size: 1.4rem;
  }

  .banner-subtitle {
    font-size: 0.78rem;
  }

  .banner-cta {
    margin-top: 14px;
    padding: 9px 22px;
    font-size: 0.78rem;
    border-radius: 12px;
  }

  .banner-arrow {
    display: flex;
  }

  .section {
    padding: 0 24px;
    margin-bottom: 32px;
  }

  .section-icon {
    width: 32px;
    height: 32px;
  }

  .section-title {
    font-size: 0.95rem;
  }

  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .category-card {
    border-radius: 18px;
    aspect-ratio: 3 / 4;
  }

  .category-name {
    font-size: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
    border-radius: 16px;
  }

  .stat-icon-wrap {
    width: 42px;
    height: 42px;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .actions-grid {
    gap: 12px;
  }

  .action-card {
    padding: 20px 12px;
    border-radius: 16px;
  }

  .action-icon {
    width: 44px;
    height: 44px;
  }

  .action-label {
    font-size: 0.72rem;
  }
}


/* ═══════════════════════════════════════════════════════════════════
   DESKTOP ≥1024px
   ═══════════════════════════════════════════════════════════════════ */
@media (min-width: 1024px) {
  .home-page {
    padding: 0 20px;
  }

  .welcome-row {
    padding: 28px 0 22px;
  }

  .welcome-name {
    font-size: 1.4rem;
  }

  .welcome-sub {
    font-size: 0.8rem;
  }

  .banner-wrap {
    padding: 0;
    margin-bottom: 36px;
  }

  .banner-slider,
  .banner-skeleton,
  .banner-empty {
    aspect-ratio: 21 / 7;
    border-radius: 24px;
  }

  .banner-caption {
    bottom: 32px;
    left: 32px;
    right: 140px;
  }

  .banner-tag {
    font-size: 0.68rem;
    margin-bottom: 8px;
  }

  .banner-title {
    font-size: 1.7rem;
  }

  .banner-subtitle {
    font-size: 0.82rem;
    margin-top: 6px;
  }

  .banner-cta {
    margin-top: 16px;
    padding: 11px 28px;
    font-size: 0.82rem;
    border-radius: 12px;
    gap: 8px;
  }

  .banner-arrow {
    width: 42px;
    height: 42px;
    border-radius: 14px;
  }

  .section {
    padding: 0;
    margin-bottom: 36px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .section-title {
    font-size: 1rem;
  }

  .section-link {
    font-size: 0.75rem;
    padding: 5px 14px;
    border-radius: 10px;
  }

  .categories-grid {
    gap: 18px;
  }

  .category-card {
    border-radius: 20px;
  }

  .category-name {
    font-size: 1.1rem;
  }

  .category-badge {
    padding: 4px 11px;
    font-size: 0.6rem;
    border-radius: 8px;
  }

  .category-count {
    padding: 4px 11px;
    border-radius: 8px;
    font-size: 0.6rem;
  }

  .category-info {
    padding: 14px;
  }

  .stats-grid {
    gap: 14px;
  }

  .stat-card {
    padding: 20px;
    border-radius: 18px;
  }

  .stat-icon-wrap {
    width: 46px;
    height: 46px;
    border-radius: 12px;
  }

  .stat-value {
    font-size: 1.35rem;
  }

  .stat-label {
    font-size: 0.72rem;
  }

  .actions-grid {
    gap: 16px;
  }

  .action-card {
    padding: 24px 16px;
    border-radius: 18px;
    gap: 12px;
  }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }

  .action-label {
    font-size: 0.78rem;
  }
}
</style>