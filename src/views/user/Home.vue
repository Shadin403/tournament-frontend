<template>
  <div class="home-page">

    <!-- ── Welcome Row ───────────────────────────────────────────────── -->
    <div class="welcome-row">
      <div>
        <h1 class="welcome-name">Welcome, {{ firstName }}! 👋</h1>
        <p class="welcome-sub">Find and join tournaments</p>
      </div>
      <router-link to="/wallet" class="wallet-chip">
        <Wallet :size="13" />
        ৳{{ walletTotal }}
      </router-link>
    </div>

    <!-- ── Banner Slider (Dynamic) ───────────────────────────────────── -->
    <div class="banner-wrap">
      <!-- Loading skeleton -->
      <div v-if="loading" class="banner-skeleton">
        <Loader2 :size="28" class="animate-spin" style="color: var(--color-neon-orange);" />
      </div>

      <!-- Actual slider -->
      <div v-else-if="banners.length" class="banner-slider"
           @touchstart="onTouchStart" @touchend="onTouchEnd">
        <transition :name="slideDir" mode="out-in">
          <div :key="current" class="banner-slide">
            <img :src="banners[current].image_url" :alt="banners[current].title" />
            <div class="banner-overlay" />
            <div class="banner-caption">
              <p class="banner-tag">{{ banners[current].tag }}</p>
              <h2 class="banner-title">{{ banners[current].title }}</h2>
              <p v-if="banners[current].subtitle" class="banner-subtitle">{{ banners[current].subtitle }}</p>
              <router-link :to="banners[current].link || '/matches'" class="banner-cta">
                <Swords :size="14" />
                {{ banners[current].button_text || 'Join Now' }}
              </router-link>
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
        <ImageIcon :size="32" style="color: var(--color-text-muted);" />
        <p>No banners available</p>
      </div>
    </div>

    <!-- ── Game Modes (Dynamic) ──────────────────────────────────────── -->
    <div class="section">
      <div class="section-header">
        <div class="section-title-group">
          <LayoutGrid :size="15" style="color: var(--color-neon-orange);" />
          <h2 class="section-title">Game Modes</h2>
        </div>
        <router-link to="/matches" class="section-link">
          View All <ChevronRight :size="13" />
        </router-link>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="categories-grid">
        <div v-for="i in 4" :key="i" class="category-skeleton" />
      </div>

      <!-- Actual modes -->
      <div v-else-if="gameModes.length" class="categories-grid">
        <router-link
          v-for="mode in gameModes" :key="mode.id"
          :to="`/matches?mode=${mode.slug}`"
          class="category-card">
          <img :src="mode.image_url || '/img/cat_br_match.png'" :alt="mode.name" />
          <div class="category-overlay" />
          <div v-if="mode.badge" class="category-badge" :style="`background: ${mode.badge_color};`">
            {{ mode.badge }}
          </div>
          <!-- Active match count pill -->
          <div v-if="mode.active_matches_count > 0" class="category-count">
            {{ mode.active_matches_count }} live
          </div>
          <div class="category-info">
            <p class="category-game">{{ mode.game }}</p>
            <p class="category-name">{{ mode.name }}</p>
          </div>
        </router-link>
      </div>

      <!-- Empty -->
      <div v-else class="empty-card">
        <Swords :size="28" style="color: var(--color-text-muted);" />
        <p>No game modes available</p>
      </div>
    </div>

    <!-- ── Live Platform Stats ───────────────────────────────────────── -->
    <div class="section">
      <div class="section-header">
        <div class="section-title-group">
          <TrendingUp :size="15" style="color: var(--color-neon-orange);" />
          <h2 class="section-title">Live Platform Stats</h2>
        </div>
      </div>
      <div class="stats-grid">
        <div v-for="stat in statsItems" :key="stat.label" class="stat-card">
          <div class="stat-icon-wrap" :style="`background: ${stat.bg}; border-color: ${stat.border};`">
            <component :is="stat.icon" :size="16" :style="`color: ${stat.color};`" />
          </div>
          <div>
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
          <Zap :size="15" style="color: var(--color-neon-orange);" />
          <h2 class="section-title">Quick Actions</h2>
        </div>
      </div>
      <div class="actions-grid">
        <router-link v-for="action in quickActions" :key="action.to" :to="action.to"
                     class="action-card">
          <div class="action-icon" :style="`background: ${action.bg}; border-color: ${action.border};`">
            <component :is="action.icon" :size="16" :style="`color: ${action.color};`" />
          </div>
          <span class="action-label">{{ action.label }}</span>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import api from '@/services/api'
import {
  Wallet, ChevronLeft, ChevronRight, LayoutGrid, TrendingUp,
  Users, Swords, Trophy, Coins, Zap, Loader2, ImageIcon,
  ArrowDownCircle, ArrowUpCircle, Gift, BarChart2
} from 'lucide-vue-next'

const authStore = useAuthStore()
const walletStore = useWalletStore()

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
  { icon: Users,  label: 'Players',        value: platformStats.value.total_players?.toLocaleString() ?? '—', color: 'var(--color-neon-orange)', bg: 'rgba(255,69,0,0.12)', border: 'rgba(255,69,0,0.3)' },
  { icon: Swords, label: 'Live Matches',   value: platformStats.value.running_matches ?? '0',                 color: 'var(--color-neon-red)',    bg: 'rgba(255,34,68,0.12)', border: 'rgba(255,34,68,0.3)' },
  { icon: Trophy, label: 'Matches Played', value: platformStats.value.total_matches ?? '—',                   color: 'var(--color-neon-green)',  bg: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.3)' },
  { icon: Coins,  label: 'Prize Given',    value: '৳' + formatK(platformStats.value.prize_distributed),       color: 'var(--color-neon-purple)', bg: 'rgba(155,48,255,0.12)',border: 'rgba(155,48,255,0.3)' },
])

// ── Quick Actions ──────────────────────────────────────────────────────
const quickActions = [
  { to: '/wallet/deposit',  icon: ArrowDownCircle, label: 'Deposit',  color: 'var(--color-neon-green)',  bg: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.3)' },
  { to: '/wallet/withdraw', icon: ArrowUpCircle,   label: 'Withdraw', color: 'var(--color-neon-orange)', bg: 'rgba(255,69,0,0.12)',  border: 'rgba(255,69,0,0.3)' },
  { to: '/referral',        icon: Gift,            label: 'Referral', color: 'var(--color-neon-purple)', bg: 'rgba(155,48,255,0.12)',border: 'rgba(155,48,255,0.3)' },
  { to: '/leaderboard',     icon: BarChart2,       label: 'Ranking',  color: 'var(--color-neon-blue)',   bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.3)' },
]

function formatK(n) {
  if (!n) return '0'
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n
}

onMounted(async () => {
  if (!walletStore.wallet) walletStore.fetchWallet()

  // Fetch home data (banners + game modes)
  try {
    const { data } = await api.get('/home')
    banners.value = data.data?.banners ?? []
    gameModes.value = data.data?.game_modes ?? []
  } catch {
    // Fallback — try separately
    try { const { data: b } = await api.get('/banners'); banners.value = b.data ?? [] } catch {}
    try { const { data: m } = await api.get('/game-modes'); gameModes.value = m.data ?? [] } catch {}
  }
  loading.value = false

  // Auto-slide banner
  if (banners.value.length > 1) {
    autoTimer = setInterval(next, 4000)
  }

  // Fetch platform stats
  try { const { data } = await api.get('/stats'); platformStats.value = data.data ?? {} } catch {}
})

onUnmounted(() => clearInterval(autoTimer))
</script>

<style scoped>
/* ─── Page Container ──────────────────────────────────────────────────── */
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 12px;
}

/* ─── Welcome ─────────────────────────────────────────────────────────── */
.welcome-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
}
.welcome-name {
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-display);
  line-height: 1.3;
}
.welcome-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.wallet-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  background: rgba(255,69,0,0.15);
  border: 1px solid rgba(255,69,0,0.35);
  color: var(--color-neon-orange);
  text-decoration: none;
  white-space: nowrap;
}

/* ─── Banner ──────────────────────────────────────────────────────────── */
.banner-wrap { padding: 0 16px; margin-bottom: 20px; }
.banner-skeleton {
  border-radius: 16px;
  aspect-ratio: 16 / 8;
  background: var(--color-bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
}
.banner-empty {
  border-radius: 16px;
  aspect-ratio: 16 / 8;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
.banner-slider {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 16 / 8;
  cursor: pointer;
}
.banner-slide { position: absolute; inset: 0; }
.banner-slide img { width: 100%; height: 100%; object-fit: cover; }
.banner-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%);
}
.banner-caption { position: absolute; bottom: 16px; left: 16px; right: 80px; z-index: 2; }
.banner-tag {
  font-size: 0.7rem; font-weight: 600;
  color: rgba(255,255,255,0.65);
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px;
}
.banner-title {
  font-size: 1rem; font-weight: 900;
  font-family: var(--font-display); color: white;
  line-height: 1.3; text-shadow: 0 2px 8px rgba(0,0,0,0.7);
}
.banner-subtitle {
  font-size: 0.75rem; color: rgba(255,255,255,0.7); margin-top: 3px;
}
.banner-cta {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 10px; padding: 6px 16px; border-radius: 8px;
  font-size: 0.75rem; font-weight: 700;
  font-family: var(--font-display); text-transform: uppercase;
  letter-spacing: 0.06em; text-decoration: none; color: white;
  background: linear-gradient(135deg, var(--color-neon-orange), var(--color-neon-red));
  box-shadow: 0 4px 14px rgba(255,69,0,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.banner-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,69,0,0.55); }

/* Banner Dots */
.banner-dots { position: absolute; bottom: 12px; right: 16px; display: flex; gap: 6px; z-index: 5; }
.banner-dot {
  width: 6px; height: 6px; border-radius: 9999px;
  background: rgba(255,255,255,0.35); border: none;
  cursor: pointer; transition: all 0.3s; padding: 0;
}
.banner-dot.active { width: 20px; background: var(--color-neon-orange); }

/* Banner Arrows — hidden on mobile */
.banner-arrow {
  display: none; position: absolute; top: 50%; transform: translateY(-50%);
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15);
  cursor: pointer; align-items: center; justify-content: center; z-index: 5;
  transition: background 0.2s;
}
.banner-arrow:hover { background: rgba(0,0,0,0.7); }
.banner-arrow-left { left: 12px; }
.banner-arrow-right { right: 12px; }

/* ─── Section ─────────────────────────────────────────────────────────── */
.section { padding: 0 16px; margin-bottom: 20px; }
.section-last { margin-bottom: 8px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-title-group { display: flex; align-items: center; gap: 8px; }
.section-title { font-size: 0.85rem; font-weight: 700; font-family: var(--font-display); letter-spacing: 0.08em; }
.section-link { display: flex; align-items: center; gap: 2px; font-size: 0.75rem; font-weight: 600; color: var(--color-neon-orange); text-decoration: none; }

/* ─── Categories Grid ─────────────────────────────────────────────────── */
.categories-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.category-skeleton {
  border-radius: 16px; aspect-ratio: 4 / 3;
  background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);
  animation: pulse-skeleton 1.5s infinite;
}
@keyframes pulse-skeleton {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.category-card {
  position: relative; border-radius: 16px; overflow: hidden;
  aspect-ratio: 4 / 3; display: block; text-decoration: none;
}
.category-card img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.35s ease;
}
.category-card:hover img { transform: scale(1.06); }
.category-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 45%, transparent 100%);
}
.category-badge {
  position: absolute; top: 8px; right: 8px;
  padding: 2px 8px; border-radius: 9999px;
  font-size: 0.58rem; font-weight: 800; color: white;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.category-count {
  position: absolute; top: 8px; left: 8px;
  padding: 2px 8px; border-radius: 9999px;
  font-size: 0.58rem; font-weight: 700; color: white;
  background: rgba(255, 34, 68, 0.85);
  letter-spacing: 0.04em;
}
.category-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 12px; }
.category-game { font-size: 0.65rem; font-weight: 500; color: rgba(255,255,255,0.6); }
.category-name {
  font-size: 0.9rem; font-weight: 900;
  font-family: var(--font-display); color: white;
  line-height: 1.2; text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}

/* ─── Empty Card ──────────────────────────────────────────────────────── */
.empty-card {
  border-radius: 14px; padding: 32px;
  background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; color: var(--color-text-muted); font-size: 0.85rem;
}

/* ─── Stats Grid ──────────────────────────────────────────────────────── */
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.stat-card {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  border-radius: 12px; background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
}
.stat-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; border: 1px solid;
}
.stat-value { font-size: 1.1rem; font-weight: 900; font-family: var(--font-display); line-height: 1.2; }
.stat-label { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 1px; }

/* ─── Quick Actions ───────────────────────────────────────────────────── */
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.action-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 14px 8px; border-radius: 14px;
  background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);
  text-decoration: none; transition: border-color 0.2s, transform 0.2s;
}
.action-card:hover { border-color: rgba(255,69,0,0.3); transform: translateY(-2px); }
.action-icon {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; border: 1px solid;
}
.action-label { font-size: 0.68rem; font-weight: 600; color: var(--color-text-secondary); text-align: center; }

/* ─── Slide Transitions ───────────────────────────────────────────────── */
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active { transition: all 0.35s ease; }
.slide-left-enter-from  { opacity: 0; transform: translateX(50px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-50px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-50px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(50px); }


/* ═══ Tablet: ≥768px ══════════════════════════════════════════════════ */
@media (min-width: 768px) {
  .welcome-row { padding: 20px 24px 16px; }
  .welcome-name { font-size: 1.2rem; }
  .banner-wrap { padding: 0 24px; margin-bottom: 28px; }
  .banner-slider { aspect-ratio: 21 / 8; border-radius: 20px; }
  .banner-skeleton { aspect-ratio: 21 / 8; }
  .banner-empty { aspect-ratio: 21 / 8; }
  .banner-title { font-size: 1.35rem; }
  .banner-cta { padding: 8px 20px; font-size: 0.8rem; }
  .banner-arrow { display: flex; }
  .section { padding: 0 24px; margin-bottom: 28px; }
  .categories-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .category-card { aspect-ratio: 3 / 4; }
  .category-name { font-size: 1rem; }
  .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .actions-grid { gap: 14px; }
  .action-card { padding: 18px 12px; }
}

/* ═══ Desktop: ≥1024px ════════════════════════════════════════════════ */
@media (min-width: 1024px) {
  .home-page { padding: 0 20px; }
  .welcome-row { padding: 24px 0 20px; }
  .welcome-name { font-size: 1.35rem; }
  .banner-wrap { padding: 0; margin-bottom: 32px; }
  .banner-slider { aspect-ratio: 21 / 7; border-radius: 24px; }
  .banner-skeleton { aspect-ratio: 21 / 7; }
  .banner-empty { aspect-ratio: 21 / 7; }
  .banner-caption { bottom: 24px; left: 28px; right: 120px; }
  .banner-title { font-size: 1.6rem; }
  .banner-cta { padding: 10px 24px; font-size: 0.85rem; border-radius: 10px; }
  .section { padding: 0; }
  .section-title { font-size: 0.95rem; }
  .categories-grid { gap: 20px; }
  .category-card { border-radius: 20px; }
  .category-name { font-size: 1.1rem; }
  .category-badge { padding: 3px 10px; font-size: 0.65rem; }
  .stats-grid { gap: 16px; }
  .stat-card { padding: 18px; border-radius: 16px; }
  .stat-value { font-size: 1.3rem; }
  .actions-grid { gap: 16px; }
  .action-card { padding: 20px 14px; border-radius: 16px; }
  .action-icon { width: 42px; height: 42px; }
  .action-label { font-size: 0.75rem; }
}
</style>
