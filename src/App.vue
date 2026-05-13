<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()

const layout = computed(() => {
  const layoutName = route.meta?.layout
  if (layoutName === 'admin') return AdminLayout
  if (layoutName === 'auth') return AuthLayout
  if (layoutName === 'public') return PublicLayout
  return UserLayout
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
