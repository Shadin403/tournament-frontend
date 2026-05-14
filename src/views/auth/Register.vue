<template>
  <div class="register-container px-4 py-8 max-w-lg mx-auto">
    
    <!-- Header Section -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" 
           style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
        <UserPlus :size="32" color="var(--color-primary)" />
      </div>
      <h1 class="text-3xl font-black gradient-text-orange mb-2" style="font-family: var(--font-display);">Create Account</h1>
      <p class="text-sm" style="color: var(--color-text-secondary);">ব্যাটলজোনে জয়েন করে আপনার গেমিং ক্যারিয়ার শুরু করুন</p>
    </div>

    <!-- Main Card -->
    <div class="glass-card p-6 md:p-8 shadow-xl">
      <form @submit.prevent="handleRegister" class="space-y-4">
        
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-bold mb-1.5 ml-1" style="color: var(--color-text-secondary);">নাম</label>
          <div class="relative">
            <User :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted" style="color: var(--color-text-muted);" />
            <input v-model="form.name" type="text" placeholder="আপনার পুরো নাম লিখুন" 
                   class="input-dark pl-12" required :disabled="loading" />
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-bold mb-1.5 ml-1" style="color: var(--color-text-secondary);">ফোন নম্বর</label>
          <div class="relative">
            <Phone :size="18" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: var(--color-text-muted);" />
            <input v-model="form.phone" type="tel" placeholder="01XXXXXXXXX" 
                   class="input-dark pl-12" required :disabled="loading" />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-bold mb-1.5 ml-1" style="color: var(--color-text-secondary);">ইমেইল</label>
          <div class="relative">
            <Mail :size="18" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: var(--color-text-muted);" />
            <input v-model="form.email" type="email" placeholder="example@gmail.com" 
                   class="input-dark pl-12" required :disabled="loading" />
          </div>
        </div>

        <!-- Free Fire UID -->
        <div>
          <label class="block text-sm font-bold mb-1.5 ml-1" style="color: var(--color-text-secondary);">Free Fire UID</label>
          <div class="relative">
            <Gamepad2 :size="18" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: var(--color-text-muted);" />
            <input v-model="form.ff_uid" type="text" placeholder="আপনার গেম আইডি (UID)" 
                   class="input-dark pl-12" required :disabled="loading" />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-bold mb-1.5 ml-1" style="color: var(--color-text-secondary);">পাসওয়ার্ড</label>
          <div class="relative">
            <Lock :size="18" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: var(--color-text-muted);" />
            <input v-model="form.password" :type="showPw ? 'text' : 'password'" 
                   placeholder="শক্তিশালী পাসওয়ার্ড দিন" 
                   class="input-dark pl-12 pr-12" required :disabled="loading" />
            <button type="button" @click="showPw = !showPw" class="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
              <component :is="showPw ? EyeOff : Eye" :size="18" />
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="flex items-center gap-2 p-3 rounded-xl text-sm" 
             style="background: rgba(231,76,60,0.1); border: 1px solid rgba(231,76,60,0.2); color: var(--color-neon-red);">
          <AlertCircle :size="16" />
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-neon w-full h-14 text-lg" :disabled="loading">
          <Loader2 v-if="loading" class="animate-spin" :size="20" />
          <span v-else>অ্যাকাউন্ট তৈরি করুন 🚀</span>
        </button>

      </form>

      <!-- Divider -->
      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-dashed" style="border-color: var(--color-border-subtle);"></div></div>
        <div class="relative flex justify-center text-xs uppercase"><span class="px-3" style="background: var(--color-bg-card); color: var(--color-text-muted);">অথবা সোশ্যাল মিডিয়া</span></div>
      </div>

      <!-- Social Register -->
      <div class="grid grid-cols-2 gap-4">
        <button @click="socialAuth('google')" class="social-btn-premium">
          <Chrome :size="20" /> Google
        </button>
        <button @click="socialAuth('discord')" class="social-btn-premium discord">
          <Gamepad2 :size="20" /> Discord
        </button>
      </div>

      <!-- Login Link -->
      <p class="text-center mt-8 text-sm" style="color: var(--color-text-secondary);">
        ইতিমধ্যে অ্যাকাউন্ট আছে? 
        <router-link to="/login" class="font-bold underline" style="color: var(--color-primary);">লগইন করুন</router-link>
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  User, Mail, Phone, Lock, Gamepad2, UserPlus, 
  Eye, EyeOff, AlertCircle, Loader2, Chrome 
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
  ff_uid: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showPw = ref(false)

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    await authStore.register(form.value)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
  } finally {
    loading.value = false
  }
}

async function socialAuth(provider) {
  // logic to redirect to provider
}
</script>

<style scoped>
.register-container {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.social-btn-premium {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  background: white;
  border: 1px solid var(--color-border-subtle);
  transition: all 0.2s;
  color: var(--color-text-primary);
}

.social-btn-premium:hover {
  background: var(--color-bg-card);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.social-btn-premium.discord {
  color: #5865f2;
  border-color: rgba(88,101,242,0.2);
}

.social-btn-premium.discord:hover {
  background: rgba(88,101,242,0.05);
  border-color: #5865f2;
}
</style>
