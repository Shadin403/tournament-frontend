<template>
  <div class="px-4 py-4 max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="p-2 rounded-lg bg-white/5 border border-white/10">
          <ChevronLeft :size="20" />
        </button>
        <h1 class="text-xl font-bold" style="font-family: var(--font-display);">History</h1>
      </div>
      <button @click="fetchTransactions" class="p-2 text-gray-400 hover:text-white transition-colors">
        <RefreshCw :size="18" :class="{ 'animate-spin': loading }" />
      </button>
    </div>

    <!-- Filters (Optional, keeping it simple for now) -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      <button v-for="f in filters" :key="f.id"
              @click="selectedFilter = f.id"
              class="flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border"
              :style="selectedFilter === f.id 
                ? 'background: var(--color-neon-orange); border-color: var(--color-neon-orange); color: white;' 
                : 'background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); color: gray;'">
        {{ f.name }}
      </button>
    </div>

    <!-- Transaction List -->
    <div v-if="loading && transactions.length === 0" class="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 :size="32" class="animate-spin text-neon-orange" />
      <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Loading Records...</p>
    </div>

    <div v-else-if="transactions.length === 0" class="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
      <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
        <History :size="40" class="text-gray-600" />
      </div>
      <p class="text-sm font-bold text-gray-500 uppercase tracking-widest">No Transactions Found</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="tx in transactions" :key="tx.id"
           class="group relative overflow-hidden p-4 rounded-2xl border border-white/10 transition-all hover:border-white/20"
           style="background: var(--color-bg-card);">
        
        <div class="flex items-center justify-between relative z-10">
          <div class="flex items-center gap-4">
            <!-- Icon -->
            <div class="w-10 h-10 rounded-xl flex items-center justify-center border"
                 :style="tx.direction === 'credit' 
                   ? 'background: rgba(0,255,136,0.1); border-color: rgba(0,255,136,0.2); color: var(--color-neon-green);' 
                   : 'background: rgba(255,69,0,0.1); border-color: rgba(255,69,0,0.2); color: var(--color-neon-orange);'">
              <component :is="tx.direction === 'credit' ? ArrowDownCircle : ArrowUpCircle" :size="20" />
            </div>

            <!-- Details -->
            <div>
              <p class="text-sm font-bold text-white">{{ tx.description || tx.type.replace('_', ' ') }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                  {{ tx.wallet_bucket }}
                </span>
                <span class="text-[10px] text-gray-500 font-medium">{{ formatDate(tx.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Amount -->
          <div class="text-right">
            <p class="text-lg font-black" :style="tx.direction === 'credit' ? 'color: var(--color-neon-green);' : 'color: var(--color-neon-orange);'" style="font-family: var(--font-display);">
              {{ tx.direction === 'credit' ? '+' : '-' }}৳{{ tx.amount }}
            </p>
            <p class="text-[9px] text-gray-600 font-bold uppercase">Balance: ৳{{ tx.balance_after }}</p>
          </div>
        </div>

        <!-- Glow effect on hover -->
        <div class="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl pointer-events-none"
             :style="`background: ${tx.direction === 'credit' ? 'var(--color-neon-green)' : 'var(--color-neon-orange)'};`" />
      </div>

      <!-- Pagination / Load More -->
      <button v-if="hasMore" 
              @click="loadMore"
              :disabled="loading"
              class="w-full py-4 mt-4 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all">
        {{ loading ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  ChevronLeft, ArrowDownCircle, ArrowUpCircle, 
  History, Loader2, RefreshCw 
} from 'lucide-vue-next'
import api from '@/services/api'

const transactions = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(false)
const selectedFilter = ref('all')

const filters = [
  { id: 'all', name: 'All' },
  { id: 'deposit', name: 'Deposits' },
  { id: 'withdraw', name: 'Withdrawals' },
  { id: 'match_entry', name: 'Matches' },
  { id: 'match_prize', name: 'Prizes' }
]

async function fetchTransactions(reset = true) {
  if (reset) {
    page.value = 1
    transactions.value = []
  }
  loading.value = true
  try {
    const { data } = await api.get('/wallet/transactions', {
      params: { 
        page: page.value, 
        per_page: 20,
        type: selectedFilter.value === 'all' ? null : selectedFilter.value 
      }
    })
    
    if (data.success) {
      const newTx = data.data?.data ?? []
      transactions.value = [...transactions.value, ...newTx]
      hasMore.value = data.data?.next_page_url !== null
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  page.value++
  fetchTransactions(false)
}

function formatDate(dt) {
  const d = new Date(dt)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + 
         d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
}

onMounted(() => {
  fetchTransactions()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
