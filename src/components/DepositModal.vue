<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-[9999]" :initial-focus="closeButtonRef">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="duration-500 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-300 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-950/30 backdrop-blur-md" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-500 cubic-bezier(0.22, 1, 0.36, 1)"
            enter-from="opacity-0 scale-[0.95] translate-y-4"
            enter-to="opacity-100 scale-100 translate-y-0"
            leave="duration-300 cubic-bezier(0.22, 1, 0.36, 1)"
            leave-from="opacity-100 scale-100 translate-y-0"
            leave-to="opacity-0 scale-[0.95] translate-y-4"
          >
            <DialogPanel 
              class="w-full max-w-[440px] transform rounded-[1.75rem] text-left align-middle transition-all bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.03),0_12px_24px_rgba(0,0,0,0.06),0_48px_80px_-16px_rgba(0,0,0,0.12)]"
            >
              <!-- Subtle top gradient accent -->
              <div class="absolute top-0 left-0 right-0 h-[2px] rounded-t-[1.75rem] bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 opacity-60"></div>

              <!-- Header -->
              <div class="flex items-center justify-between px-7 pt-7 pb-5">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]"
                    :style="{ background: themeStore.theme.primary_color }"
                  >
                    <Wallet :size="16" :style="{ color: themeStore.theme.text_primary || '#fff' }" />
                  </div>
                  <div>
                    <DialogTitle as="h3" class="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">
                      Wallet Recharge
                    </DialogTitle>
                    <p class="text-[10px] text-slate-400 font-medium mt-0.5">Add funds to your account</p>
                  </div>
                </div>
                <button 
                  ref="closeButtonRef"
                  @click="closeModal" 
                  class="p-2 rounded-xl text-slate-300 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 active:scale-95"
                >
                  <X :size="15" />
                </button>
              </div>

              <!-- Loading State -->
              <div v-if="loadingSettings" class="px-7 pb-10 pt-2">
                <div class="py-16 flex flex-col items-center justify-center gap-5">
                  <div class="relative">
                    <div class="w-10 h-10 border-[2.5px] border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                    <Zap :size="14" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
                  </div>
                  <p class="text-[11px] text-slate-400 font-semibold">Loading gateways...</p>
                </div>
              </div>

              <!-- Steps + Content -->
              <div v-else-if="hasAnyMethod" class="px-7 pb-7">
                <!-- Step Progress Bar -->
                <div class="mb-8">
                  <div class="flex items-center justify-between mb-3">
                    <template v-for="(step, i) in steps" :key="step.id">
                      <button
                        @click="goToStep(step.id)"
                        class="flex items-center gap-2 cursor-pointer group"
                      >
                        <div 
                          class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-400 shrink-0"
                          :style="currentStep >= step.id 
                            ? { background: themeStore.theme.primary_color, color: themeStore.theme.text_primary || '#fff', boxShadow: `0 3px 10px -2px ${themeStore.theme.primary_color}70` } 
                            : {}"
                          :class="currentStep < step.id ? 'bg-slate-50 text-slate-400' : ''"
                        >
                          <template v-if="currentStep > step.id">
                            <Check :size="13" stroke-width="3" />
                          </template>
                          <template v-else>
                            {{ step.id }}
                          </template>
                        </div>
                        <span 
                          class="text-[10px] font-semibold transition-colors duration-300 hidden sm:inline"
                          :class="currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'"
                        >
                          {{ step.label }}
                        </span>
                      </button>
                      <div 
                        v-if="i < steps.length - 1"
                        class="flex-1 h-[2px] mx-3 rounded-full transition-all duration-600 overflow-hidden"
                        :style="currentStep > step.id ? { background: themeStore.theme.primary_color + '40' } : {}"
                        :class="currentStep <= step.id ? 'bg-slate-100' : ''"
                      ></div>
                    </template>
                  </div>
                </div>

                <!-- ==================== STEP 1: Amount ==================== -->
                <Transition
                  enter-active-class="transition-all duration-400 ease-out"
                  enter-from-class="opacity-0 translate-x-4"
                  enter-to-class="opacity-100 translate-x-0"
                  leave-active-class="transition-all duration-200 ease-in"
                  leave-from-class="opacity-100 translate-x-0"
                  leave-to-class="opacity-0 -translate-x-4"
                  mode="out-in"
                >
                  <div v-if="currentStep === 1" key="step1" class="space-y-5">
                    <div>
                      <label class="text-[10px] text-slate-500 font-bold mb-2.5 block uppercase tracking-[0.12em]">Enter Amount</label>
                      <div class="relative group">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-violet-500/0 to-blue-500/0 rounded-2xl opacity-0 group-focus-within:opacity-100 group-focus-within:from-blue-500/20 group-focus-within:via-violet-500/20 group-focus-within:to-blue-500/20 transition-all duration-500 blur-sm"></div>
                        <div class="relative flex items-center bg-slate-50/80 border border-slate-200/80 rounded-2xl transition-all duration-300 group-focus-within:border-blue-300 group-focus-within:bg-white group-focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
                          <div class="pl-5 pr-1">
                            <span class="text-2xl font-extrabold text-slate-300 select-none">৳</span>
                          </div>
                          <input 
                            v-model="amount"
                            type="number" 
                            placeholder="0"
                            class="flex-1 bg-transparent border-none py-5 pr-5 text-[28px] font-extrabold text-slate-900 focus:ring-0 focus:outline-none placeholder:text-slate-200 leading-none tracking-tight"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Quick Amounts -->
                    <div class="grid grid-cols-4 gap-2.5">
                      <button 
                        v-for="val in [200, 500, 1000, 2000]" 
                        :key="val"
                        @click="amount = val"
                        class="relative py-3 rounded-xl text-[12px] font-bold transition-all duration-200 border overflow-hidden active:scale-[0.97]"
                        :style="amount === val 
                          ? { borderColor: themeStore.theme.primary_color, backgroundColor: themeStore.theme.primary_color + '15', color: themeStore.theme.primary_color } 
                          : { borderColor: '#e2e8f0', backgroundColor: '#fff', color: '#64748b' }"
                      >
                        <span>৳{{ val }}</span>
                      </button>
                    </div>

                    <!-- Balance Card -->
                    <div class="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-xl px-4 py-3">
                      <div class="flex items-center gap-2.5">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span class="text-[11px] text-emerald-700 font-semibold">Available Balance</span>
                      </div>
                      <span class="text-[13px] font-extrabold text-emerald-800">৳{{ walletBalance }}</span>
                    </div>
                  </div>

                  <!-- ==================== STEP 2: Payment Method ==================== -->
                  <div v-else-if="currentStep === 2" key="step2" class="space-y-3">
                    <label class="text-[10px] text-slate-500 font-bold mb-1 block uppercase tracking-[0.12em]">Select Method</label>

                    <!-- Online Gateways (Dynamic) -->
                    <button 
                      v-for="g in onlineGateways"
                      :key="g.id"
                      @click="selectedMethod = g.slug"
                      class="w-full relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border overflow-hidden group"
                      :style="selectedMethod === g.slug 
                        ? { borderColor: themeStore.theme.primary_color + '40', backgroundColor: themeStore.theme.primary_color + '08', boxShadow: `0 4px 16px -4px ${themeStore.theme.primary_color}20` } 
                        : { borderColor: '#e2e8f0', backgroundColor: '#fff' }"
                    >
                      <div 
                        class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                        :class="selectedMethod === g.slug ? 'shadow-[0_4px_12px_-2px_rgba(249,115,22,0.4)]' : 'shadow-sm'"
                        style="background: linear-gradient(135deg, #fb923c, #ea580c);"
                      >
                        <Zap :size="19" class="text-white" fill="white" />
                      </div>
                      <div class="text-left flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                          <span class="text-[13px] font-bold text-slate-900">{{ g.name }}</span>
                          <span class="text-[7px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-1.5 py-[2px] rounded-md leading-none tracking-wide">AUTO</span>
                        </div>
                        <p class="text-[11px] text-slate-400 font-medium">Instant checkout • bKash • Nagad</p>
                      </div>
                      <div 
                        class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300"
                        :style="selectedMethod === g.slug 
                          ? { borderColor: themeStore.theme.primary_color, backgroundColor: themeStore.theme.primary_color } 
                          : { borderColor: '#e2e8f0' }"
                      >
                        <Check v-if="selectedMethod === g.slug" :size="11" stroke-width="3.5" :style="{ color: themeStore.theme.text_primary || '#fff' }" />
                      </div>
                    </button>

                    <!-- Manual Gateways (Dynamic) -->
                    <template v-if="filteredManualMethods.length > 0">
                      <button 
                        v-for="m in filteredManualMethods" 
                        :key="m.id"
                        @click="selectedMethod = m.slug"
                        class="w-full relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border overflow-hidden group"
                        :class="selectedMethod === m.slug 
                          ? 'border-slate-300 bg-slate-50/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]' 
                          : 'border-slate-150 bg-white hover:border-slate-250 hover:bg-slate-50/50'"
                      >
                        <div 
                          class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold text-[14px] transition-transform duration-300 group-hover:scale-105"
                          :style="{ background: `linear-gradient(135deg, ${m.color || '#666'}, ${(m.color || '#666')}dd)`, boxShadow: selectedMethod === m.slug ? `0 4px 12px -2px ${(m.color || '#666')}50` : '0 1px 3px rgba(0,0,0,0.1)' }"
                        >
                          {{ m.name.charAt(0) }}
                        </div>
                        <div class="text-left flex-1 min-w-0">
                          <span class="text-[13px] font-bold text-slate-900 block mb-0.5">{{ m.name }}</span>
                          <p class="text-[11px] text-slate-400 font-medium">Manual send • Verification required</p>
                        </div>
                        <div 
                          class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300"
                          :class="selectedMethod === m.slug ? 'border-slate-800 bg-slate-800 scale-110' : 'border-slate-200'"
                        >
                          <div v-if="selectedMethod === m.slug" class="w-[6px] h-[6px] rounded-full bg-white"></div>
                        </div>
                      </button>
                    </template>
                  </div>

                  <!-- ==================== STEP 3: Confirm ==================== -->
                  <div v-else-if="currentStep === 3" key="step3" class="space-y-4">
                    <!-- Online: Summary -->
                    <div v-if="selectedMethod === 'online'" class="space-y-4">
                      <div class="relative rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 overflow-hidden">
                        <div class="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none"></div>
                        <div class="relative p-5 space-y-0">
                          <div class="flex justify-between items-center py-3">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.12em]">Amount</span>
                            <span class="text-[18px] font-extrabold text-slate-900 tracking-tight">৳{{ amount }}</span>
                          </div>
                          <div class="h-px bg-slate-100"></div>
                          <div class="flex justify-between items-center py-3">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.12em]">Method</span>
                            <div class="flex items-center gap-2">
                              <div class="w-6 h-6 rounded-md flex items-center justify-center" style="background: linear-gradient(135deg, #fb923c, #ea580c);">
                                <Zap :size="12" class="text-white" fill="white" />
                              </div>
                              <span class="text-[13px] font-bold text-slate-800">{{ activeMethodLabel }}</span>
                            </div>
                          </div>
                          <div class="h-px bg-slate-100"></div>
                          <div class="flex justify-between items-center py-3">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.12em]">Processing</span>
                            <div class="flex items-center gap-1.5">
                              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                              <span class="text-[12px] text-emerald-600 font-bold">Instant</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-start gap-2.5 px-1">
                        <div class="mt-0.5 w-4 h-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                          <Zap :size="9" class="text-amber-500" />
                        </div>
                        <p class="text-[11px] text-slate-400 leading-relaxed font-medium">
                          You'll be redirected to the payment gateway. Please don't close the browser during the process.
                        </p>
                      </div>
                    </div>

                    <!-- Manual: Full Form -->
                    <div v-else-if="isManualSelected" class="space-y-4">
                      <!-- Number Display Card -->
                      <div class="relative rounded-2xl border overflow-hidden" :style="{ borderColor: activeMethodColor + '25' }">
                        <div class="absolute inset-0 opacity-[0.03]" :style="{ background: `linear-gradient(135deg, ${activeMethodColor}, transparent)` }"></div>
                        <div class="relative p-5">
                          <div class="flex items-center justify-between mb-3">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.12em]">Send money to</span>
                            <button 
                              @click="copyNumber(activeManualNumber)"
                              class="text-[10px] font-bold px-2.5 py-1 rounded-lg text-slate-500 hover:text-white transition-all duration-300 flex items-center gap-1.5 active:scale-95"
                              :style="{ 
                                background: activeMethodColor + '12',
                                hoverBackground: activeMethodColor 
                              }"
                              @mouseenter="e => { e.currentTarget.style.background = activeMethodColor; e.currentTarget.style.color = '#fff' }"
                              @mouseleave="e => { e.currentTarget.style.background = activeMethodColor + '12'; e.currentTarget.style.color = '' }"
                            >
                              <Copy :size="10" />
                              Copy
                            </button>
                          </div>
                          <div class="flex items-center gap-3 mb-3">
                            <div 
                              class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-[12px] shrink-0 shadow-md"
                              :style="{ background: `linear-gradient(135deg, ${activeMethodColor}, ${activeMethodColor}cc)` }"
                            >
                              {{ activeMethodLabel.charAt(0) }}
                            </div>
                            <span class="text-[17px] font-extrabold text-slate-900 tracking-[0.06em] font-mono">{{ activeManualNumber }}</span>
                          </div>
                          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.12em]">Amount</span>
                            <span class="text-[15px] font-extrabold text-slate-900">৳{{ amount }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Inputs -->
                      <div class="grid grid-cols-1 gap-3">
                        <div>
                          <label class="text-[10px] text-slate-500 font-bold mb-2 block uppercase tracking-[0.12em]">Your {{ activeMethodLabel }} Number</label>
                          <input 
                            v-model="manualForm.sender_number" 
                            type="text" 
                            placeholder="01XXXXXXXXX" 
                            class="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-3.5 px-4 text-[13px] text-slate-900 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.06)] transition-all outline-none placeholder:text-slate-300 font-semibold"
                          />
                        </div>
                        <div>
                          <label class="text-[10px] text-slate-500 font-bold mb-2 block uppercase tracking-[0.12em]">
                            Transaction ID 
                            <span class="text-slate-300 font-medium normal-case tracking-normal">(optional)</span>
                          </label>
                          <input 
                            v-model="manualForm.transaction_id" 
                            type="text" 
                            placeholder="X8N9K2M1..." 
                            class="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-3.5 px-4 text-[13px] text-slate-900 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.06)] transition-all outline-none placeholder:text-slate-300 font-semibold"
                          />
                        </div>
                      </div>

                      <!-- Screenshot Upload -->
                      <div>
                        <label class="text-[10px] text-slate-500 font-bold mb-2 block uppercase tracking-[0.12em]">Payment Screenshot</label>
                        <div 
                          @click="$refs.fileInput.click()" 
                          class="relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center transition-all duration-300 hover:border-slate-300 hover:bg-slate-50/50 bg-white group"
                        >
                          <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*" />
                          
                          <div v-if="!filePreview" class="text-center">
                            <div class="inline-flex p-4 rounded-2xl bg-slate-50 text-slate-300 mb-3 group-hover:text-slate-400 group-hover:bg-slate-100 transition-all duration-300">
                              <ImagePlus :size="24" />
                            </div>
                            <p class="text-[11px] text-slate-400 font-bold">Click to upload screenshot</p>
                            <p class="text-[10px] text-slate-300 font-medium mt-1">JPG, PNG up to 5MB</p>
                          </div>
                          
                          <div v-else class="relative w-full">
                            <img :src="filePreview" class="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm" />
                            <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl">
                              <div class="flex items-center gap-2 bg-white/95 px-4 py-2 rounded-lg shadow-lg">
                                <ImagePlus :size="13" class="text-slate-600" />
                                <span class="text-[11px] text-slate-700 font-bold">Change Image</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>

                <!-- ==================== Action Buttons ==================== -->
                <div class="mt-7 space-y-2">
                  <button 
                    @click="handleAction"
                    :disabled="isButtonDisabled || loading"
                    class="relative w-full py-4 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2.5 transition-all duration-300 overflow-hidden active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed disabled:active:scale-100 text-white"
                    :style="{ 
                      backgroundColor: themeStore.theme.primary_color,
                      color: themeStore.theme.text_primary || '#fff',
                      boxShadow: `0 8px 24px -4px ${themeStore.theme.primary_color}60`
                    }"
                  >
                    <!-- Subtle shimmer -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div v-if="loading" class="flex items-center gap-2.5">
                      <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                    <template v-else>
                      <span>{{ actionLabel }}</span>
                      <ArrowRight v-if="currentStep < 3" :size="14" class="opacity-40" />
                      <Zap v-if="currentStep === 3 && selectedMethod === 'online'" :size="14" class="opacity-70" />
                    </template>
                  </button>

                  <button 
                    v-if="currentStep > 1"
                    @click="currentStep--"
                    class="w-full py-2.5 rounded-xl text-[11px] text-slate-400 hover:text-slate-600 font-semibold transition-colors duration-200"
                  >
                    ← Go back
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="px-7 py-16 text-center">
                <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
                  <X :size="22" class="text-slate-300" />
                </div>
                <h5 class="text-[14px] font-bold text-slate-800 mb-1.5">Deposits Disabled</h5>
                <p class="text-[11px] text-slate-400 leading-relaxed font-medium max-w-[240px] mx-auto">Payment gateways are temporarily unavailable by the administrator.</p>
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
import { useThemeStore } from '@/stores/theme'
import { 
  TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle 
} from '@headlessui/vue'
import { 
  X, Wallet, Zap, Copy, ImagePlus, Send, Check, ArrowRight, Smartphone 
} from 'lucide-vue-next'
import api from '@/services/api'
import Swal from 'sweetalert2'
import { useDepositModal } from '@/composables/useDepositModal'
import { useWalletStore } from '@/stores/wallet'
import { useAuthStore } from '@/stores/auth'

const { isOpen, close: closeModal } = useDepositModal()
const closeButtonRef = ref(null)
const themeStore = useThemeStore()
const walletStore = useWalletStore()
const authStore = useAuthStore()

const emit = defineEmits(['success'])

const loading = ref(false)
const loadingSettings = ref(true)
const amount = ref(200)
const selectedMethod = ref('online')
const currentStep = ref(1)

const settings = ref({
  online_deposit_active: true,
  manual_deposit_active: true,
  manual_bkash_number: '',
  manual_nagad_number: '',
  manual_rocket_number: ''
})

const manualForm = ref({
  sender_number: '',
  transaction_id: ''
})
const allGateways = ref([])
const file = ref(null)
const filePreview = ref(null)

const steps = [
  { id: 1, label: 'Amount' },
  { id: 2, label: 'Method' },
  { id: 3, label: 'Confirm' }
]

const filteredManualMethods = computed(() => {
  return allGateways.value.filter(g => g.type === 'manual' && g.is_active)
})

const onlineGateways = computed(() => {
  return allGateways.value.filter(g => g.type === 'online' && g.is_active)
})

const hasAnyMethod = computed(() => {
  return onlineGateways.value.length > 0 || filteredManualMethods.value.length > 0
})

const walletBalance = computed(() => {
  const w = walletStore.wallet
  if (!w) return '0.00'
  return (parseFloat(w.main_balance || 0) + parseFloat(w.winning_balance || 0)).toFixed(2)
})

const isManualSelected = computed(() => {
  const method = allGateways.value.find(g => g.slug === selectedMethod.value)
  return method?.type === 'manual'
})

const activeManualNumber = computed(() => {
  const method = allGateways.value.find(g => g.slug === selectedMethod.value)
  return method?.config?.number || ''
})

const activeMethodColor = computed(() => {
  return allGateways.value.find(g => g.slug === selectedMethod.value)?.color || '#666'
})

const activeMethodLabel = computed(() => {
  return allGateways.value.find(g => g.slug === selectedMethod.value)?.name || ''
})

const isButtonDisabled = computed(() => {
  if (currentStep.value === 1) return !amount.value || amount.value < 10
  if (currentStep.value === 2) return !selectedMethod.value || selectedMethod.value === 'none'
  if (currentStep.value === 3 && isManualSelected.value) return !manualForm.value.sender_number || !file.value
  return false
})

const actionLabel = computed(() => {
  if (currentStep.value === 1) return 'Continue'
  if (currentStep.value === 2) return 'Continue'
  if (currentStep.value === 3) return selectedMethod.value === 'online' ? 'Confirm & Pay' : 'Submit Proof'
  return 'Continue'
})

const goToStep = (stepId) => {
  if (stepId < currentStep.value) currentStep.value = stepId
}

const handleAction = () => {
  if (currentStep.value === 1) {
    if (!amount.value || amount.value < 10) return
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (!selectedMethod.value) return
    currentStep.value = 3
  } else if (currentStep.value === 3) {
    handleDeposit()
  }
}

const fetchSettings = async () => {
  loadingSettings.value = true
  currentStep.value = 1
  try {
    const { data } = await api.get('/settings/deposit')
    if (data.status) {
      settings.value = data.data
    }

    const { data: gData } = await api.get('/settings/gateways')
    if (gData.status) {
      allGateways.value = gData.data
      
      // Auto-select first available method
      if (onlineGateways.value.length > 0) {
        selectedMethod.value = onlineGateways.value[0].slug
      } else if (filteredManualMethods.value.length > 0) {
        selectedMethod.value = filteredManualMethods.value[0].slug
      } else {
        selectedMethod.value = 'none'
      }
    }
  } catch (err) {
    console.error('Failed to load deposit settings', err)
  } finally {
    loadingSettings.value = false
  }
}

const handleFileChange = (e) => {
  const f = e.target.files[0]
  if (f) {
    file.value = f
    filePreview.value = URL.createObjectURL(f)
  }
}

const copyNumber = (num) => {
  navigator.clipboard.writeText(num)
  Swal.fire({
    text: 'Copied!',
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    background: '#ffffff',
    color: '#0f172a',
    width: '180px',
    didOpen: (toast) => {
      toast.style.borderRadius = '14px'
      toast.style.border = '1px solid rgba(0,0,0,0.04)'
      toast.style.boxShadow = '0 8px 30px -8px rgba(0,0,0,0.12)'
    }
  })
}

const handleDeposit = async () => {
  const method = allGateways.value.find(g => g.slug === selectedMethod.value)
  if (method?.type === 'online') {
    await initiateOnlinePayment()
  } else {
    await submitManualDeposit()
  }
}

const initiateOnlinePayment = async () => {
  loading.value = true
  try {
    const method = allGateways.value.find(g => g.slug === selectedMethod.value)
    const { data } = await api.post('/wallet/online-deposit', { 
      amount: amount.value,
      gateway: method.slug
    })
    if (data.success && data.payment_url) {
      window.location.href = data.payment_url
    } else {
      throw new Error(data.message || 'Payment initiation failed')
    }
  } catch (err) {
    Swal.fire({
      title: 'Payment Error',
      text: err.response?.data?.message || err.message,
      icon: 'error',
      background: '#ffffff',
      color: '#0f172a',
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'OK'
    })
  } finally {
    loading.value = false
  }
}

const submitManualDeposit = async () => {
  loading.value = true
  const formData = new FormData()
  formData.append('amount', amount.value)
  formData.append('payment_method', selectedMethod.value)
  formData.append('sender_number', manualForm.value.sender_number)
  formData.append('transaction_id', manualForm.value.transaction_id || '')
  formData.append('screenshot', file.value)

  try {
    const { data } = await api.post('/wallet/deposit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (data.success) {
      Swal.fire({
        title: 'Submitted!',
        text: 'Your deposit is under review. Funds will be added after verification.',
        icon: 'success',
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Done'
      })
      emit('success')
      closeModal()
    }
  } catch (err) {
    Swal.fire({
      title: 'Submission Failed',
      text: err.response?.data?.message || 'Please try again.',
      icon: 'error',
      background: '#ffffff',
      color: '#0f172a',
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Retry'
    })
  } finally {
    loading.value = false
  }
}

watch(isOpen, (newVal) => {
  if (newVal) {
    fetchSettings()
    if (authStore.isAuthenticated) walletStore.fetchWallet()
  } else {
    manualForm.value = { sender_number: '', transaction_id: '' }
    file.value = null
    filePreview.value = null
    currentStep.value = 1
  }
})
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>