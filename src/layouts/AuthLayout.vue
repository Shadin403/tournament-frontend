<template>
  <div class="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300" 
       :style="{ backgroundColor: theme.bg_page }">
    
    <!-- Header/Logo Area -->
    <router-link to="/" class="flex items-center mb-8 text-2xl font-bold tracking-tight group" :style="{ color: theme.text_primary, fontFamily: theme.font_display }">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300" 
           :style="{ background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.primary_dark})` }">
        <Zap :size="24" class="text-white" />
      </div>
      <span class="uppercase tracking-wider">{{ theme.site_name }}</span>
    </router-link>

    <!-- Content Card (The Auth Card) -->
    <div class="w-full rounded-[1.5rem] border shadow-xl overflow-hidden sm:max-w-md md:max-w-lg transition-all duration-300" 
         :style="{ 
           backgroundColor: theme.bg_card, 
           borderColor: theme.primary_color + '20',
           boxShadow: `0 20px 50px -12px ${theme.primary_color}15`
         }">
      <div class="p-6 space-y-6 sm:p-10">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <p class="mt-8 text-center text-xs font-bold uppercase tracking-[0.2em]" :style="{ color: theme.text_muted }">
      &copy; {{ new Date().getFullYear() }} {{ theme.site_name }} • Gaming Evolution
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Zap } from 'lucide-vue-next'

const themeStore = useThemeStore()
const theme = computed(() => themeStore.theme)
</script>

<style scoped>
.auth-layout {
  transition: background-color 0.3s ease;
}
</style>
