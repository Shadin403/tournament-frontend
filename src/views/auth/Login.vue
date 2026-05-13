<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
       style="background-color: var(--color-bg-darkest);">

    <!-- Background Effects -->
    <div class="absolute inset-0" style="background: radial-gradient(ellipse at 30% 50%, rgba(255,69,0,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(155,48,255,0.06) 0%, transparent 50%);" />

    <div class="w-full max-w-md relative z-10">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <h1 class="text-4xl font-black gradient-text-orange" style="font-family: var(--font-display); letter-spacing: 0.1em;">
            ⚡ BATTLEZONE
          </h1>
        </router-link>
        <p class="mt-2" style="color: var(--color-text-secondary);">আপনার একাউন্টে লগইন করুন</p>
      </div>

      <!-- Card -->
      <div class="glass-card neon-border-orange p-8">
        <h2 class="text-2xl font-bold mb-6" style="font-family: var(--font-display);">Login</h2>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <!-- Login Field -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">
              Email বা Phone নম্বর
            </label>
            <input
              v-model="form.login"
              type="text"
              placeholder="example@email.com বা 01XXXXXXXXX"
              class="input-dark"
              :disabled="loading"
              required
            />
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium" style="color: var(--color-text-secondary);">পাসওয়ার্ড</label>
              <router-link to="/forgot-password" style="color: var(--color-neon-orange); font-size: 0.8rem;">
                ভুলে গেছেন?
              </router-link>
            </div>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="আপনার পাসওয়ার্ড"
                class="input-dark pr-12"
                :disabled="loading"
                required
              />
              <button type="button" @click="showPassword = !showPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2"
                      style="color: var(--color-text-muted); background: none; border: none; cursor: pointer;">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 rounded-lg text-sm" style="background: rgba(255,34,68,0.15); border: 1px solid rgba(255,34,68,0.3); color: var(--color-neon-red);">
            ⚠️ {{ error }}
          </div>

          <!-- Submit -->
          <button type="submit" class="btn-neon w-full" :disabled="loading">
            <span v-if="loading">⏳ লগইন হচ্ছে...</span>
            <span v-else>🎮 লগইন করুন</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px" style="background: var(--color-border-subtle);" />
          <span style="color: var(--color-text-muted); font-size: 0.8rem;">অথবা</span>
          <div class="flex-1 h-px" style="background: var(--color-border-subtle);" />
        </div>

        <!-- Social Login -->
        <div class="flex flex-col gap-3">
          <button @click="socialLogin('google')"
                  class="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium transition-all"
                  style="background: rgba(255,255,255,0.05); border: 1px solid var(--color-border-subtle); color: var(--color-text-primary);"
                  :disabled="loading">
            <span>🌐</span> Google দিয়ে লগইন
          </button>
          <button @click="socialLogin('discord')"
                  class="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium transition-all"
                  style="background: rgba(88,101,242,0.15); border: 1px solid rgba(88,101,242,0.3); color: #5865f2;"
                  :disabled="loading">
            <span>🎮</span> Discord দিয়ে লগইন
          </button>
        </div>

        <!-- Register Link -->
        <p class="text-center mt-6 text-sm" style="color: var(--color-text-secondary);">
          একাউন্ট নেই?
          <router-link to="/register" style="color: var(--color-neon-orange); font-weight: 600;">
            এখনই রেজিস্ট্রেশন করুন
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({ login: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value)
    const redirect = route.query.redirect || (authStore.isAdmin ? '/admin/dashboard' : '/')
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
  } finally {
    loading.value = false
  }
}

async function socialLogin(provider) {
  try {
    const { data } = await import('@/services/api').then(m => m.default.get(`/auth/${provider}/redirect`))
    window.location.href = data.url
  } catch {
    error.value = `${provider} লগইন কাজ করছে না।`
  }
}
</script>
