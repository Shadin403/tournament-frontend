<template>
  <div class="px-4 py-4 max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="p-2 rounded-lg bg-white/5 border border-white/10">
        <ChevronLeft :size="20" />
      </button>
      <h1 class="text-xl font-bold" style="font-family: var(--font-display);">Add Money</h1>
    </div>

    <!-- Status Message from Redirect -->
    <div v-if="statusMessage" 
         :class="['p-4 rounded-xl mb-6 flex items-start gap-3 border', 
                  statusType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400']">
      <CheckCircle2 v-if="statusType === 'success'" :size="20" class="mt-0.5" />
      <AlertCircle v-else :size="20" class="mt-0.5" />
      <p class="text-sm font-medium">{{ statusMessage }}</p>
    </div>

    <!-- Payment Type Selector -->
    <div class="grid grid-cols-2 gap-3 mb-8">
      <button 
        v-for="type in paymentTypes" 
        :key="type.id"
        @click="selectedType = type.id"
        class="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 border-2"
        :style="selectedType === type.id 
          ? `background: ${type.activeBg}; border-color: ${type.color}; box-shadow: 0 0 15px ${type.glow};` 
          : 'background: var(--color-bg-card); border-color: transparent;'"
      >
        <component :is="type.icon" :size="24" :style="`color: ${selectedType === type.id ? 'white' : type.color};`" />
        <span class="text-sm font-bold" :class="selectedType === type.id ? 'text-white' : 'text-gray-400'">{{ type.name }}</span>
      </button>
    </div>

    <!-- ── ONLINE PAYMENT FORM ────────────────────────────────────────── -->
    <div v-if="selectedType === 'online'" class="space-y-6">
      <div class="p-5 rounded-2xl border border-white/10" style="background: var(--color-bg-card);">
        <label class="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Deposit Amount (BDT)</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-white/30">৳</span>
          <input 
            v-model="onlineAmount"
            type="number" 
            placeholder="0.00"
            class="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-2xl font-black text-white focus:outline-none focus:border-neon-orange transition-all"
            style="font-family: var(--font-display);"
          />
        </div>
        
        <div class="grid grid-cols-4 gap-2 mt-4">
          <button v-for="val in [100, 500, 1000, 2000]" :key="val"
                  @click="onlineAmount = val"
                  class="py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            +৳{{ val }}
          </button>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
        <Info :size="18" class="text-blue-400 mt-0.5" />
        <p class="text-xs text-blue-300 leading-relaxed">
          You will be redirected to our secure payment gateway to complete the transaction via bKash, Nagad, or Rocket.
        </p>
      </div>

      <button 
        @click="initiateOnlinePayment"
        :disabled="loading || onlineAmount < 50"
        class="w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        style="background: var(--color-neon-orange); color: white; box-shadow: 0 4px 15px rgba(255,69,0,0.3);"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <Zap v-else :size="20" />
        {{ loading ? 'REDIRECTING...' : 'PAY NOW' }}
      </button>
    </div>

    <!-- ── MANUAL PAYMENT FORM ────────────────────────────────────────── -->
    <div v-else class="space-y-6">
      <!-- Method Selector -->
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button v-for="method in manualMethods" :key="method.id"
                @click="selectedManualMethod = method.id"
                class="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border"
                :style="selectedManualMethod === method.id 
                  ? `background: ${method.color}; border-color: ${method.color}; color: white;` 
                  : 'background: transparent; border-color: rgba(255,255,255,0.1); color: gray;'">
          {{ method.name }}
        </button>
      </div>

      <div class="p-5 rounded-2xl border border-white/10" style="background: var(--color-bg-card);">
        <div class="mb-5 p-4 rounded-xl bg-black/40 border border-dashed border-white/20 text-center">
          <p class="text-xs text-gray-500 uppercase font-bold mb-1">Send Money To ({{ manualMethods.find(m => m.id === selectedManualMethod)?.name }})</p>
          <div class="flex items-center justify-center gap-2">
            <p class="text-xl font-black text-white tracking-widest">017XXXXXXXX</p>
            <button @click="copyNumber('017XXXXXXXX')" class="p-1.5 rounded-md bg-white/5 hover:bg-white/10">
              <Copy :size="14" />
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Amount</label>
            <input v-model="manualForm.amount" type="number" class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-orange" />
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Your Number</label>
            <input v-model="manualForm.sender_number" type="text" placeholder="01XXXXXXXXX" class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-orange" />
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Transaction ID</label>
            <input v-model="manualForm.transaction_id" type="text" placeholder="TRX..." class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-orange" />
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Screenshot</label>
            <div class="relative group cursor-pointer" @click="$refs.fileInput.click()">
              <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*" />
              <div v-if="!filePreview" class="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-neon-orange transition-all">
                <ImagePlus :size="32" class="text-gray-500" />
                <span class="text-xs text-gray-500 font-bold uppercase">Upload Receipt</span>
              </div>
              <div v-else class="relative rounded-xl overflow-hidden aspect-video border border-white/10">
                <img :src="filePreview" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <p class="text-xs font-bold text-white uppercase">Change Photo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        @click="submitManualDeposit"
        :disabled="loading || !manualForm.amount || !manualForm.sender_number || !file"
        class="w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style="background: var(--color-neon-green); color: black;"
      >
        <Loader2 v-if="loading" :size="20" class="animate-spin" />
        <Send v-else :size="20" />
        {{ loading ? 'SUBMITTING...' : 'SUBMIT REQUEST' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ChevronLeft, Zap, Wallet, Info, Loader2, ImagePlus, 
  Send, Copy, CheckCircle2, AlertCircle 
} from 'lucide-vue-next'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const selectedType = ref('online')
const selectedManualMethod = ref('bkash')
const loading = ref(false)

const onlineAmount = ref(100)
const manualForm = ref({
  amount: '',
  sender_number: '',
  transaction_id: ''
})
const file = ref(null)
const filePreview = ref(null)

const statusMessage = ref(route.query.message || '')
const statusType = ref(route.query.status || '')

const paymentTypes = [
  { id: 'online', name: 'Instant Add', icon: Zap, color: 'var(--color-neon-orange)', glow: 'rgba(255,69,0,0.3)', activeBg: 'rgba(255,69,0,0.2)' },
  { id: 'manual', name: 'Manual Add', icon: Wallet, color: 'var(--color-neon-green)', glow: 'rgba(0,255,136,0.3)', activeBg: 'rgba(0,255,136,0.2)' }
]

const manualMethods = [
  { id: 'bkash', name: 'bKash', color: '#D12053' },
  { id: 'nagad', name: 'Nagad', color: '#F7941D' },
  { id: 'rocket', name: 'Rocket', color: '#8C3494' }
]

function handleFileChange(e) {
  const f = e.target.files[0]
  if (f) {
    file.value = f
    filePreview.value = URL.createObjectURL(f)
  }
}

function copyNumber(num) {
  navigator.clipboard.writeText(num)
  // Show toast or something
}

async function initiateOnlinePayment() {
  loading.value = true
  try {
    const { data } = await api.post('/wallet/online-deposit', {
      amount: onlineAmount.value
    })
    
    if (data.success && data.payment_url) {
      window.location.href = data.payment_url
    } else {
      alert(data.message || 'Payment initiation failed.')
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Something went wrong.')
  } finally {
    loading.value = false
  }
}

async function submitManualDeposit() {
  loading.value = true
  const formData = new FormData()
  formData.append('amount', manualForm.value.amount)
  formData.append('payment_method', selectedManualMethod.value)
  formData.append('sender_number', manualForm.value.sender_number)
  formData.append('transaction_id', manualForm.value.transaction_id)
  formData.append('screenshot', file.value)

  try {
    const { data } = await api.post('/wallet/deposit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (data.success) {
      statusMessage.value = data.message
      statusType.value = 'success'
      // Clear form
      manualForm.value = { amount: '', sender_number: '', transaction_id: '' }
      file.value = null
      filePreview.value = null
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Submission failed.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Clear query params after showing message
  if (route.query.status) {
    setTimeout(() => {
      router.replace({ query: {} })
    }, 5000)
  }
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
