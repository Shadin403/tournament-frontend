<template>
  <div class="px-4 py-4">

    <!-- ── Welcome ────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-lg font-bold" style="font-family: var(--font-display);">
          Welcome, {{ authStore.user?.name?.split(' ')[0] }}! 👋
        </h1>
        <p class="text-xs" style="color: var(--color-text-muted);">Find and join tournaments</p>
      </div>
      <router-link to="/wallet"
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
        style="background: rgba(255,69,0,0.15); border: 1px solid rgba(255,69,0,0.3); color: var(--color-neon-orange);">
        <Wallet :size="14" />
        ৳{{ walletTotal }}
      </router-link>
    </div>

    <!-- ── Banner Slider ──────────────────────────────────────────────── -->
    <div class="relative rounded-2xl overflow-hidden mb-5" style="height: 160px;">
      <transition name="slide-banner" mode="out-in">
        <div :key="currentBanner" class="absolute inset-0 flex items-center justify-center"
             :style="`background: ${banners[currentBanner].bg}`">
          <div class="absolute inset-0" style="background: rgba(0,0,0,0.3);" />
          <div class="relative z-10 text-center px-6">
            <div class="text-3xl mb-2">{{ banners[currentBanner].emoji }}</div>
            <h2 class="text-xl font-black text-white" style="font-family: var(--font-display); text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
              {{ banners[currentBanner].title }}
            </h2>
            <p class="text-sm text-white/80 mt-1">{{ banners[currentBanner].sub }}</p>
          </div>
        </div>
      </transition>

      <!-- Dots -->
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        <div v-for="(_, i) in banners" :key="i"
             class="rounded-full transition-all duration-300"
             :style="i === currentBanner
               ? 'width:16px; height:6px; background:white;'
               : 'width:6px; height:6px; background:rgba(255,255,255,0.4);'" />
      </div>
    </div>

    <!-- ── Stats Row ──────────────────────────────────────────────────── -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="rounded-xl p-3 text-center"
           style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
        <div class="flex justify-center mb-1">
          <Trophy :size="18" style="color: var(--color-neon-orange);" />
        </div>
        <div class="text-lg font-black" style="font-family: var(--font-display); color: var(--color-neon-orange);">
          {{ authStore.user?.total_wins ?? 0 }}
        </div>
        <div class="text-xs" style="color: var(--color-text-muted);">Wins</div>
      </div>
      <div class="rounded-xl p-3 text-center"
           style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
        <div class="flex justify-center mb-1">
          <Swords :size="18" style="color: var(--color-neon-blue);" />
        </div>
        <div class="text-lg font-black" style="font-family: var(--font-display); color: var(--color-neon-blue);">
          {{ authStore.user?.total_matches ?? 0 }}
        </div>
        <div class="text-xs" style="color: var(--color-text-muted);">Matches</div>
      </div>
      <div class="rounded-xl p-3 text-center"
           style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
        <div class="flex justify-center mb-1">
          <Target :size="18" style="color: var(--color-neon-green);" />
        </div>
        <div class="text-lg font-black" style="font-family: var(--font-display); color: var(--color-neon-green);">
          {{ authStore.user?.total_kills ?? 0 }}
        </div>
        <div class="text-xs" style="color: var(--color-text-muted);">Kills</div>
      </div>
    </div>

    <!-- ── Categories (Game Modes) ────────────────────────────────────── -->
    <div class="mb-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-bold text-sm" style="font-family: var(--font-display); letter-spacing: 0.05em;">CATEGORIES</h2>
        <router-link to="/matches" class="flex items-center gap-1 text-xs"
                     style="color: var(--color-neon-orange);">
          View All <ChevronRight :size="12" />
        </router-link>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <router-link
          v-for="mode in gameModes" :key="mode.slug"
          :to="`/matches?mode=${mode.slug}`"
          class="relative rounded-2xl overflow-hidden flex items-end p-3 cursor-pointer"
          style="height: 120px;">
          <!-- Background gradient -->
          <div class="absolute inset-0" :style="`background: ${mode.bg}`" />
          <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);" />
          <!-- Icon watermark -->
          <div class="absolute top-2 right-3 opacity-30 text-4xl">{{ mode.watermark }}</div>
          <!-- Label -->
          <div class="relative z-10">
            <div class="text-xs font-medium mb-0.5" style="color: rgba(255,255,255,0.7);">{{ mode.game }}</div>
            <div class="text-base font-black text-white" style="font-family: var(--font-display); text-shadow: 0 2px 6px rgba(0,0,0,0.5);">
              {{ mode.name }}
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- ── Live Matches ───────────────────────────────────────────────── -->
    <div class="mb-5">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" style="background: var(--color-neon-red); box-shadow: 0 0 6px var(--color-neon-red); animation: pulse-red 1.5s infinite;" />
          <h2 class="font-bold text-sm" style="font-family: var(--font-display); letter-spacing: 0.05em;">LIVE MATCHES</h2>
        </div>
        <router-link to="/matches" class="flex items-center gap-1 text-xs" style="color: var(--color-neon-orange);">
          See All <ChevronRight :size="12" />
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loadingMatches" class="flex justify-center py-8">
        <Loader2 :size="24" class="animate-spin" style="color: var(--color-neon-orange);" />
      </div>

      <!-- Empty -->
      <div v-else-if="liveMatches.length === 0"
           class="text-center py-8 rounded-xl"
           style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
        <Swords :size="32" class="mx-auto mb-2" style="color: var(--color-text-muted);" />
        <p class="text-sm" style="color: var(--color-text-muted);">কোনো live match নেই</p>
      </div>

      <!-- Match Cards -->
      <div v-else class="flex flex-col gap-2">
        <router-link
          v-for="match in liveMatches" :key="match.id"
          :to="`/matches/${match.id}`"
          class="flex items-center gap-3 p-3 rounded-xl"
          style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">

          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
               style="background: rgba(255,69,0,0.15); border: 1px solid rgba(255,69,0,0.3);">
            <Swords :size="18" style="color: var(--color-neon-orange);" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm truncate">{{ match.title }}</div>
            <div class="text-xs mt-0.5" style="color: var(--color-text-muted);">
              {{ match.mode }} · ৳{{ match.entry_fee }} entry · {{ match.slots_filled }}/{{ match.max_players }} slots
            </div>
          </div>

          <div>
            <span class="badge-status badge-live text-xs">LIVE</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- ── Quick Actions ──────────────────────────────────────────────── -->
    <div class="grid grid-cols-4 gap-3 mb-4">
      <router-link v-for="action in quickActions" :key="action.to" :to="action.to"
        class="flex flex-col items-center gap-2 p-3 rounded-xl"
        style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
        <div class="w-10 h-10 rounded-full flex items-center justify-center"
             :style="`background: ${action.bg}; border: 1px solid ${action.border};`">
          <component :is="action.icon" :size="18" :style="`color: ${action.color};`" />
        </div>
        <span class="text-xs text-center font-medium" style="color: var(--color-text-secondary);">{{ action.label }}</span>
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import api from '@/services/api'
import {
  Wallet, Trophy, Swords, Target, ChevronRight,
  Loader2, ArrowDownCircle, ArrowUpCircle, Gift, BarChart2
} from 'lucide-vue-next'

const authStore = useAuthStore()
const walletStore = useWalletStore()

const loadingMatches = ref(false)
const liveMatches = ref([])
const currentBanner = ref(0)

const walletTotal = computed(() => {
  const w = walletStore.wallet
  if (!w) return '0.00'
  return (parseFloat(w.main_balance || 0) + parseFloat(w.winning_balance || 0) + parseFloat(w.bonus_balance || 0)).toFixed(2)
})

const banners = [
  { title: 'Free Fire Tournament', sub: 'এখনই রেজিস্ট্রেশন করুন', emoji: '🔥', bg: 'linear-gradient(135deg, #FF4500, #FF2244)' },
  { title: 'PUBG Mobile League',   sub: 'বড় পুরস্কার জিতুন',      emoji: '🎯', bg: 'linear-gradient(135deg, #9B30FF, #00D4FF)' },
  { title: 'Daily Free Matches',   sub: 'কোনো এন্ট্রি ফি নেই',    emoji: '⚡', bg: 'linear-gradient(135deg, #FF6B00, #9B30FF)' },
]

const gameModes = [
  { slug: 'solo',        name: 'BR MATCH',     game: 'Free Fire', watermark: '🔫', bg: 'linear-gradient(135deg, rgba(255,69,0,0.6), rgba(255,34,68,0.4))' },
  { slug: 'clash_squad', name: 'CLASH SQUAD',  game: 'Free Fire', watermark: '⚡', bg: 'linear-gradient(135deg, rgba(155,48,255,0.6), rgba(0,212,255,0.4))' },
  { slug: 'lone_wolf',   name: 'LONE WOLF',    game: 'Free Fire', watermark: '🐺', bg: 'linear-gradient(135deg, rgba(0,212,255,0.5), rgba(0,255,136,0.3))' },
  { slug: 'squad',       name: 'LOSE TO WIN',  game: 'PUBG',      watermark: '🏆', bg: 'linear-gradient(135deg, rgba(255,165,0,0.6), rgba(255,69,0,0.4))' },
]

const quickActions = [
  { to: '/wallet/deposit',  icon: ArrowDownCircle, label: 'Deposit',  color: 'var(--color-neon-green)',  bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.3)' },
  { to: '/wallet/withdraw', icon: ArrowUpCircle,   label: 'Withdraw', color: 'var(--color-neon-orange)', bg: 'rgba(255,69,0,0.1)',   border: 'rgba(255,69,0,0.3)' },
  { to: '/referral',        icon: Gift,            label: 'Refer',    color: 'var(--color-neon-purple)', bg: 'rgba(155,48,255,0.1)', border: 'rgba(155,48,255,0.3)' },
  { to: '/leaderboard',     icon: BarChart2,       label: 'Rank',     color: 'var(--color-neon-blue)',   bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.3)' },
]

let bannerTimer
onMounted(async () => {
  // Auto-rotate banner
  bannerTimer = setInterval(() => {
    currentBanner.value = (currentBanner.value + 1) % banners.length
  }, 3500)

  // Load wallet
  if (!walletStore.wallet) walletStore.fetchWallet()

  // Load live matches
  loadingMatches.value = true
  try {
    const { data } = await api.get('/matches', { params: { status: 'running', limit: 3 } })
    liveMatches.value = data.data?.data ?? []
  } catch { /* ignore */ } finally {
    loadingMatches.value = false
  }
})

import { onUnmounted } from 'vue'
onUnmounted(() => clearInterval(bannerTimer))
</script>

<style scoped>
.slide-banner-enter-active, .slide-banner-leave-active { transition: opacity 0.4s ease; }
.slide-banner-enter-from, .slide-banner-leave-to { opacity: 0; }
</style>
