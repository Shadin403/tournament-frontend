<template>
  <div class="px-4 py-4">

    <!-- ── Profile Header ────────────────────────────────────────────── -->
    <div class="relative rounded-2xl overflow-hidden mb-4 p-5"
         style="background: linear-gradient(135deg, rgba(255,69,0,0.2), rgba(155,48,255,0.15)); border: 1px solid var(--color-border-subtle);">

      <div class="flex items-center gap-4">
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <img :src="avatarUrl" class="w-20 h-20 rounded-2xl object-cover"
               style="border: 2px solid var(--color-neon-orange);" />
          <label class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                 style="background: var(--color-neon-orange); border: 2px solid var(--color-bg-darkest);">
            <Camera :size="11" color="white" />
            <input type="file" accept="image/*" class="hidden" @change="uploadAvatar" />
          </label>
        </div>

        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-black" style="font-family: var(--font-display);">{{ authStore.user?.name }}</h1>
          <p class="text-sm" style="color: var(--color-neon-orange);">@{{ authStore.user?.username }}</p>
          <div class="flex items-center gap-1 mt-1">
            <Flame :size="12" style="color: var(--color-neon-orange);" />
            <span class="text-xs" style="color: var(--color-text-muted);">FF UID: {{ authStore.user?.ff_uid || 'Not set' }}</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3 mt-4 pt-4" style="border-top: 1px solid rgba(255,255,255,0.08);">
        <div class="text-center">
          <div class="text-xl font-black gradient-text-orange" style="font-family: var(--font-display);">
            {{ authStore.user?.total_wins ?? 0 }}
          </div>
          <div class="text-xs" style="color: var(--color-text-muted);">Wins</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-black" style="font-family: var(--font-display); color: var(--color-neon-blue);">
            {{ authStore.user?.total_matches ?? 0 }}
          </div>
          <div class="text-xs" style="color: var(--color-text-muted);">Matches</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-black" style="font-family: var(--font-display); color: var(--color-neon-green);">
            {{ authStore.user?.total_kills ?? 0 }}
          </div>
          <div class="text-xs" style="color: var(--color-text-muted);">Kills</div>
        </div>
      </div>
    </div>

    <!-- ── Menu Items ─────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-2 mb-4">
      <div v-for="group in menuGroups" :key="group.label">
        <p class="text-xs font-semibold uppercase tracking-widest px-1 mb-2 mt-3"
           style="color: var(--color-text-muted);">{{ group.label }}</p>
        <div class="rounded-2xl overflow-hidden" style="background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
          <router-link
            v-for="(item, idx) in group.items" :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3.5 transition-all"
            :style="idx < group.items.length - 1 ? 'border-bottom: 1px solid var(--color-border-subtle);' : ''">

            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                 :style="`background: ${item.bg}; border: 1px solid ${item.border};`">
              <component :is="item.icon" :size="15" :style="`color: ${item.color};`" />
            </div>

            <span class="flex-1 text-sm font-medium" style="color: var(--color-text-primary);">{{ item.label }}</span>

            <ChevronRight :size="15" style="color: var(--color-text-muted);" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- ── Logout ─────────────────────────────────────────────────────── -->
    <button @click="logout"
            class="w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-semibold text-sm mt-2"
            style="background: rgba(255,34,68,0.12); border: 1px solid rgba(255,34,68,0.3); color: var(--color-neon-red);">
      <LogOut :size="17" />
      Logout
    </button>

    <p class="text-center text-xs mt-6" style="color: var(--color-text-muted);">
      BattleZone v1.0 · Made with ⚡ in Bangladesh
    </p>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Camera, Flame, ChevronRight, LogOut,
  UserCog, Key, Bell, Gift, BarChart2,
  Shield, HelpCircle, FileText, Wallet
} from 'lucide-vue-next'
import api from '@/services/api'

const authStore = useAuthStore()
const router = useRouter()

const avatarUrl = computed(() =>
  authStore.user?.avatar
    ? `/storage/${authStore.user.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'U')}&background=FF4500&color=fff&bold=true`
)

const menuGroups = [
  {
    label: 'Account',
    items: [
      { to: '/profile/edit', icon: UserCog, label: 'Edit Profile',      color: 'var(--color-neon-orange)', bg: 'rgba(255,69,0,0.1)',   border: 'rgba(255,69,0,0.25)' },
      { to: '/profile/password', icon: Key, label: 'Change Password',   color: 'var(--color-neon-blue)',   bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.25)' },
      { to: '/notifications',  icon: Bell,  label: 'Notifications',     color: 'var(--color-neon-purple)', bg: 'rgba(155,48,255,0.1)', border: 'rgba(155,48,255,0.25)' },
    ],
  },
  {
    label: 'Rewards',
    items: [
      { to: '/referral',   icon: Gift,     label: 'Referral Program',   color: 'var(--color-neon-green)',  bg: 'rgba(0,255,136,0.1)',  border: 'rgba(0,255,136,0.25)' },
      { to: '/leaderboard',icon: BarChart2, label: 'Leaderboard',       color: 'var(--color-neon-orange)', bg: 'rgba(255,69,0,0.1)',   border: 'rgba(255,69,0,0.25)' },
      { to: '/wallet',     icon: Wallet,   label: 'My Wallet',          color: 'var(--color-neon-blue)',   bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.25)' },
    ],
  },
  {
    label: 'Support',
    items: [
      { to: '/support',    icon: HelpCircle, label: 'Help & Support',   color: 'var(--color-text-secondary)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
      { to: '/terms',      icon: FileText,   label: 'Terms & Privacy',  color: 'var(--color-text-secondary)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
    ],
  },
]

async function uploadAvatar(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('avatar', file)
  try {
    const { data } = await api.post('/profile/avatar', form)
    authStore.user.avatar = data.data?.avatar_url?.replace('/storage/', '')
  } catch { /* ignore */ }
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>
