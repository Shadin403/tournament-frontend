<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-backdrop" @click.self="close">
        <Transition name="modal-slide" appear>
          <div class="modal-container" v-if="isOpen">

            <!-- Close button -->
            <button @click="close" class="modal-close">
              <X :size="20" />
            </button>

            <!-- Header -->
            <div class="modal-header">
              <div class="modal-logo">
                <Zap :size="18" color="white" :stroke-width="2.5" />
              </div>
              <h2 class="modal-title gradient-text-orange">BATTLEZONE</h2>
              <p class="modal-subtitle">এগিয়ে যেতে লগইন করুন</p>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" class="modal-form">
              <div>
                <label class="form-label">Email বা Phone</label>
                <div class="input-wrap">
                  <Mail :size="16" class="input-icon" />
                  <input v-model="form.login" type="text" placeholder="example@email.com"
                         class="input-dark input-with-icon" required :disabled="loading" />
                </div>
              </div>

              <div>
                <label class="form-label">পাসওয়ার্ড</label>
                <div class="input-wrap">
                  <Lock :size="16" class="input-icon" />
                  <input v-model="form.password" :type="showPw ? 'text' : 'password'"
                         placeholder="আপনার পাসওয়ার্ড" class="input-dark input-with-icon"
                         required :disabled="loading" />
                  <button type="button" @click="showPw = !showPw" class="pw-toggle">
                    <component :is="showPw ? EyeOff : Eye" :size="16" />
                  </button>
                </div>
              </div>

              <!-- Error -->
              <div v-if="error" class="error-box">
                <AlertCircle :size="14" />
                {{ error }}
              </div>

              <!-- Submit -->
              <button type="submit" class="btn-neon w-full" :disabled="loading">
                <Loader2 v-if="loading" :size="16" class="animate-spin" />
                <span v-else>🎮 লগইন করুন</span>
              </button>
            </form>

            <!-- Divider -->
            <div class="modal-divider">
              <span>অথবা</span>
            </div>

            <!-- Social -->
            <div class="social-buttons">
              <button @click="socialLogin('google')" class="social-btn google" :disabled="loading">
                <Chrome :size="16" /> Google
              </button>
              <button @click="socialLogin('discord')" class="social-btn discord" :disabled="loading">
                <Gamepad2 :size="16" /> Discord
              </button>
            </div>

            <!-- Register link -->
            <p class="modal-footer">
              একাউন্ট নেই?
              <a href="/register" @click.prevent="navigateToRegister" class="register-link">
                রেজিস্ট্রেশন করুন
              </a>
            </p>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLoginModal } from '@/composables/useLoginModal'
import {
  X, Zap, Mail, Lock, Eye, EyeOff, AlertCircle,
  Loader2, Chrome, Gamepad2
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { isOpen, close, onLoginSuccess } = useLoginModal()

const form = ref({ login: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPw = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value)
    form.value = { login: '', password: '' }
    onLoginSuccess(router)
  } catch (err) {
    error.value = err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে।'
  } finally {
    loading.value = false
  }
}

async function socialLogin(provider) {
  try {
    const api = (await import('@/services/api')).default
    const { data } = await api.get(`/auth/${provider}/redirect`)
    window.location.href = data.url
  } catch {
    error.value = `${provider} লগইন কাজ করছে না।`
  }
}

function navigateToRegister() {
  close()
  router.push('/register')
}
</script>

<style scoped>
/* ─── Backdrop ────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

/* ─── Container ───────────────────────────────────────────────────────── */
.modal-container {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 32px 28px;
  background: var(--color-bg-dark);
  border: 1px solid var(--color-border-glass);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 69, 0, 0.08);
}

/* ─── Close ───────────────────────────────────────────────────────────── */
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border-subtle);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-close:hover {
  background: rgba(255, 69, 0, 0.15);
  color: var(--color-neon-orange);
  border-color: rgba(255, 69, 0, 0.3);
}

/* ─── Header ──────────────────────────────────────────────────────────── */
.modal-header {
  text-align: center;
  margin-bottom: 24px;
}
.modal-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-neon-orange), var(--color-neon-red));
  box-shadow: 0 4px 16px rgba(255, 69, 0, 0.4);
}
.modal-title {
  font-size: 1.4rem;
  font-weight: 900;
  font-family: var(--font-display);
  letter-spacing: 0.1em;
}
.modal-subtitle {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}

/* ─── Form ────────────────────────────────────────────────────────────── */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}
.input-wrap {
  position: relative;
}
.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}
.input-with-icon {
  padding-left: 38px !important;
}
.pw-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
}
.pw-toggle:hover {
  color: var(--color-neon-orange);
}

/* ─── Error ───────────────────────────────────────────────────────────── */
.error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.82rem;
  background: rgba(255, 34, 68, 0.12);
  border: 1px solid rgba(255, 34, 68, 0.3);
  color: var(--color-neon-red);
}

/* ─── Divider ─────────────────────────────────────────────────────────── */
.modal-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
}
.modal-divider::before,
.modal-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-subtle);
}
.modal-divider span {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* ─── Social Buttons ──────────────────────────────────────────────────── */
.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-border-subtle);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-primary);
}
.social-btn:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
}
.social-btn.discord {
  border-color: rgba(88, 101, 242, 0.3);
  color: #5865f2;
}
.social-btn.discord:hover {
  background: rgba(88, 101, 242, 0.12);
}

/* ─── Footer ──────────────────────────────────────────────────────────── */
.modal-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}
.register-link {
  color: var(--color-neon-orange);
  font-weight: 600;
  text-decoration: none;
}

/* ─── Animations ──────────────────────────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.modal-slide-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-slide-leave-active { transition: all 0.2s ease; }
.modal-slide-enter-from { opacity: 0; transform: translateY(30px) scale(0.96); }
.modal-slide-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
</style>
