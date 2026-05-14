<template>
  <div class="px-4 py-4 max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="p-2 rounded-lg bg-white/5 border border-white/10">
        <ChevronLeft :size="20" />
      </button>
      <h1 class="text-xl font-bold" style="font-family: var(--font-display);">Refer & Earn</h1>
    </div>

    <!-- Hero Card -->
    <div class="relative rounded-3xl overflow-hidden p-6 mb-8 border border-white/10"
         style="background: linear-gradient(135deg, rgba(155,48,255,0.2) 0%, rgba(255,69,0,0.1) 100%);">
      <div class="absolute top-0 right-0 p-4 opacity-10">
        <Gift :size="80" />
      </div>
      <div class="relative z-10">
        <h2 class="text-2xl font-black text-white mb-2" style="font-family: var(--font-display);">Get ৳20 For Each Friend</h2>
        <p class="text-xs text-gray-400 leading-relaxed max-w-[200px]">
          Share your code with friends and earn rewards when they make their first deposit.
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-3 mb-8">
      <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Referrals</p>
        <p class="text-xl font-black text-white" style="font-family: var(--font-display);">{{ stats.total_referrals || 0 }}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Earnings</p>
        <p class="text-xl font-black text-neon-green" style="font-family: var(--font-display);">৳{{ stats.total_earnings || '0.00' }}</p>
      </div>
    </div>

    <!-- Share Section -->
    <div class="space-y-6 mb-10">
      <div class="p-5 rounded-2xl border border-white/10 space-y-4" style="background: var(--color-bg-card);">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 text-center">Your Referral Code</label>
          <div class="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10">
            <div class="flex-1 text-center font-black text-2xl tracking-[0.2em] text-neon-orange uppercase py-2">
              {{ stats.referral_code || '------' }}
            </div>
            <button @click="copyText(stats.referral_code)" class="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Copy :size="20" class="text-gray-400" />
            </button>
          </div>
        </div>

        <div class="pt-2">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 text-center">Share Link</label>
          <div class="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10">
            <div class="flex-1 truncate text-xs text-gray-400 px-2">
              {{ stats.referral_link || 'Loading...' }}
            </div>
            <button @click="copyText(stats.referral_link)" class="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Share2 :size="20" class="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Referrals -->
    <div>
      <h3 class="text-sm font-bold uppercase tracking-widest mb-4" style="font-family: var(--font-display);">Recent Referrals</h3>
      <div v-if="loading" class="flex justify-center py-10">
        <Loader2 :size="24" class="animate-spin text-neon-orange" />
      </div>
      <div v-else-if="referrals.length === 0" class="text-center py-10 rounded-2xl bg-white/5 border border-dashed border-white/10">
        <Users :size="30" class="mx-auto mb-2 text-gray-600" />
        <p class="text-xs text-gray-500 font-bold uppercase">No referrals yet</p>
      </div>
      <div v-else class="space-y-2">
        <div v-for="ref in referrals" :key="ref.id"
             class="flex items-center justify-between p-4 rounded-xl border border-white/5"
             style="background: var(--color-bg-card);">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-neon-orange/10 flex items-center justify-center text-neon-orange font-bold text-xs uppercase">
              {{ ref.username.substring(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-bold text-white">{{ ref.username }}</p>
              <p class="text-[10px] text-gray-500 uppercase">{{ formatDate(ref.created_at) }}</p>
            </div>
          </div>
          <div class="px-2 py-1 rounded bg-green-500/10 text-[9px] font-black text-green-400 uppercase tracking-tighter">
            Joined
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  ChevronLeft, Gift, Copy, Share2, 
  Users, Loader2 
} from 'lucide-vue-next'
import api from '@/services/api'

const loading = ref(false)
const stats = ref({})
const referrals = ref([])

async function fetchReferralData() {
  loading.value = true
  try {
    const { data } = await api.get('/referral')
    if (data.success) {
      stats.value = data.data.stats
      referrals.value = data.data.referrals
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function copyText(txt) {
  if (!txt) return
  navigator.clipboard.writeText(txt)
  alert('Copied to clipboard!')
}

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  fetchReferralData()
})
</script>
