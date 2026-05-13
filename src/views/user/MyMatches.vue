<template>
  <div class="px-4 py-4">

    <!-- ── Header ────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <Trophy :size="20" style="color: var(--color-neon-orange);" />
        <h1 class="text-lg font-bold" style="font-family: var(--font-display);">My Matches</h1>
      </div>
      <button @click="loadMatches" class="p-2 rounded-lg" style="background: var(--color-bg-card);">
        <RefreshCw :size="16" :class="loading ? 'animate-spin' : ''" style="color: var(--color-text-muted);" />
      </button>
    </div>

    <!-- ── Filter Tabs ────────────────────────────────────────────────── -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
      <button v-for="f in filters" :key="f.value"
              @click="activeFilter = f.value; loadMatches()"
              class="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              :style="activeFilter === f.value
                ? 'background: var(--color-neon-orange); color: white;'
                : 'background: var(--color-bg-card); color: var(--color-text-secondary); border: 1px solid var(--color-border-subtle);'">
        {{ f.label }}
      </button>
    </div>

    <!-- ── Loading ────────────────────────────────────────────────────── -->
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 :size="28" class="animate-spin" style="color: var(--color-neon-orange);" />
    </div>

    <!-- ── Empty ──────────────────────────────────────────────────────── -->
    <div v-else-if="matches.length === 0"
         class="text-center py-12 rounded-2xl"
         style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
      <Swords :size="40" class="mx-auto mb-3" style="color: var(--color-text-muted);" />
      <p class="font-semibold mb-1">No matches found.</p>
      <p class="text-sm mb-4" style="color: var(--color-text-muted);">Join some matches to see them here!</p>
      <router-link to="/matches" class="btn-neon" style="padding: 0.6rem 1.5rem; font-size: 0.85rem; display: inline-block;">
        Browse Matches
      </router-link>
    </div>

    <!-- ── Match Cards ────────────────────────────────────────────────── -->
    <div v-else class="flex flex-col gap-3">
      <div v-for="match in matches" :key="match.id"
           class="rounded-2xl p-4"
           style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">

        <!-- Top row -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="font-bold text-sm">{{ match.title }}</div>
            <div class="text-xs mt-0.5" style="color: var(--color-text-muted);">
              {{ match.mode }} · {{ match.map }}
            </div>
          </div>
          <!-- Status badge -->
          <span class="badge-status text-xs"
                :class="{
                  'badge-live': match.status === 'running',
                  'badge-upcoming': match.status === 'upcoming' || match.status === 'registration_open',
                  'badge-completed': match.status === 'completed',
                }">
            {{ match.status.replace('_', ' ').toUpperCase() }}
          </span>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="text-center rounded-lg py-2" style="background: rgba(255,255,255,0.04);">
            <div class="text-xs font-bold" style="color: var(--color-neon-orange);">
              {{ match.players?.[0]?.rank_position ?? '—' }}
            </div>
            <div class="text-xs" style="color: var(--color-text-muted);">Rank</div>
          </div>
          <div class="text-center rounded-lg py-2" style="background: rgba(255,255,255,0.04);">
            <div class="text-xs font-bold" style="color: var(--color-neon-green);">
              {{ match.players?.[0]?.kills ?? '—' }}
            </div>
            <div class="text-xs" style="color: var(--color-text-muted);">Kills</div>
          </div>
          <div class="text-center rounded-lg py-2" style="background: rgba(255,255,255,0.04);">
            <div class="text-xs font-bold" style="color: var(--color-neon-purple);">
              ৳{{ match.players?.[0]?.prize_won ?? '0' }}
            </div>
            <div class="text-xs" style="color: var(--color-text-muted);">Prize</div>
          </div>
        </div>

        <!-- Footer row -->
        <div class="flex items-center justify-between pt-2"
             style="border-top: 1px solid var(--color-border-subtle);">
          <div class="flex items-center gap-1 text-xs" style="color: var(--color-text-muted);">
            <Calendar :size="12" />
            {{ formatDate(match.match_starts_at) }}
          </div>
          <div class="flex items-center gap-1 text-xs" style="color: var(--color-text-muted);">
            <Users :size="12" />
            {{ match.slots_filled }}/{{ match.max_players }}
          </div>
          <router-link :to="`/matches/${match.id}`"
                       class="text-xs font-semibold flex items-center gap-0.5"
                       style="color: var(--color-neon-orange);">
            Details <ChevronRight :size="12" />
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import {
  Trophy, Swords, RefreshCw, Loader2,
  Calendar, Users, ChevronRight
} from 'lucide-vue-next'

const loading = ref(false)
const matches = ref([])
const activeFilter = ref('')

const filters = [
  { label: 'All',       value: '' },
  { label: 'Running',   value: 'running' },
  { label: 'Upcoming',  value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
]

async function loadMatches() {
  loading.value = true
  try {
    const { data } = await api.get('/my-matches', {
      params: activeFilter.value ? { status: activeFilter.value } : {}
    })
    matches.value = data.data?.data ?? []
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(loadMatches)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
