<template>
  <div class="matches-page px-4 py-4">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <button @click="$router.back()" class="back-btn">
        <ArrowLeft :size="16" /> Back
      </button>
      <div class="flex-1">
        <h1 class="text-xl font-black" style="font-family: var(--font-display);">Matches</h1>
        <p class="text-xs" style="color: var(--color-text-muted);">{{ filteredLabel }} · {{ total }} matches available</p>
      </div>
      <button @click="fetchMatches" class="refresh-btn">
        <RefreshCw :size="16" :class="{ 'animate-spin': loading }" />
      </button>
    </div>

    <!-- Mode Filter Tabs -->
    <div class="mode-tabs mb-4">
      <button v-for="tab in modeTabs" :key="tab.value"
              @click="activeMode = tab.value; fetchMatches()"
              class="mode-tab" :class="{ active: activeMode === tab.value }">
        {{ tab.label }}
      </button>
    </div>

    <!-- Status Filter -->
    <div class="status-tabs mb-4">
      <button v-for="s in statusTabs" :key="s.value"
              @click="activeStatus = s.value; fetchMatches()"
              class="status-tab" :class="{ active: activeStatus === s.value }">
        {{ s.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="skeleton-card" />
    </div>

    <!-- Match Cards Grid -->
    <div v-else-if="matches.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="m in matches" :key="m.id" class="match-card" @click="goToMatch(m)">
        <!-- Card Header -->
        <div class="match-card-head">
          <h3 class="match-title">{{ m.title }}</h3>
          <span class="match-id">ID: {{ m.room_id || m.id }}</span>
        </div>

        <!-- Card Body -->
        <div class="match-card-body">
          <div class="match-info-left">
            <div class="match-info-row">
              <Gamepad2 :size="13" />
              <span>{{ formatMode(m.mode) }} | {{ m.server_region || 'Mobile' }} | {{ m.map }}</span>
            </div>
            <div class="match-info-row">
              <Coins :size="13" />
              <span>Entry: {{ m.entry_fee > 0 ? '৳' + m.entry_fee : 'FREE' }}</span>
            </div>
            <div class="match-info-row">
              <Trophy :size="13" />
              <span>Prize: ৳{{ Number(m.prize_pool).toLocaleString() }}</span>
            </div>
            <div class="match-info-row">
              <Calendar :size="13" />
              <span>{{ formatDate(m.match_starts_at) }}</span>
            </div>
          </div>

          <!-- Mode Image -->
          <div class="match-card-image">
            <img :src="getModeImage(m.mode)" :alt="m.mode" />
          </div>
        </div>

        <!-- Card Footer -->
        <div class="match-card-foot">
          <div class="players-bar">
            <div class="players-fill" :style="{ width: playerPercent(m) + '%', background: playerColor(m) }" />
          </div>
          <div class="match-foot-row">
            <span class="players-badge" :style="{ background: playerColor(m) + '22', color: playerColor(m) }">
              {{ m.slots_filled || m.players_count || 0 }}/{{ m.max_players }} Players
            </span>
            <span class="status-badge" :class="m.status">{{ formatStatus(m.status) }}</span>
          </div>

          <div class="match-foot-actions">
            <button class="action-btn prize-btn" @click.stop>
              <Trophy :size="13" /> Prize Pool
            </button>
            <button v-if="m.is_joined" class="action-btn room-btn" @click.stop="showRoomDetails(m)">
              <Key :size="13" /> Room Details
            </button>
            <button v-else-if="isMatchFull(m)" class="action-btn full-btn" disabled>
              <Lock :size="13" /> Match Full
            </button>
            <button v-else class="action-btn join-btn" @click.stop="handleJoin(m)">
              <LogIn :size="13" /> Join
            </button>
          </div>

          <!-- Countdown / Started -->
          <div class="match-countdown" v-if="m.match_starts_at">
            <Clock :size="12" />
            <span>{{ getCountdown(m) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <Swords :size="40" style="color: var(--color-text-muted);" />
      <p class="mt-2 text-sm" style="color: var(--color-text-muted);">No matches found for this filter</p>
    </div>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="pagination mt-6">
      <button @click="goPage(page - 1)" :disabled="page <= 1" class="page-btn">← Prev</button>
      <span class="text-sm" style="color: var(--color-text-muted);">Page {{ page }} / {{ lastPage }}</span>
      <button @click="goPage(page + 1)" :disabled="page >= lastPage" class="page-btn">Next →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLoginModal } from '@/composables/useLoginModal'
import api from '@/services/api'
import Swal from 'sweetalert2'
import {
  ArrowLeft, RefreshCw, Gamepad2, Coins, Trophy, Calendar,
  Clock, Lock, LogIn, Swords, CheckCircle, Key, Copy, Check
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { openLoginModal } = useLoginModal()

const matches = ref([])
const loading = ref(true)
const joining = ref(false)
const activeMode = ref(route.query.mode || '')
const activeStatus = ref('')
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)

// If mode is br_match, we still keep it but the backend handles showing solo/duo/squad
// But for the UI tabs, we might want to map it to 'All' or keep it as is.
// Let's ensure the tabs include it if it's special, or just let 'All' handle it.
const modeTabs = [
  { label: 'All', value: '' },
  { label: 'Solo', value: 'solo' },
  { label: 'Duo', value: 'duo' },
  { label: 'Squad', value: 'squad' },
  { label: 'Clash Squad', value: 'clash_squad' },
  { label: 'Lone Wolf', value: 'lone_wolf' },
  { label: 'Lose to Win', value: 'lose_to_win' },
]

// Add br_match to tabs if that's what came from home
if (activeMode.value === 'br_match') {
  // Option: show it as a special tab or just select 'All'
  // Let's just keep the tabs as is and the backend will handle the result.
}

const statusTabs = [
  { label: 'All', value: '' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Open', value: 'registration_open' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
]

const filteredLabel = computed(() => {
  const m = modeTabs.find(t => t.value === activeMode.value)
  return m?.label || 'All Modes'
})

async function fetchMatches() {
  loading.value = true
  try {
    const params = { page: page.value }
    if (activeMode.value) params.mode = activeMode.value
    if (activeStatus.value) params.status = activeStatus.value
    const { data } = await api.get('/matches', { params })
    const result = data.data
    matches.value = result.data || result
    lastPage.value = result.last_page || 1
    total.value = result.total || matches.value.length
  } catch {} finally { loading.value = false }
}

function goPage(p) { page.value = p; fetchMatches() }

function goToMatch(m) {
  router.push(`/matches/${m.id}`)
}

async function handleJoin(m) {
  if (!authStore.isAuthenticated) {
    openLoginModal(`/matches/${m.id}`)
    return
  }

  // Check balance first (client side check)
  const walletTotal = Number(authStore.user?.wallet?.main_balance || 0) + 
                      Number(authStore.user?.wallet?.winning_balance || 0) +
                      Number(authStore.user?.wallet?.bonus_balance || 0)

  if (m.entry_fee > walletTotal) {
    Swal.fire({
      title: 'Insufficient Balance!',
      text: `You need ৳${m.entry_fee} but you only have ৳${walletTotal.toFixed(2)}. Please deposit first.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Deposit Now',
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonText: 'Cancel',
      background: 'var(--color-bg-card)',
      color: 'var(--color-text-primary)'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/wallet/deposit')
      }
    })
    return
  }

  const { value: ign } = await Swal.fire({
    title: 'Confirm Registration',
    text: `Joining ${m.title}`,
    input: 'text',
    inputLabel: 'Enter your In-Game Name',
    inputPlaceholder: 'e.g. ProPlayer_007',
    inputValue: authStore.user?.name || '',
    showCancelButton: true,
    confirmButtonText: 'Confirm Join',
    confirmButtonColor: 'var(--color-primary)',
    cancelButtonColor: '#E74C3C',
    background: 'var(--color-bg-card)',
    color: 'var(--color-text-primary)',
    inputValidator: (value) => {
      if (!value) return 'In-game name is required!'
    }
  })

  if (ign) {
    try {
      joining.value = true
      const { data } = await api.post(`/matches/${m.id}/join`, { in_game_name: ign })
      
      Swal.fire({
        title: 'Successfully Joined!',
        text: data.message || 'Good luck for the match.',
        icon: 'success',
        confirmButtonColor: 'var(--color-primary)',
        timer: 2000
      })
      
      fetchMatches()
      // Optional: Refresh user data to update balance
      authStore.init()
    } catch (e) {
      Swal.fire({
        title: 'Failed to Join',
        text: e.response?.data?.message || 'Something went wrong.',
        icon: 'error',
        confirmButtonColor: 'var(--color-primary)'
      })
    } finally {
      joining.value = false
    }
  }
}

async function showRoomDetails(m) {
  try {
    const { data } = await api.get(`/matches/${m.id}/room-details`)
    const { room_id, room_password } = data.data

    Swal.fire({
      title: 'Room Details',
      background: 'var(--color-bg-card)',
      color: 'var(--color-text-primary)',
      html: `
        <div class="flex flex-col gap-4 mt-4">
          <div class="p-4 rounded-xl border border-dashed border-primary bg-primary/5">
            <div class="text-[10px] uppercase font-black opacity-50 mb-1">Room ID</div>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black font-mono tracking-wider">${room_id || 'TBA'}</span>
              <button onclick="window.copyToClipboard('${room_id}')" class="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </div>
          <div class="p-4 rounded-xl border border-dashed border-primary bg-primary/5">
            <div class="text-[10px] uppercase font-black opacity-50 mb-1">Room Password</div>
            <div class="flex items-center justify-between">
              <span class="text-xl font-black font-mono tracking-wider">${room_password || 'TBA'}</span>
              <button onclick="window.copyToClipboard('${room_password}')" class="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true
    })
  } catch (e) {
    Swal.fire({
      title: 'Unavailable',
      text: e.response?.data?.message || 'Room details are not available yet.',
      icon: 'info',
      confirmButtonColor: 'var(--color-primary)'
    })
  }
}

// Global helper for clipboard
window.copyToClipboard = (text) => {
  if (!text || text === 'TBA') return
  navigator.clipboard.writeText(text).then(() => {
    // Show a mini toast
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: false
    })
    Toast.fire({ icon: 'success', title: 'Copied!' })
  })
}

function formatMode(mode) {
  const map = { solo: 'Solo', duo: 'Duo', squad: 'Squad', clash_squad: 'Clash Squad', lone_wolf: 'Lone Wolf', lose_to_win: 'Lose to Win' }
  return map[mode] || mode
}

function formatStatus(s) {
  const map = { upcoming: 'UPCOMING', registration_open: 'OPEN', running: 'LIVE', completed: 'ENDED', cancelled: 'CANCELLED' }
  return map[s] || s?.toUpperCase()
}

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

function getModeImage(mode) {
  // Return placeholder images
  return `https://ui-avatars.com/api/?name=${formatMode(mode)}&background=A0C878&color=fff&size=80&bold=true&rounded=true`
}

function playerPercent(m) {
  const filled = m.slots_filled || m.players_count || 0
  return Math.min(100, (filled / m.max_players) * 100)
}

function playerColor(m) {
  const pct = playerPercent(m)
  if (pct >= 100) return '#E74C3C'
  if (pct >= 70) return '#E67E22'
  return '#A0C878'
}

function isMatchFull(m) {
  return (m.slots_filled || m.players_count || 0) >= m.max_players
}

function getCountdown(m) {
  if (!m.match_starts_at) return ''
  const diff = new Date(m.match_starts_at).getTime() - Date.now()
  if (diff <= 0) return 'Match has started!'
  const h = Math.floor(diff / 3600000)
  const min = Math.floor((diff % 3600000) / 60000)
  const sec = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${min}m ${sec}s`
  return `${min}m ${sec}s`
}

// Auto-refresh countdown every second
let countdownTimer = null
onMounted(() => {
  fetchMatches()
  countdownTimer = setInterval(() => { /* triggers reactivity */ }, 1000)
})
onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })
</script>

<style scoped>
.matches-page { max-width: 1200px; margin: 0 auto; }

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 600;
  background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);
  color: var(--color-text-secondary); cursor: pointer;
}

.refresh-btn {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted); cursor: pointer;
}

/* Mode Tabs */
.mode-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
.mode-tabs::-webkit-scrollbar { display: none; }
.mode-tab {
  flex-shrink: 0; padding: 7px 16px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;
  background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.mode-tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

/* Status Tabs */
.status-tabs { display: flex; gap: 4px; overflow-x: auto; }
.status-tab {
  flex-shrink: 0; padding: 5px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 600;
  background: transparent; border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted); cursor: pointer; transition: all 0.2s;
}
.status-tab.active { background: rgba(160,200,120,0.1); color: var(--color-primary); border-color: var(--color-primary); }

/* Match Card */
.match-card {
  background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);
  border-radius: 16px; overflow: hidden; cursor: pointer;
  transition: all 0.2s; position: relative;
}
.match-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(160,200,120,0.15); }

.match-card-head {
  padding: 14px 16px 0;
}
.match-title { font-size: 0.92rem; font-weight: 800; font-family: var(--font-display); text-transform: uppercase; }
.match-id { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 600; background: rgba(160,200,120,0.12); color: var(--color-primary); }

.match-card-body { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 16px; }
.match-info-left { display: flex; flex-direction: column; gap: 5px; }
.match-info-row { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--color-text-secondary); }

.match-card-image { width: 70px; height: 70px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
.match-card-image img { width: 100%; height: 100%; object-fit: cover; }

.match-card-foot { padding: 0 16px 14px; }

.players-bar { height: 4px; border-radius: 9999px; background: var(--color-border-subtle); margin-bottom: 8px; overflow: hidden; }
.players-fill { height: 100%; border-radius: 9999px; transition: width 0.5s; }

.match-foot-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.players-badge { padding: 3px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; }

.status-badge { padding: 3px 10px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
.status-badge.upcoming { background: #DBEAFE; color: #2563EB; }
.status-badge.registration_open { background: #D1FAE5; color: #059669; }
.status-badge.running { background: #FEF3C7; color: #D97706; }
.status-badge.completed { background: #F1F5F9; color: #64748B; }
.status-badge.cancelled { background: #FEE2E2; color: #DC2626; }

.match-foot-actions { display: flex; gap: 8px; margin-bottom: 8px; }
.action-btn {
  display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px;
  border-radius: 8px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--color-border-subtle);
  background: white; cursor: pointer; transition: all 0.2s;
}
.prize-btn { color: var(--color-text-secondary); }
.join-btn { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.room-btn { background: #FF9F43; color: white; border-color: #FF9F43; }
.room-btn:hover { opacity: 0.9; }
.join-btn:hover { opacity: 0.9; }
.full-btn { background: #FEE2E2; color: #DC2626; border-color: #FECACA; cursor: not-allowed; }

.match-countdown { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; color: var(--color-text-muted); justify-content: center; }

/* Skeleton */
.skeleton-card { height: 240px; border-radius: 16px; background: var(--color-bg-card); border: 1px solid var(--color-border-subtle); animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
.page-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--color-border-subtle); background: white; font-size: 0.82rem; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
