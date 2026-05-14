<script setup>
import DefaultLayoutWithVerticalNav from './sneat/DefaultLayoutWithVerticalNav.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <VApp>
    <DefaultLayoutWithVerticalNav>
      <RouterView v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </DefaultLayoutWithVerticalNav>
  </VApp>
</template>

<style lang="scss">
@use "@layouts/styles/default-layout";

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
