<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="close" class="relative z-[100]">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-md" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95 translate-y-12"
            enter-to="opacity-100 scale-100 translate-y-0"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100 translate-y-0"
            leave-to="opacity-0 scale-95 translate-y-12"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-[2.5rem] p-8 text-left align-middle shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all border border-white/10"
                         style="background: linear-gradient(180deg, #1A1A1E 0%, #111114 100%);">
              
              <!-- Header -->
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                  <div class="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                    <Wallet :size="20" class="text-orange-500" />
                  </div>
                  <div>
                    <DialogTitle as="h3" class="text-lg font-black text-white uppercase tracking-tighter" style="font-family: var(--font-display);">
                      Top Up Wallet
                    </DialogTitle>
                    <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Instant & Secure</p>
                  </div>
                </div>
                <button @click="close" class="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <X :size="18" class="text-gray-400" />
                </button>
              </div>

              <!-- Loading State -->
              <div v-if="loadingSettings" class="flex flex-col items-center justify-center py-16 gap-4">
                <div class="relative">
                   <div class="absolute inset-0 blur-xl bg-orange-500/30 animate-pulse"></div>
                   <Loader2 :size="32" class="animate-spin text-orange-500 relative z-10" />
                </div>
                <p class="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Synchronizing...</p>
              </div>

              <div v-else>
                <!-- Method Selector -->
                <div class="grid grid-cols-2 gap-4 mb-8" v-if="showManual && showOnline">
                  <button 
                    v-for="type in availableTypes" :key="type.id"
                    @click="selectedType = type.id"
                    class="relative group flex flex-col items-center justify-center gap-3 p-5 rounded-3xl transition-all duration-300 border overflow-hidden"
                    :class="selectedType === type.id ? 'border-white/20' : 'border-white/5 hover:border-white/10'"
                    :style="selectedType === type.id ? `background: ${type.activeBg}` : 'background: rgba(255,255,255,0.02)'"
                  >
                    <!-- Active Glow -->
                    <div v-if="selectedType === type.id" 
                         class="absolute inset-0 opacity-20 blur-2xl" 
                         :style="`background: ${type.color}`"></div>
                    
                    <component :is="type.icon" :size="24" class="relative z-10 transition-transform group-hover:scale-110" :style="`color: ${type.color}`" />
                    <span class="relative z-10 text-[10px] font-black uppercase tracking-widest" :class="selectedType === type.id ? 'text-white' : 'text-gray-500'">{{ type.name }}</span>
                    
                    <!-- Selection Indicator -->
                    <div v-if="selectedType === type.id" class="absolute top-2 right-2">
                       <div class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]"></div>
                    </div>
                  </button>
                </div>

                <!-- ── ONLINE FORM ────────────────────────────────────────── -->
                <div v-if="selectedType === 'online' && showOnline" class="space-y-6">
                  <div class="relative p-6 rounded-[2rem] bg-black/40 border border-white/5 group focus-within:border-orange-500/50 transition-all">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Amount to deposit</label>
                    <div class="flex items-center gap-4">
                      <span class="text-3xl font-black text-white/20">৳</span>
                      <input v-model="onlineAmount" type="number" placeholder="0" 
                             class="w-full bg-transparent border-none p-0 text-4xl font-black text-white focus:ring-0 placeholder:text-white/5" 
                             style="font-family: var(--font-display);" />
                    </div>
                    <!-- Quick Select -->
                    <div class="flex gap-2 mt-6">
                       <button v-for="amt in [100, 500, 1000]" :key="amt" 
                               @click="onlineAmount = amt"
                               class="px-4 py-1.5 rounded-full text-[10px] font-black bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all">
                         +৳{{ amt }}
                       </button>
                    </div>
                  </div>

                  <button @click="initiateOnlinePayment" :disabled="loading || onlineAmount < 10"
                          class="relative w-full py-5 rounded-[1.5rem] font-black text-white uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] group overflow-hidden"
                          style="background: linear-gradient(135deg, #FF4500 0%, #FF2E00 100%); box-shadow: 0 10px 30px rgba(255,69,0,0.3);">
                    <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Loader2 v-if="loading" :size="18" class="animate-spin" />
                    <Zap v-else :size="18" />
                    {{ loading ? 'Processing...' : 'Pay Instantly' }}
                  </button>
                </div>

                <!-- ── MANUAL FORM ────────────────────────────────────────── -->
                <div v-if="selectedType === 'manual' && showManual" class="space-y-6">
                   <!-- Manual Method Tabs -->
                   <div class="flex p-1 rounded-2xl bg-black/40 border border-white/5">
                    <button v-for="m in manualMethods" :key="m.id"
                            @click="selectedManualMethod = m.id"
                            class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all"
                            :style="selectedManualMethod === m.id 
                              ? `background: ${m.color}; color: white; shadow: 0 4px 12px ${m.color}44` 
                              : 'color: #666;'">
                      {{ m.name }}
                    </button>
                  </div>

                  <div class="p-6 rounded-[2rem] border border-white/5 bg-black/40">
                    <div class="flex items-center justify-between mb-6">
                      <div>
                        <p class="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Send Money To</p>
                        <p class="text-2xl font-black text-white tracking-widest" style="font-family: var(--font-display);">{{ getManualNumber() }}</p>
                      </div>
                      <button @click="copyText(getManualNumber())" class="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-90">
                        <Copy :size="16" class="text-orange-500" />
                      </button>
                    </div>
                    
                    <div class="space-y-4">
                      <div class="grid grid-cols-2 gap-3">
                         <input v-model="manualForm.amount" type="number" placeholder="Amount" 
                                class="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:border-orange-500/50 outline-none transition-all" />
                         <input v-model="manualForm.sender_number" type="text" placeholder="Your Number" 
                                class="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:border-orange-500/50 outline-none transition-all" />
                      </div>
                      <input v-model="manualForm.transaction_id" type="text" placeholder="Transaction ID (Optional)" 
                             class="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:border-orange-500/50 outline-none transition-all" />
                      
                      <div @click="$refs.fileInput.click()" 
                           class="relative cursor-pointer border-2 border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-white/5 hover:border-orange-500/30 transition-all group">
                        <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*" />
                        <img v-if="filePreview" :src="filePreview" class="max-h-32 rounded-xl shadow-2xl" />
                        <template v-else>
                          <div class="p-3 rounded-full bg-white/5 text-gray-500 group-hover:text-orange-500 transition-colors">
                            <ImagePlus :size="24" />
                          </div>
                          <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Attach Screenshot</span>
                        </template>
                      </div>
                    </div>
                  </div>

                  <button @click="submitManualDeposit" :disabled="loading || !manualForm.amount || !manualForm.sender_number || !file"
                          class="w-full py-5 rounded-[1.5rem] font-black text-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                          style="background: #00FF88; box-shadow: 0 10px 30px rgba(0,255,136,0.2);">
                    <Loader2 v-if="loading" :size="18" class="animate-spin" />
                    <Send v-else :size="18" />
                    Submit Request
                  </button>
                </div>

                <!-- Footer Navigation -->
                <div class="mt-10 grid grid-cols-2 gap-4">
                  <router-link to="/wallet" @click="close" class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <History :size="16" class="text-gray-500 group-hover:text-white transition-colors" />
                    <span class="text-[10px] font-black uppercase text-gray-500 group-hover:text-white tracking-widest">History</span>
                  </router-link>
                  <router-link to="/wallet/withdraw" @click="close" class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <ArrowUpCircle :size="16" class="text-gray-500 group-hover:text-white transition-colors" />
                    <span class="text-[10px] font-black uppercase text-gray-500 group-hover:text-white tracking-widest">Withdraw</span>
                  </router-link>
                </div>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  TransitionRoot, TransitionChild,
  Dialog, DialogPanel, DialogTitle,
} from '@headlessui/vue'
import { 
  X, Zap, Wallet, Loader2, Copy, 
  ImagePlus, Send, AlertCircle, ArrowUpCircle, History
} from 'lucide-vue-next'
import { useDepositModal } from '@/composables/useDepositModal'
import api from '@/services/api'

const { isOpen, close } = useDepositModal()

const loading = ref(false)
const loadingSettings = ref(false)
const settings = ref({})
const selectedType = ref('online')
const selectedManualMethod = ref('bkash')

const showOnline = computed(() => settings.value.online_deposit_active === '1')
const showManual = computed(() => settings.value.manual_deposit_active === '1')

const availableTypes = computed(() => {
  const types = []
  if (showOnline.value) types.push({ id: 'online', name: 'Instant Pay', icon: Zap, color: '#FF4500', activeBg: 'rgba(255,69,0,0.1)' })
  if (showManual.value) types.push({ id: 'manual', name: 'Manual Add', icon: Wallet, color: '#00FF88', activeBg: 'rgba(0,255,136,0.1)' })
  return types
})

const onlineAmount = ref(100)
const manualForm = ref({ amount: '', sender_number: '', transaction_id: '' })
const file = ref(null)
const filePreview = ref(null)

const manualMethods = [
  { id: 'bkash', name: 'bKash', color: '#D12053' },
  { id: 'nagad', name: 'Nagad', color: '#F7941D' },
  { id: 'rocket', name: 'Rocket', color: '#8C3494' }
]

async function fetchSettings() {
  loadingSettings.value = true
  try {
    const { data } = await api.get('/settings/deposit')
    if (data.status) {
      settings.value = data.data
      if (showOnline.value) selectedType.value = 'online'
      else if (showManual.value) selectedType.value = 'manual'
    }
  } catch (err) {
    console.error(err)
  } finally {
    loadingSettings.value = false
  }
}

watch(isOpen, (val) => {
  if (val) fetchSettings()
})

function getManualNumber() {
  return settings.value[`manual_${selectedManualMethod.value}_number`] || 'Not Available'
}

function handleFileChange(e) {
  const f = e.target.files[0]
  if (f) {
    file.value = f
    filePreview.value = URL.createObjectURL(f)
  }
}

function copyText(txt) {
  navigator.clipboard.writeText(txt)
  // Toast or notification could go here
}

async function initiateOnlinePayment() {
  loading.value = true
  try {
    const { data } = await api.post('/wallet/online-deposit', { amount: onlineAmount.value })
    if (data.success && data.payment_url) window.location.href = data.payment_url
  } catch (err) {
    alert(err.response?.data?.message || 'Error')
  } finally { loading.value = false }
}

async function submitManualDeposit() {
  loading.value = true
  const formData = new FormData()
  Object.keys(manualForm.value).forEach(k => formData.append(k, manualForm.value[k]))
  formData.append('payment_method', selectedManualMethod.value)
  formData.append('screenshot', file.value)

  try {
    const { data } = await api.post('/wallet/deposit', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (data.success) {
      alert(data.message)
      close()
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Error')
  } finally { loading.value = false }
}
</script>

<style scoped>
/* Hide spin buttons for number inputs */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
