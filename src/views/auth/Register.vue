<template>
  <!-- Main Background -->
  <section class="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans">
    <div class="w-full max-w-[450px]">
      
      <!-- Logo Section -->
      <div class="flex items-center justify-center mb-8">
        <div class="w-10 h-10 mr-3 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
          <Gamepad2 :size="24" stroke-width="2.5" />
        </div>
        <h1 class="text-3xl font-bold text-white tracking-wide">Battle<span class="text-orange-500">Zone</span></h1>
      </div>

      <!-- Form Card -->
      <div class="bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8">
        <h2 class="text-xl font-bold text-white mb-6 text-center">
          Create an account
        </h2>
        
        <form class="space-y-5" @submit.prevent="handleRegister">
          
          <!-- Full Name -->
          <div>
            <label class="block mb-2 text-sm font-medium text-slate-300">Full Name</label>
            <input v-model="form.name" type="text" placeholder="John Doe" required :disabled="loading"
                   class="w-full bg-[#0f172a] border border-slate-600 text-white text-sm rounded-xl px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-500">
          </div>

          <!-- Phone & FF UID Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-300">Phone</label>
              <input v-model="form.phone" type="tel" placeholder="01XXXXXXXXX" required :disabled="loading"
                     class="w-full bg-[#0f172a] border border-slate-600 text-white text-sm rounded-xl px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-500">
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-300">FF UID</label>
              <input v-model="form.ff_uid" type="text" placeholder="123456789" required :disabled="loading"
                     class="w-full bg-[#0f172a] border border-slate-600 text-white text-sm rounded-xl px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-500">
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block mb-2 text-sm font-medium text-slate-300">Email address</label>
            <input v-model="form.email" type="email" placeholder="name@company.com" required :disabled="loading"
                   class="w-full bg-[#0f172a] border border-slate-600 text-white text-sm rounded-xl px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-500">
          </div>

          <!-- Password -->
          <div>
            <label class="block mb-2 text-sm font-medium text-slate-300">Password</label>
            <div class="relative">
              <input v-model="form.password" :type="showPw ? 'text' : 'password'" placeholder="••••••••" required :disabled="loading"
                     class="w-full bg-[#0f172a] border border-slate-600 text-white text-sm rounded-xl pl-4 pr-12 py-3 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-500">
              <button type="button" @click="showPw = !showPw" class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-orange-500 transition-colors">
                <component :is="showPw ? EyeOff : Eye" :size="18" />
              </button>
            </div>
          </div>

          <!-- Terms -->
          <div class="flex items-start pt-2">
            <div class="flex items-center h-5 mt-0.5">
              <input v-model="acceptTerms" type="checkbox" required
                     class="w-4 h-4 rounded border-slate-600 bg-[#0f172a] text-orange-600 focus:ring-orange-500 focus:ring-offset-slate-800">
            </div>
            <div class="ml-3 text-sm">
              <label class="font-light text-slate-300">I accept the <a href="#" class="font-medium text-orange-500 hover:underline">Terms and Conditions</a></label>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 text-sm text-red-400 bg-red-900/30 border border-red-900/50 rounded-xl flex items-center gap-2">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="loading" 
                  class="w-full flex justify-center items-center gap-2 text-white bg-orange-600 hover:bg-orange-500 font-bold rounded-xl text-sm px-5 py-3.5 text-center transition-all shadow-lg shadow-orange-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2">
            <Loader2 v-if="loading" class="animate-spin" :size="18" />
            <span>{{ loading ? 'Creating account...' : 'Create an account' }}</span>
          </button>

          <!-- Footer Link -->
          <p class="text-sm font-light text-slate-400 text-center pt-4 border-t border-slate-700/50 mt-6">
            Already have an account? 
            <router-link to="/login" class="font-medium text-orange-500 hover:underline">
              Login here
            </router-link>
          </p>
        </form>
        
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Loader2, Gamepad2, AlertCircle } from 'lucide-vue-next'

const router = useRouter()

const form = ref({
  name: '',
  phone: '',
  email: '',
  ff_uid: '',
  password: ''
})

const acceptTerms = ref(false)
const loading = ref(false)
const error = ref('')
const showPw = ref(false)

async function handleRegister() {
  if (!acceptTerms.value) {
    error.value = "You must accept the terms and conditions."
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    // Mock API Call
    setTimeout(() => { 
      loading.value = false; 
      router.push('/') 
    }, 2000) 
  } catch (err) {
    error.value = 'Registration failed. Please try again.'
    loading.value = false
  }
}
</script>