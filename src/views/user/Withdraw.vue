<template>
  <div class="px-4 py-4 max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="p-2 rounded-lg bg-white/5 border border-white/10">
        <ChevronLeft :size="20" />
      </button>
      <h1 class="text-xl font-bold" style="font-family: var(--font-display);">Withdraw Money</h1>
    </div>

    <!-- Balance Summary -->
    <div class="grid grid-cols-2 gap-3 mb-8">
      <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
        <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Main Balance</p>
        <p class="text-xl font-black text-neon-orange" style="font-family: var(--font-display);">৳{{ walletStore.wallet?.main_balance || '0.00' }}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
        <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Winning Balance</p>
        <p class="text-xl font-black text-neon-green" style="font-family: var(--font-display);">৳{{ walletStore.wallet?.winning_balance || '0.00' }}</p>
      </div>
    </div>

    <!-- Withdraw Form -->
    <div class="space-y-6">
      <div class="p-5 rounded-3xl border border-white/10 space-y-5" style="background: var(--color-bg-card);">
        
        <!-- Source Selection -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Withdraw From</label>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="source in sources" :key="source.id"
                    @click="form.wallet_bucket = source.id"
                    class="py-3 rounded-xl text-xs font-bold transition-all border"
                    :style="form.wallet_bucket === source.id 
                      ? `background: ${source.color}20; border-color: ${source.color}; color: ${source.color};` 
                      : 'background: rgba(255,255,255,0.03); border-color: transparent; color: gray;'">
              {{ source.name }}
            </button>
          </div>
        </div>

        <!-- Method Selection -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Payment Method</label>
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button v-for="method in methods" :key="method.id"
                    @click="form.payment_method = method.id"
                    class="flex-shrink-0 px-5 py-3 rounded-xl flex flex-col items-center gap-2 border transition-all"
                    :style="form.payment_method === method.id 
                      ? `background: ${method.color}20; border-color: ${method.color}; color: white;` 
                      : 'background: rgba(255,255,255,0.03); border-color: transparent; color: gray;'">
              <component :is="method.icon" :size="20" :style="`color: ${method.color};`" />
              <span class="text-[10px] uppercase font-black">{{ method.name }}</span>
            </button>
          </div>
        </div>

        <!-- Inputs -->
        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Amount</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-white/30">৳</span>
              <input v-model="form.amount" type="number" placeholder="Min 100" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-bold focus:outline-none focus:border-neon-orange" />
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Account Number</label>
            <input v-model="form.account_number" type="text" placeholder="01XXXXXXXXX" class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-neon-orange" />
          </div>
          <div class="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-2">
            <AlertTriangle :size="14" class="text-orange-400 mt-0.5" />
            <p class="text-[10px] text-orange-200/70 leading-relaxed uppercase font-bold tracking-tight">
              Please double check your account number. We are not responsible for wrong numbers.
            </p>
          </div>
        </div>
      </div>

      <button 
        @click="submitWithdraw"
        :disabled="loading || !form.amount || !form.account_number"
        class="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        style="background: var(--color-neon-orange); color: white; box-shadow: 0 4px 15px rgba(255,69,0,0.3);"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <ArrowUpCircle v-else :size="20" />
        {{ loading ? 'PROCESSING...' : 'REQUEST WITHDRAW' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { 
  ChevronLeft, ArrowUpCircle, Loader2, AlertTriangle, 
  Smartphone, Wallet, Landmark 
} from 'lucide-vue-next'
import api from '@/services/api'

const router = useRouter()
const walletStore = useWalletStore()
const loading = ref(false)

const form = ref({
  amount: '',
  wallet_bucket: 'winning',
  payment_method: 'bkash',
  account_number: '',
  account_name: ''
})

const sources = [
  { id: 'winning', name: 'Winning', color: '#00FF88' },
  { id: 'main', name: 'Main', color: '#FF4500' }
]

const methods = [
  { id: 'bkash', name: 'bKash', color: '#D12053', icon: Smartphone },
  { id: 'nagad', name: 'Nagad', color: '#F7941D', icon: Smartphone },
  { id: 'rocket', name: 'Rocket', color: '#8C3494', icon: Landmark }
]

async function submitWithdraw() {
  loading.value = true
  try {
    const { data } = await api.post('/wallet/withdraw', form.value)
    if (data.success) {
      alert(data.message)
      router.push('/wallet')
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Withdrawal failed.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!walletStore.wallet) walletStore.fetchWallet()
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
