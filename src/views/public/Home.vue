<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-darkest); font-family: var(--font-body);">

    <!-- ── Navbar ─────────────────────────────────────────────────────── -->
    <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
         style="background: rgba(10,10,15,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--color-border-subtle);">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center"
             style="background: linear-gradient(135deg, var(--color-neon-orange), var(--color-neon-red));">
          <span style="font-size:1.1rem;">⚡</span>
        </div>
        <span class="text-xl font-bold gradient-text-orange" style="font-family: var(--font-display); letter-spacing: 0.1em;">
          BATTLEZONE
        </span>
      </div>

      <div class="hidden md:flex items-center gap-8">
        <a href="#matches" style="color: var(--color-text-secondary); font-size:0.9rem;" class="nav-link">Matches</a>
        <a href="#tournaments" style="color: var(--color-text-secondary); font-size:0.9rem;" class="nav-link">Tournaments</a>
        <a href="#leaderboard" style="color: var(--color-text-secondary); font-size:0.9rem;" class="nav-link">Leaderboard</a>
        <a href="#how-it-works" style="color: var(--color-text-secondary); font-size:0.9rem;" class="nav-link">How It Works</a>
      </div>

      <div class="flex items-center gap-3">
        <router-link to="/login" class="btn-outline-neon" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;">Login</router-link>
        <router-link to="/register" class="btn-neon" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;">Join Now</router-link>
      </div>
    </nav>

    <!-- ── Hero Section ───────────────────────────────────────────────── -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <!-- Animated Background -->
      <div class="absolute inset-0" style="background: radial-gradient(ellipse at 50% 40%, rgba(255,69,0,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(155,48,255,0.08) 0%, transparent 50%);" />
      <div class="absolute inset-0 grid-pattern opacity-20" />

      <!-- Floating Orbs -->
      <div class="absolute top-32 left-16 w-64 h-64 rounded-full animate-float"
           style="background: radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 70%); filter: blur(40px);" />
      <div class="absolute bottom-32 right-16 w-96 h-96 rounded-full"
           style="background: radial-gradient(circle, rgba(155,48,255,0.1) 0%, transparent 70%); filter: blur(60px); animation: float 4s ease-in-out infinite reverse;" />

      <div class="relative z-10 text-center px-6 max-w-5xl mx-auto animate-slide-up">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
             style="background: rgba(255,69,0,0.15); border: 1px solid rgba(255,69,0,0.3);">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span style="color: var(--color-neon-orange); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
            Bangladesh's #1 Gaming Platform
          </span>
        </div>

        <!-- Main Heading -->
        <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight" style="font-family: var(--font-display); letter-spacing: 0.03em;">
          <span style="color: var(--color-text-primary);">COMPETE.</span><br>
          <span class="gradient-text-orange">WIN CASH.</span><br>
          <span style="color: var(--color-text-primary);">DOMINATE.</span>
        </h1>

        <p class="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style="color: var(--color-text-secondary); line-height: 1.8;">
          Free Fire ও PUBG Mobile টুর্নামেন্টে অংশ নিন।<br>
          প্রতিদিন হাজার হাজার টাকা জিতুন। সরাসরি bKash/Nagad-এ পেমেন্ট।
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <router-link to="/register" class="btn-neon text-base w-full sm:w-auto" style="padding: 1rem 2.5rem;">
            🎮 এখনই শুরু করুন — বিনামূল্যে
          </router-link>
          <router-link to="/matches" class="btn-outline-neon text-base w-full sm:w-auto" style="padding: 1rem 2.5rem;">
            🏆 Live Matches দেখুন
          </router-link>
        </div>

        <!-- Live Stats Bar -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div class="glass-card p-4 text-center">
            <div class="text-3xl font-black gradient-text-orange" style="font-family: var(--font-display);">
              {{ stats.total_players?.toLocaleString() ?? '...' }}+
            </div>
            <div class="text-xs mt-1" style="color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Active Players</div>
          </div>
          <div class="glass-card p-4 text-center">
            <div class="text-3xl font-black" style="font-family: var(--font-display); color: var(--color-neon-red);">
              {{ stats.running_matches ?? '0' }}
            </div>
            <div class="text-xs mt-1" style="color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Live Matches</div>
          </div>
          <div class="glass-card p-4 text-center">
            <div class="text-3xl font-black" style="font-family: var(--font-display); color: var(--color-neon-green);">
              ৳{{ formatAmount(stats.prize_distributed) }}
            </div>
            <div class="text-xs mt-1" style="color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Prize Distributed</div>
          </div>
          <div class="glass-card p-4 text-center">
            <div class="text-3xl font-black" style="font-family: var(--font-display); color: var(--color-neon-blue);">
              {{ stats.total_matches ?? '0' }}
            </div>
            <div class="text-xs mt-1" style="color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Matches Played</div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style="color: var(--color-text-muted);">
        <span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;">Scroll</span>
        <div class="w-px h-12" style="background: linear-gradient(to bottom, var(--color-neon-orange), transparent);" />
      </div>
    </section>

    <!-- ── How It Works ────────────────────────────────────────────────── -->
    <section id="how-it-works" class="py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4" style="font-family: var(--font-display);">কীভাবে কাজ করে?</h2>
          <p style="color: var(--color-text-secondary);">মাত্র ৩টি সহজ ধাপে শুরু করুন</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(step, i) in steps" :key="i" class="glass-card p-8 text-center relative">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                 style="background: linear-gradient(135deg, var(--color-neon-orange), var(--color-neon-red));">
              {{ i + 1 }}
            </div>
            <div class="text-5xl mb-4">{{ step.icon }}</div>
            <h3 class="text-xl font-bold mb-3" style="font-family: var(--font-display);">{{ step.title }}</h3>
            <p style="color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.7;">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Game Modes ──────────────────────────────────────────────────── -->
    <section id="matches" class="py-24 px-6" style="background: var(--color-bg-dark);">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4" style="font-family: var(--font-display);">Game Modes</h2>
          <p style="color: var(--color-text-secondary);">আপনার পছন্দের মোডে খেলুন</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="mode in gameModes" :key="mode.name"
               class="glass-card p-6 cursor-pointer hover:scale-105 transition-transform duration-300"
               :class="mode.border">
            <div class="text-4xl mb-3">{{ mode.icon }}</div>
            <h3 class="text-lg font-bold mb-1" style="font-family: var(--font-display);">{{ mode.name }}</h3>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem;">{{ mode.desc }}</p>
            <div class="mt-3 text-sm font-semibold" :style="{ color: mode.color }">
              Entry: ৳{{ mode.entry }}+
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Payment Methods ─────────────────────────────────────────────── -->
    <section class="py-24 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-4" style="font-family: var(--font-display);">পেমেন্ট সিস্টেম</h2>
        <p class="mb-12" style="color: var(--color-text-secondary);">
          সহজে ডিপোজিট করুন এবং জয়ের টাকা সরাসরি আপনার মোবাইলে পান
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="method in paymentMethods" :key="method.name"
               class="glass-card p-6 flex flex-col items-center gap-3">
            <span class="text-4xl">{{ method.icon }}</span>
            <span class="font-bold" style="font-family: var(--font-display);">{{ method.name }}</span>
            <span style="color: var(--color-neon-green); font-size:0.8rem;">✓ সাপোর্টেড</span>
          </div>
        </div>
        <div class="mt-12 glass-card neon-border-orange p-8">
          <h3 class="text-2xl font-bold mb-4" style="font-family: var(--font-display);">🔒 ১০০% নিরাপদ</h3>
          <p style="color: var(--color-text-secondary);">
            আপনার প্রতিটি লেনদেন সুরক্ষিত। Admin verification এর পর ৩০ মিনিটের মধ্যে ব্যালেন্স যোগ হবে।
            জয়ের টাকা ২৪ ঘণ্টার মধ্যে bKash/Nagad-এ পাঠানো হবে।
          </p>
        </div>
      </div>
    </section>

    <!-- ── CTA Section ─────────────────────────────────────────────────── -->
    <section class="py-24 px-6" style="background: var(--color-bg-dark);">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-5xl font-black mb-6" style="font-family: var(--font-display);">
          আজই শুরু করুন!
        </h2>
        <p class="text-xl mb-10" style="color: var(--color-text-secondary);">
          রেজিস্ট্রেশন সম্পূর্ণ বিনামূল্যে। প্রথম ম্যাচ খেলুন এবং নিজের দক্ষতা প্রমাণ করুন।
        </p>
        <router-link to="/register" class="btn-neon text-lg" style="padding: 1.25rem 3rem; display: inline-block;">
          🚀 এখনই যোগ দিন — বিনামূল্যে
        </router-link>
      </div>
    </section>

    <!-- ── Footer ──────────────────────────────────────────────────────── -->
    <footer class="py-12 px-6" style="border-top: 1px solid var(--color-border-subtle);">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div class="text-2xl font-black gradient-text-orange mb-3" style="font-family: var(--font-display);">BATTLEZONE</div>
            <p style="color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.7;">
              বাংলাদেশের সেরা ফ্রি ফায়ার ও পাবজি টুর্নামেন্ট প্ল্যাটফর্ম।
            </p>
          </div>
          <div>
            <h4 class="font-bold mb-3" style="font-family: var(--font-display);">Quick Links</h4>
            <div class="flex flex-col gap-2">
              <router-link to="/matches" style="color: var(--color-text-secondary); font-size: 0.9rem;">Matches</router-link>
              <router-link to="/tournaments" style="color: var(--color-text-secondary); font-size: 0.9rem;">Tournaments</router-link>
              <router-link to="/leaderboard" style="color: var(--color-text-secondary); font-size: 0.9rem;">Leaderboard</router-link>
            </div>
          </div>
          <div>
            <h4 class="font-bold mb-3" style="font-family: var(--font-display);">Contact</h4>
            <div class="flex flex-col gap-2" style="color: var(--color-text-secondary); font-size: 0.9rem;">
              <span>📧 support@battlezone.gg</span>
              <span>📱 Facebook: BattleZone BD</span>
              <span>💬 Discord: discord.gg/battlezone</span>
            </div>
          </div>
        </div>
        <div class="text-center pt-8" style="border-top: 1px solid var(--color-border-subtle); color: var(--color-text-muted); font-size: 0.8rem;">
          © 2026 BattleZone. All rights reserved. Made with ⚡ in Bangladesh.
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const stats = ref({
  total_players: 0,
  running_matches: 0,
  prize_distributed: 0,
  total_matches: 0,
})

const steps = [
  { icon: '👤', title: 'রেজিস্ট্রেশন করুন', desc: 'ফ্রি একাউন্ট খুলুন। ইমেইল বা ফোন নম্বর দিয়ে মাত্র ১ মিনিটে সম্পন্ন করুন।' },
  { icon: '💰', title: 'ওয়ালেট ডিপোজিট করুন', desc: 'bKash, Nagad বা Rocket দিয়ে সহজে টাকা যোগ করুন। মিনিমাম মাত্র ৳৫০।' },
  { icon: '🏆', title: 'ম্যাচ জয় করুন', desc: 'Tournament এ অংশ নিন, জিতুন এবং সরাসরি আপনার মোবাইলে পুরস্কার নিন।' },
]

const gameModes = [
  { icon: '🔫', name: 'Solo',       desc: '১ vs ৪৭ — একা লড়াই',        entry: '20',  color: 'var(--color-neon-orange)', border: 'neon-border-orange' },
  { icon: '👥', name: 'Duo',        desc: '২ জন দল — একসাথে জয়',       entry: '30',  color: 'var(--color-neon-blue)',   border: '' },
  { icon: '🛡️', name: 'Squad',      desc: '৪ জন দল — টিমওয়ার্ক',       entry: '40',  color: 'var(--color-neon-purple)', border: 'neon-border-purple' },
  { icon: '⚡', name: 'Clash Squad', desc: '৪vs৪ দ্রুত ম্যাচ',           entry: '25',  color: 'var(--color-neon-red)',    border: '' },
  { icon: '🎯', name: 'Lone Wolf',   desc: 'Solo বিশেষ মোড',             entry: '15',  color: 'var(--color-neon-green)',  border: '' },
  { icon: '🏟️', name: 'Tournament',  desc: 'বড় পুরস্কারের প্রতিযোগিতা', entry: '100', color: 'var(--color-neon-orange)', border: 'neon-border-orange' },
]

const paymentMethods = [
  { icon: '💳', name: 'bKash' },
  { icon: '🟠', name: 'Nagad' },
  { icon: '🔵', name: 'Rocket' },
  { icon: '🟡', name: 'Upay' },
]

function formatAmount(val) {
  if (!val) return '0'
  if (val >= 100000) return (val / 100000).toFixed(1) + 'L'
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
  return val
}

onMounted(async () => {
  try {
    const { data } = await api.get('/stats')
    stats.value = data.data
  } catch { /* show zeros */ }
})
</script>

<style scoped>
.grid-pattern {
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}
.nav-link:hover { color: var(--color-text-primary) !important; transition: color 0.2s; }
</style>
