<template>
  <div class="match-details-page px-4 py-4 pb-28">
    <!-- Live Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="live-toast" :class="toast.type">
        <div class="toast-icon">
          <UserPlus v-if="toast.type === 'join'" :size="18" />
          <UserMinus v-else-if="toast.type === 'leave'" :size="18" />
          <AlertCircle v-else :size="18" />
        </div>
        <div class="toast-content">
          <span class="toast-title">{{ toast.title }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </div>
    </Transition>

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="back-btn">
        <ArrowLeft :size="18" />
      </button>
      <div class="flex-1">
        <h1 class="text-xl font-black" style="font-family: var(--font-display);">Match Details</h1>
        <div class="flex items-center gap-2 text-xs opacity-50">
          <span class="live-dot" />
          Live Updates
        </div>
      </div>
      <button @click="fetchMatch" class="refresh-btn" :class="{ 'animate-spin': loading }">
        <RefreshCw :size="16" />
      </button>
    </div>

    <div v-if="loading" class="flex flex-col gap-4">
      <div class="skeleton-banner h-52 rounded-2xl animate-pulse" />
      <div class="flex gap-3">
        <div class="skeleton-text h-20 flex-1 rounded-2xl animate-pulse" />
        <div class="skeleton-text h-20 flex-1 rounded-2xl animate-pulse" />
      </div>
      <div class="skeleton-text h-32 rounded-2xl animate-pulse" />
    </div>

    <div v-else-if="match" class="match-content">
      <!-- Match Banner/Header -->
      <div class="match-hero-card mb-6">
        <div class="hero-overlay" />
        <img :src="match.banner_image || getModeImage(match.mode)" class="hero-bg" />

        <div class="hero-content">
          <div class="flex justify-between items-center mb-4">
            <span class="status-chip" :class="match.status">
              <span class="status-dot" :class="match.status" />
              {{ formatStatus(match.status) }}
            </span>
            <span class="id-chip">ID: #{{ match.room_id || match.id }}</span>
          </div>
          <h2 class="hero-title">{{ match.title }}</h2>
          <div class="hero-meta">
            <div class="meta-item"><Calendar :size="14" /> {{ formatDate(match.match_starts_at) }}</div>
            <div class="meta-item"><MapPin :size="14" /> {{ match.map }}</div>
          </div>
        </div>

        <!-- Animated Slot Counter -->
        <div class="slot-counter" :class="{ 'almost-full': playerPercent >= 80, 'is-full': isFull }">
          <div class="slot-fill" :style="{ width: playerPercent + '%' }" />
          <div class="slot-text">
            <span class="slot-current" :class="{ 'pulse': isFull }">{{ match.players_count || 0 }}</span>
            <span class="slot-separator">/</span>
            <span class="slot-max">{{ match.max_players }}</span>
            <span class="slot-label">SLOTS</span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-4 gap-2 mb-6">
        <div class="stat-box fee">
          <span class="stat-label">Entry</span>
          <span class="stat-value" :class="{ 'text-primary': match.entry_fee > 0 }">
            {{ match.entry_fee > 0 ? '৳' + match.entry_fee : 'FREE' }}
          </span>
        </div>
        <div class="stat-box prize">
          <span class="stat-label">Prize</span>
          <span class="stat-value text-orange">৳{{ Number(match.prize_pool).toLocaleString() }}</span>
        </div>
        <div class="stat-box mode">
          <span class="stat-label">Mode</span>
          <span class="stat-value text-sm">{{ formatMode(match.mode) }}</span>
        </div>
        <div class="stat-box type">
          <span class="stat-label">Type</span>
          <span class="stat-value text-sm">{{ match.match_type || 'Classic' }}</span>
        </div>
      </div>

      <!-- Live Registration Bar -->
      <div class="live-reg-card mb-6">
        <div class="reg-header">
          <div class="flex items-center gap-2">
            <Zap :size="16" class="text-yellow-400" />
            <span class="text-sm font-bold">Registration {{ isFull ? 'Closed' : 'Open' }}</span>
          </div>
          <div class="reg-count" :class="{ 'warning': playerPercent >= 80, 'full': isFull }">
            <span class="count-num">{{ match.players_count || 0 }}</span>
            <span class="count-text">{{ isFull ? 'FULL' : 'joined' }}</span>
          </div>
        </div>
        <div class="reg-progress">
          <div class="reg-fill" :class="{ 'pulse': isFull }" :style="{ width: playerPercent + '%' }" />
          <div v-for="n in remainingSlots" :key="n" class="reg-empty" :style="{ left: ((match.players_count || 0) + n - 1) / match.max_players * 100 + '%' }" />
        </div>
        <div class="reg-footer">
          <span v-if="!isFull" class="spots-left">
            {{ match.max_players - (match.players_count || 0) }} spots remaining
          </span>
          <span v-else class="spots-full">
            Match is full!
          </span>
          <span class="reg-hint">Room details 10 mins before start</span>
        </div>
      </div>

      <!-- Sections Container -->
      <div class="flex flex-col gap-5">

        <!-- Prizes Section -->
        <div class="section-block">
          <h3 class="section-title">
            <Trophy class="text-primary" :size="20" />
            Prize Pool
          </h3>
          <div class="prize-grid">
            <div v-for="(prize, rank) in prizeBreakdown" :key="rank"
                 class="prize-card" :class="'rank-' + String(rank).toLowerCase().replace(/[^a-z0-9]/g, '')">
              <div class="prize-rank">
                <Trophy v-if="String(rank).toLowerCase().includes('1st')" :size="20" class="text-yellow-400" />
                <Medal v-else-if="String(rank).toLowerCase().includes('2nd')" :size="20" class="text-gray-300" />
                <Medal v-else-if="String(rank).toLowerCase().includes('3rd')" :size="20" class="text-amber-600" />
                <span v-else class="rank-num">{{ rank }}</span>
              </div>
              <div class="prize-info">
                <span class="prize-label">{{ rank }}</span>
                <span class="prize-amount">৳{{ Number(prize || 0).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Edit Name Badge -->
          <div v-if="isJoined" class="flex justify-center mt-4">
            <button @click="editGameName" class="edit-name-badge">
              <span class="flex items-center gap-2">
                <Edit2 :size="14" />
                Edit Your Game Name
              </span>
            </button>
          </div>
        </div>

        <!-- Players Section -->
        <div class="section-block">
          <div class="flex items-center justify-between mb-4">
            <h3 class="section-title mb-0">
              <Users class="text-blue-400" :size="20" />
              Players
            </h3>
            <div class="player-badge" :class="{ 'full': isFull }">
              <span class="badge-num">{{ match.players?.length || 0 }}</span>
              <span class="badge-sep">/</span>
              <span class="badge-max">{{ match.max_players }}</span>
            </div>
          </div>

          <TransitionGroup name="player-list" tag="div" class="players-grid">
            <div v-for="(player, index) in match.players" :key="player.id"
                 class="player-card" :style="{ '--delay': index * 0.05 + 's' }">
              <div class="player-slot">
                <span class="slot-num">#{{ player.slot_number }}</span>
              </div>
              <div class="player-avatar-wrap">
                <img :src="player.user?.avatar || 'https://ui-avatars.com/api/?name=' + player.in_game_name + '&background=random'"
                     class="player-avatar" alt="">
                <span class="avatar-status" :class="player.status" />
              </div>
              <div class="player-info">
                <span class="player-name">{{ player.in_game_name }}</span>
                <span class="player-uid">{{ player.user?.username || 'Player' }}</span>
              </div>
              <div class="player-status">
                <span class="status-badge" :class="player.status">
                  {{ player.status }}
                </span>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="!match.players?.length" class="empty-players">
            <Users :size="40" class="opacity-30" />
            <p>No players joined yet</p>
            <span>Be the first to register!</span>
          </div>

          <!-- Empty Slots Preview -->
          <div v-if="remainingSlots > 0 && match.players?.length" class="empty-slots">
            <div v-for="n in Math.min(remainingSlots, 4)" :key="'empty-' + n" class="empty-slot">
              <UserPlus :size="16" class="opacity-30" />
            </div>
            <span v-if="remainingSlots > 4" class="more-slots">+{{ remainingSlots - 4 }} more</span>
          </div>
        </div>

        <!-- Rules Section (Collapsible) -->
        <details class="rules-card group">
          <summary class="rules-header">
            <div class="flex items-center gap-2">
              <ScrollText class="text-orange" :size="20" />
              <span class="font-bold">Match Rules</span>
            </div>
            <ChevronDown :size="20" class="transition-transform group-open:rotate-180" />
          </summary>
          <div class="rules-content">
            <ul class="rules-list">
              <li v-for="(rule, i) in (match.rules ? match.rules.split('\n') : rules)" :key="i">
                <span class="rule-num">{{ i + 1 }}</span>
                <span>{{ rule }}</span>
              </li>
            </ul>
          </div>
        </details>

      </div>
    </div>

    <!-- Sticky Footer Action -->
    <div v-if="match" class="sticky-footer">
      <div class="footer-inner">
        <div class="entry-info">
          <span class="entry-label">Entry Fee</span>
          <span class="entry-value">{{ match.entry_fee > 0 ? '৳' + match.entry_fee : 'FREE' }}</span>
        </div>

        <div v-if="isJoined" class="joined-btn" @click="showRoomDetails">
          <Key :size="20" />
          <span>Room Details</span>
        </div>
        <button v-else class="join-btn"
          :class="{ 'disabled': isFull || match.status !== 'registration_open', 'loading': joining }"
          :disabled="joining || isFull || match.status !== 'registration_open'"
          @click="handleJoin"
        >
          <Loader2 v-if="joining" class="animate-spin" :size="20" />
          <template v-else>
            <ShieldCheck :size="20" />
            <span>{{ isFull ? 'Match Full' : 'Join Match' }}</span>
          </template>
        </button>
      </div>
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
  ArrowLeft, RefreshCw, Calendar, MapPin, Trophy, Users,
  ShieldCheck, ScrollText, CheckCircle, Loader2, Key, Copy,
  Zap, Medal, ChevronDown, UserPlus, UserMinus, AlertCircle, Edit2
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { openLoginModal } = useLoginModal()

const match = ref(null)
const loading = ref(true)
const joining = ref(false)
const previousPlayerIds = ref(new Set())
let pollTimer = null

// Toast notification state
const toast = ref({
  show: false,
  type: 'join', // join, leave, info
  title: '',
  message: '',
  timer: null
})

const rules = [
  "Team teaming is strictly prohibited and will lead to direct ban.",
  "Use of hack, scripts or any 3rd party apps is not allowed.",
  "Room ID & Password will be shared 10-15 mins before match.",
  "Must join before the match starts. No refund for no-show.",
  "Results will be declared within 30 minutes of match completion."
]

const prizeBreakdown = computed(() => {
  if (match.value?.prize_breakdown) {
    try {
      const b = typeof match.value.prize_breakdown === 'string'
        ? JSON.parse(match.value.prize_breakdown)
        : match.value.prize_breakdown
      return b
    } catch(e) {}
  }
  return { 1: 250, 2: 120, 3: 80 }
})

const playerPercent = computed(() => {
  if (!match.value) return 0
  return Math.floor(((match.value.players_count || 0) / match.value.max_players) * 100)
})

const remainingSlots = computed(() => {
  if (!match.value) return 0
  return Math.max(0, match.value.max_players - (match.value.players_count || 0))
})

const isJoined = computed(() => {
  if (!match.value || !authStore.user) return false
  return match.value.players?.some(p => p.user_id === authStore.user.id)
})

const isFull = computed(() => {
  if (!match.value) return false
  return (match.value.players_count || 0) >= match.value.max_players
})

// Show toast notification
function showToast(type, title, message) {
  if (toast.value.timer) clearTimeout(toast.value.timer)
  toast.value = { show: true, type, title, message, timer: null }
  toast.value.timer = setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

// Detect player changes for real-time updates
function detectPlayerChanges(newPlayers) {
  const newIds = new Set(newPlayers?.map(p => p.id) || [])

  // Check for new players
  newPlayers?.forEach(player => {
    if (!previousPlayerIds.value.has(player.id)) {
      showToast('join', 'New Player Joined!', `${player.in_game_name} just joined the match`)
    }
  })

  // Check for players who left
  previousPlayerIds.value.forEach(id => {
    if (!newIds.has(id)) {
      showToast('leave', 'Player Left', `A player has left the match`)
    }
  })

  // Update the tracking set
  previousPlayerIds.value = newIds
}

async function fetchMatch(quiet = false) {
  if (!quiet) loading.value = true
  try {
    const { data } = await api.get(`/matches/${route.params.id}`)
    const oldCount = match.value?.players_count || 0

    match.value = data.data

    // Detect changes for toast notifications
    if (quiet && data.data.players) {
      detectPlayerChanges(data.data.players)

      // Show urgency toast if getting full
      if (oldCount < data.data.players_count && data.data.players_count >= data.data.max_players * 0.8) {
        showToast('info', 'Almost Full!', `${data.data.max_players - data.data.players_count} spots left - Hurry up!`)
      }
    }
  } catch(e) {
    console.error(e)
  } finally {
    if (!quiet) loading.value = false
  }
}

onMounted(() => {
  fetchMatch()
  // Real-time polling every 3 seconds for faster updates
  pollTimer = setInterval(() => fetchMatch(true), 3000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (toast.value.timer) clearTimeout(toast.value.timer)
})

async function handleJoin() {
  if (!authStore.isAuthenticated) {
    openLoginModal(`/matches/${route.params.id}`)
    return
  }

  // Check balance first
  const wallet = authStore.user?.wallet
  const totalBalance = Number(wallet?.main_balance || 0) +
                       Number(wallet?.winning_balance || 0) +
                       Number(wallet?.bonus_balance || 0)

  if (match.value.entry_fee > totalBalance) {
    Swal.fire({
      title: 'Insufficient Balance!',
      text: `You need ৳${match.value.entry_fee} but you only have ৳${totalBalance.toFixed(2)}. Please deposit first.`,
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
    title: 'Match Registration',
    text: `Joining ${match.value.title}`,
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
      const { data } = await api.post(`/matches/${match.value.id}/join`, { in_game_name: ign })

      Swal.fire({
        title: 'Successfully Joined!',
        text: data.message || 'Good luck!',
        icon: 'success',
        confirmButtonColor: 'var(--color-primary)',
        timer: 2000
      })

      fetchMatch()
      authStore.init()
    } catch (e) {
      Swal.fire({
        title: 'Registration Failed',
        text: e.response?.data?.message || 'Something went wrong.',
        icon: 'error',
        confirmButtonColor: 'var(--color-primary)'
      })
    } finally {
      joining.value = false
    }
  }
}

async function editGameName() {
  const player = match.value.players?.find(p => p.user_id === authStore.user?.id)
  if (!player) return

  const { value: ign } = await Swal.fire({
    title: 'Edit Game Name',
    input: 'text',
    inputValue: player.in_game_name,
    inputPlaceholder: 'Your in-game name',
    showCancelButton: true,
    confirmButtonText: 'Update Name',
    confirmButtonColor: 'var(--color-primary)',
    inputValidator: (value) => {
      if (!value) return 'You need to enter your in-game name!'
    }
  })

  if (ign && ign !== player.in_game_name) {
    try {
      const { data } = await api.put(`/matches/${match.value.id}/update-name`, { in_game_name: ign })
      Swal.fire({
        title: 'Success!',
        text: data.message || 'Name updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
      fetchMatch(true)
    } catch (e) {
      Swal.fire({
        title: 'Update Failed',
        text: e.response?.data?.message || 'Something went wrong!',
        icon: 'error'
      })
    }
  }
}

async function showRoomDetails() {
  try {
    const { data } = await api.get(`/matches/${match.value.id}/room-details`)
    const { room_id, room_password, description } = data.data

    let descHtml = ''
    if (description) {
      descHtml = `
        <div class="p-4 rounded-xl border border-white/10 bg-black/20 mt-2 text-sm text-left opacity-90 leading-relaxed whitespace-pre-wrap">
          ${description}
        </div>
      `
    }

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
          ${descHtml}
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

if (!window.copyToClipboard) {
  window.copyToClipboard = (text) => {
    if (!text || text === 'TBA') return
    navigator.clipboard.writeText(text).then(() => {
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
}

function formatStatus(s) {
  const map = { upcoming: 'UPCOMING', registration_open: 'OPEN', running: 'LIVE', completed: 'ENDED' }
  return map[s] || s?.toUpperCase()
}

function formatMode(mode) {
  const map = { solo: 'Solo', duo: 'Duo', squad: 'Squad', clash_squad: 'Clash Squad', lone_wolf: 'Lone Wolf' }
  return map[mode] || mode
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function getRankLabel(rank) {
  if (rank == 1) return '1st Place'
  if (rank == 2) return '2nd Place'
  if (rank == 3) return '3rd Place'
  return `${rank}th Rank`
}

function getModeImage(mode) {
  return `https://ui-avatars.com/api/?name=${mode?.toUpperCase()}&background=A0C878&color=fff&size=500&bold=true`
}

onMounted(fetchMatch)
</script>

<style scoped>
.match-details-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

.edit-name-badge {
  background: var(--color-primary);
  color: var(--color-bg-page);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: none;
  cursor: pointer;
}
.edit-name-badge:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* ── Live Toast ────────────────────────────────────────────────────────── */
.live-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: calc(100% - 32px);
}

.live-toast.join {
  border-color: #10B981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), var(--color-bg-card));
}

.live-toast.leave {
  border-color: #EF4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--color-bg-card));
}

.live-toast.info {
  border-color: #F59E0B;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--color-bg-card));
}

.toast-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(160, 200, 120, 0.2);
  color: var(--color-primary);
}

.live-toast.join .toast-icon { background: rgba(16, 185, 129, 0.2); color: #10B981; }
.live-toast.leave .toast-icon { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
.live-toast.info .toast-icon { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }

.toast-content {
  display: flex;
  flex-direction: column;
}

.toast-title {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--color-text-primary);
}

.toast-message {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* Live dot */
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  animation: live-pulse 2s infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

/* Buttons */
.back-btn, .refresh-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover, .refresh-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Hero Card */
.match-hero-card {
  position: relative;
  height: 220px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.hero-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  color: white;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 900;
  font-family: var(--font-display);
  line-height: 1.2;
  margin-bottom: 10px;
}

.hero-meta {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Status Chip */
.status-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-chip.registration_open { background: var(--color-primary); color: white; }
.status-chip.registration_open .status-dot { animation: status-pulse 1.5s infinite; }
.status-chip.running { background: #10B981; color: white; }
.status-chip.running .status-dot { animation: status-pulse 0.8s infinite; }

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.id-chip {
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.8;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 10px;
  border-radius: 8px;
}

/* Slot Counter */
.slot-counter {
  position: absolute;
  bottom: 70px;
  left: 20px;
  right: 20px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.slot-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, var(--color-primary), #84CC16);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slot-counter.almost-full .slot-fill {
  background: linear-gradient(90deg, #F59E0B, #EF4444);
}

.slot-counter.is-full .slot-fill {
  background: linear-gradient(90deg, #EF4444, #DC2626);
}

.slot-text {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
  font-weight: 800;
}

.slot-current {
  font-size: 1.1rem;
  color: white;
}

.slot-current.pulse {
  animation: slot-pulse 0.5s ease-in-out;
}

@keyframes slot-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); color: #FFD700; }
}

.slot-separator {
  opacity: 0.5;
}

.slot-max {
  opacity: 0.7;
}

.slot-label {
  font-size: 0.6rem;
  opacity: 0.5;
  letter-spacing: 0.1em;
  margin-left: 4px;
}

/* Stats Grid */
.stat-box {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  padding: 14px 10px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.stat-box.fee { border-color: rgba(160, 200, 120, 0.3); }
.stat-box.prize { border-color: rgba(230, 126, 34, 0.3); }
.stat-box.mode { border-color: rgba(59, 130, 246, 0.3); }
.stat-box.type { border-color: rgba(168, 85, 247, 0.3); }

.stat-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 800;
  font-family: var(--font-display);
}

.text-primary { color: var(--color-primary); }
.text-orange { color: #E67E22; }

/* Live Registration Card */
.live-reg-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 20px;
  padding: 16px;
}

.reg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reg-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  background: rgba(160, 200, 120, 0.1);
  padding: 6px 12px;
  border-radius: 10px;
}

.reg-count.warning {
  background: rgba(245, 158, 11, 0.15);
}

.reg-count.full {
  background: rgba(239, 68, 68, 0.15);
}

.count-num {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--color-primary);
}

.reg-count.warning .count-num { color: #F59E0B; }
.reg-count.full .count-num { color: #EF4444; }

.count-text {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.6;
}

.reg-progress {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 99px;
  overflow: hidden;
  position: relative;
}

.reg-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #84CC16);
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.reg-fill.pulse {
  animation: fill-pulse 1s infinite;
}

@keyframes fill-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.reg-empty {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.1);
}

.reg-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 0.7rem;
}

.spots-left {
  color: var(--color-primary);
  font-weight: 700;
}

.spots-full {
  color: #EF4444;
  font-weight: 700;
}

.reg-hint {
  opacity: 0.4;
}

/* Section Titles */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.section-title.mb-0 {
  margin-bottom: 0;
}

/* Prize Grid */
.prize-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.prize-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  transition: all 0.3s;
}

.prize-card.rank-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
  border-color: rgba(255, 215, 0, 0.3);
}

.prize-card.rank-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), transparent);
  border-color: rgba(192, 192, 192, 0.3);
}

.prize-card.rank-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), transparent);
  border-color: rgba(205, 127, 50, 0.3);
}

.prize-rank {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(160, 200, 120, 0.1);
}

.rank-num {
  font-weight: 900;
  font-size: 0.85rem;
}

.prize-card.rank-1 .prize-rank { background: rgba(255, 215, 0, 0.2); }
.prize-card.rank-2 .prize-rank { background: rgba(192, 192, 192, 0.2); }
.prize-card.rank-3 .prize-rank { background: rgba(205, 127, 50, 0.2); }

.prize-info {
  display: flex;
  flex-direction: column;
}

.prize-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.6;
}

.prize-amount {
  font-size: 0.95rem;
  font-weight: 900;
  color: var(--color-primary);
}

.prize-card.rank-1 .prize-amount { color: #FFD700; }
.prize-card.rank-3 .prize-amount { color: #CD7F32; }

/* Player Badge */
.player-badge {
  display: flex;
  align-items: baseline;
  gap: 2px;
  background: rgba(59, 130, 246, 0.1);
  padding: 6px 12px;
  border-radius: 10px;
}

.player-badge.full {
  background: rgba(239, 68, 68, 0.1);
}

.badge-num {
  font-size: 1rem;
  font-weight: 900;
  color: #3B82F6;
}

.player-badge.full .badge-num { color: #EF4444; }

.badge-sep {
  opacity: 0.4;
}

.badge-max {
  opacity: 0.6;
}

/* Players Grid */
.players-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 14px;
  transition: all 0.3s;
  animation: player-enter 0.4s ease-out backwards;
  animation-delay: var(--delay);
}

@keyframes player-enter {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.player-card:hover {
  border-color: var(--color-primary);
  background: rgba(160, 200, 120, 0.05);
}

.player-slot {
  width: 36px;
  text-align: center;
}

.slot-num {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-primary);
  background: rgba(160, 200, 120, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.player-avatar-wrap {
  position: relative;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-bg-card);
}

.avatar-status.confirmed { background: #10B981; }
.avatar-status.pending { background: #F59E0B; }
.avatar-status.canceled { background: #EF4444; }

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 800;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.player-uid {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.status-badge {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 8px;
}

.status-badge.confirmed {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

/* Empty Players */
.empty-players {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-muted);
}

.empty-players p {
  margin: 16px 0 4px;
  font-weight: 700;
}

.empty-players span {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* Empty Slots Preview */
.empty-slots {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
}

.empty-slot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px dashed rgba(160, 200, 120, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-slots {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

/* Rules Card */
.rules-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  overflow: hidden;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  list-style: none;
}

.rules-header::-webkit-details-marker {
  display: none;
}

.rules-content {
  padding: 0 16px 16px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-subtle);
}

.rules-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.rule-num {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
}

/* Sticky Footer */
.sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: rgba(255, 253, 246, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--color-border-subtle);
  z-index: 100;
}

.footer-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.entry-info {
  display: flex;
  flex-direction: column;
}

.entry-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.entry-value {
  font-size: 1.3rem;
  font-weight: 900;
  font-family: var(--font-display);
  color: var(--color-primary);
}

.join-btn, .joined-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 28px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.join-btn {
  background: linear-gradient(135deg, var(--color-primary), #84CC16);
  color: white;
  box-shadow: 0 8px 24px rgba(160, 200, 120, 0.4);
}

.join-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(160, 200, 120, 0.5);
}

.join-btn.disabled {
  background: var(--color-text-muted);
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.join-btn.loading {
  pointer-events: none;
}

.joined-btn {
  background: linear-gradient(135deg, #FF9F43, #F39C12);
  color: white;
  box-shadow: 0 8px 24px rgba(255, 159, 67, 0.4);
}

.joined-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 159, 67, 0.5);
}

/* Player List Transitions */
.player-list-enter-active {
  transition: all 0.4s ease-out;
}

.player-list-leave-active {
  transition: all 0.3s ease-in;
}

.player-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.player-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.player-list-move {
  transition: transform 0.4s ease;
}
</style>
