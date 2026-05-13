<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
       style="background-color: var(--color-bg-darkest);">

    <div class="absolute inset-0" style="background: radial-gradient(ellipse at 50% 30%, rgba(155,48,255,0.08) 0%, transparent 50%);" />

    <div class="w-full max-w-lg relative z-10">
      <div class="text-center mb-8">
        <router-link to="/">
          <h1 class="text-4xl font-black gradient-text-orange" style="font-family: var(--font-display); letter-spacing: 0.1em;">⚡ BATTLEZONE</h1>
        </router-link>
        <p class="mt-2" style="color: var(--color-text-secondary);">নতুন একাউন্ট তৈরি করুন — সম্পূর্ণ বিনামূল্যে</p>
      </div>

      <div class="glass-card neon-border-purple p-8">
        <h2 class="text-2xl font-bold mb-6" style="font-family: var(--font-display);">Register</h2>

        <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">পুরো নাম *</label>
              <input v-model="form.name" type="text" placeholder="আপনার নাম" class="input-dark" required :disabled="loading" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">Username *</label>
              <input v-model="form.username" type="text" placeholder="player123" class="input-dark" required :disabled="loading" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">Email *</label>
            <input v-model="form.email" type="email" placeholder="your@email.com" class="input-dark" required :disabled="loading" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">Phone নম্বর *</label>
            <input v-model="form.phone" type="tel" placeholder="01XXXXXXXXX" class="input-dark" required :disabled="loading" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">
              Free Fire UID
              <span style="color: var(--color-text-muted); font-weight: 400;">(optional)</span>
            </label>
            <input v-model="form.ff_uid" type="text" placeholder="আপনার FF UID" class="input-dark" :disabled="loading" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">পাসওয়ার্ড *</label>
              <input v-model="form.password" type="password" placeholder="কমপক্ষে ৮ অক্ষর" class="input-dark" required :disabled="loading" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">কনফার্ম করুন *</label>
              <input v-model="form.password_confirmation" type="password" placeholder="পাসওয়ার্ড আবার দিন" class="input-dark" required :disabled="loading" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">
              Referral Code
              <span style="color: var(--color-text-muted); font-weight: 400;">(optional)</span>
            </label>
            <input v-model="form.referral_code" type="text" placeholder="বন্ধুর রেফারেল কোড" class="input-dark" :disabled="loading" />
          </div>

          <!-- Errors -->
          <div v-if="errors.length" class="p-3 rounded-lg" style="background: rgba(255,34,68,0.15); border: 1px solid rgba(255,34,68,0.3);">
            <div v-for="err in errors" :key="err" class="text-sm" style="color: var(--color-neon-red);">⚠️ {{ err }}</div>
          </div>

          <!-- Success -->
          <div v-if="success" class="p-3 rounded-lg text-sm" style="background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); color: var(--color-neon-green);">
            ✅ {{ success }}
          </div>

          <button type="submit" class="btn-neon w-full mt-2" :disabled="loading">
            <span v-if="loading">⏳ রেজিস্ট্রেশন হচ্ছে...</span>
            <span v-else>🚀 একাউন্ট তৈরি করুন</span>
          </button>
        </form>

        <p class="text-center mt-6 text-sm" style="color: var(--color-text-secondary);">
          ইতিমধ্যে একাউন্ট আছে?
          <router-link to="/login" style="color: var(--color-neon-orange); font-weight: 600;">লগইন করুন</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '', username: '', email: '', phone: '',
  ff_uid: '', password: '', password_confirmation: '', referral_code: '',
})
const loading = ref(false)
const errors = ref([])
const success = ref('')

async function handleRegister() {
  loading.value = true
  errors.value = []
  success.value = ''

  try {
    await authStore.register(form.value)
    success.value = 'রেজিস্ট্রেশন সফল! ড্যাশবোর্ডে নিয়ে যাচ্ছি...'
    setTimeout(() => router.push('/dashboard'), 1500)
  } catch (err) {
    const data = err.response?.data
    if (data?.errors) {
      errors.value = Object.values(data.errors).flat()
    } else {
      errors.value = [data?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।']
    }
  } finally {
    loading.value = false
  }
}
</script>
