<template>
  <div class="px-4 py-4">

    <!-- ── Header ────────────────────────────────────────────────────── -->
    <div class="flex items-center gap-2 mb-5">
      <Wallet :size="20" style="color: var(--color-neon-orange);" />
      <h1 class="text-lg font-bold" style="font-family: var(--font-display);">My Wallet</h1>
    </div>

    <!-- ── Total Balance Card ─────────────────────────────────────────── -->
    <div class="relative rounded-2xl overflow-hidden mb-4 p-5 text-center"
         style="background: linear-gradient(135deg, rgba(255,69,0,0.3) 0%, rgba(155,48,255,0.2) 100%); border: 1px solid rgba(255,69,0,0.3);">
      <div class="absolute inset-0" style="backdrop-filter: blur(8px);" />
      <div class="relative z-10">
        <p class="text-xs font-medium uppercase tracking-widest mb-1" style="color: rgba(255,255,255,0.6);">Total Balance</p>
        <p class="text-4xl font-black text-white" style="font-family: var(--font-display);">
          ৳{{ totalBalance }}
        </p>
        <p class="text-sm mt-1" style="color: rgba(255,255,255,0.5);">BDT</p>
      </div>
    </div>

    <!-- ── 3-Bucket Breakdown ─────────────────────────────────────────── -->
    <div class="grid grid-cols-3 gap-2 mb-5">
      <div v-for="bucket in buckets" :key="bucket.key"
           class="rounded-xl p-3 text-center"
           :style="`background: var(--color-bg-card); border: 1px solid ${bucket.border};`">
        <component :is="bucket.icon" :size="16" class="mx-auto mb-1.5" :style="`color: ${bucket.color};`" />
        <div class="text-base font-black" :style="`color: ${bucket.color}; font-family: var(--font-display);`">
          ৳{{ walletStore.wallet?.[bucket.key] ?? '0.00' }}
        </div>
        <div class="text-xs mt-0.5" style="color: var(--color-text-muted);">{{ bucket.label }}</div>
      </div>
    </div>

    <!-- ── Action Buttons ─────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <router-link to="/wallet/deposit"
        class="flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-sm"
        style="background: rgba(0,255,136,0.12); border: 1px solid rgba(0,255,136,0.3); color: var(--color-neon-green);">
        <ArrowDownCircle :size="18" />
        Deposit
      </router-link>
      <router-link to="/wallet/withdraw"
        class="flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-sm"
        style="background: rgba(255,69,0,0.12); border: 1px solid rgba(255,69,0,0.3); color: var(--color-neon-orange);">
        <ArrowUpCircle :size="18" />
        Withdraw
      </router-link>
      <router-link to="/referral"
        class="flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-sm"
        style="background: rgba(155,48,255,0.12); border: 1px solid rgba(155,48,255,0.3); color: var(--color-neon-purple);">
        <Gift :size="18" />
        Referral
      </router-link>
      <router-link to="/wallet/transactions"
        class="flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-sm"
        style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); color: var(--color-neon-blue);">
        <History :size="18" />
        History
      </router-link>
    </div>

    <!-- ── Recent Transactions ────────────────────────────────────────── -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-bold text-sm" style="font-family: var(--font-display);">Recent Transactions</h2>
        <router-link to="/wallet/transactions" class="flex items-center gap-1 text-xs"
                     style="color: var(--color-neon-orange);">
          View All <ChevronRight :size="12" />
        </router-link>
      </div>

      <div v-if="loadingTx" class="flex justify-center py-8">
        <Loader2 :size="22" class="animate-spin" style="color: var(--color-neon-orange);" />
      </div>

      <div v-else-if="transactions.length === 0"
           class="text-center py-8 rounded-xl"
           style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
        <History :size="28" class="mx-auto mb-2" style="color: var(--color-text-muted);" />
        <p class="text-sm" style="color: var(--color-text-muted);">No transactions yet.</p>
      </div>

      <div v-else class="flex flex-col gap-2">
        <div v-for="tx in transactions" :key="tx.id"
             class="flex items-center gap-3 p-3 rounded-xl"
             style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
          <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
               :style="tx.direction === 'credit'
                 ? 'background: rgba(0,255,136,0.12); border: 1px solid rgba(0,255,136,0.3);'
                 : 'background: rgba(255,69,0,0.12); border: 1px solid rgba(255,69,0,0.3);'">
            <component :is="tx.direction === 'credit' ? ArrowDownCircle : ArrowUpCircle"
                       :size="16"
                       :style="tx.direction === 'credit' ? 'color: var(--color-neon-green)' : 'color: var(--color-neon-orange)'" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ tx.description || tx.type }}</div>
            <div class="text-xs" style="color: var(--color-text-muted);">{{ formatDate(tx.created_at) }}</div>
          </div>
          <div class="font-bold text-sm"
               :style="tx.direction === 'credit' ? 'color: var(--color-neon-green)' : 'color: var(--color-neon-orange)'">
            {{ tx.direction === 'credit' ? '+' : '-' }}৳{{ tx.amount }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import api from '@/services/api'
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, Gift, History,
  ChevronRight, Loader2, Coins, Star, Gem
} from 'lucide-vue-next'

const walletStore = useWalletStore()
const transactions = ref([])
const loadingTx = ref(false)

const totalBalance = computed(() => {
  const w = walletStore.wallet
  if (!w) return '0.00'
  return (parseFloat(w.main_balance || 0) + parseFloat(w.winning_balance || 0) + parseFloat(w.bonus_balance || 0)).toFixed(2)
})

const buckets = [
  { key: 'main_balance',    label: 'Main',    icon: Coins,  color: 'var(--color-neon-orange)', border: 'rgba(255,69,0,0.25)' },
  { key: 'winning_balance', label: 'Winning', icon: Star,   color: 'var(--color-neon-green)',  border: 'rgba(0,255,136,0.25)' },
  { key: 'bonus_balance',   label: 'Bonus',   icon: Gem,    color: 'var(--color-neon-purple)', border: 'rgba(155,48,255,0.25)' },
]

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  if (!walletStore.wallet) await walletStore.fetchWallet()
  loadingTx.value = true
  try {
    const { data } = await api.get('/wallet/transactions', { params: { per_page: 10 } })
    transactions.value = data.data?.data ?? []
  } catch { /* ignore */ } finally {
    loadingTx.value = false
  }
})
</script>
