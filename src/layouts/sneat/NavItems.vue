<script setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue'
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAdmin = authStore.user?.role === 'admin'
</script>

<template>
  <!-- 👉 Dashboards -->
  <VerticalNavLink
    v-if="isAdmin"
    :item="{
      title: 'Analytics',
      to: '/admin/dashboard',
      icon: 'bx-home-smile',
    }"
  />

  <!-- 👉 Management -->
  <VerticalNavSectionTitle
    :item="{
      heading: 'Management',
    }"
  />
  <VerticalNavLink
    v-if="isAdmin"
    :item="{
      title: 'Staff List',
      icon: 'bx-shield-quarter',
      to: '/admin/staff',
    }"
  />
  <VerticalNavLink
    v-if="isAdmin"
    :item="{
      title: 'Players',
      icon: 'bx-user-circle',
      to: '/admin/players',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Matches',
      icon: 'bx-game',
      to: '/admin/matches',
    }"
  />

  <!-- 👉 Finance -->
  <VerticalNavSectionTitle
    v-if="isAdmin"
    :item="{
      heading: 'Finance',
    }"
  />
  <VerticalNavLink
    v-if="isAdmin"
    :item="{
      title: 'Deposits',
      icon: 'bx-down-arrow-circle',
      to: '/admin/deposits',
    }"
  />
  <VerticalNavLink
    v-if="isAdmin"
    :item="{
      title: 'Withdrawals',
      icon: 'bx-up-arrow-circle',
      to: '/admin/withdrawals',
    }"
  />
  <VerticalNavLink
    v-if="isAdmin"
    :item="{
      title: 'Gateways',
      icon: 'bx-credit-card',
      to: '/admin/gateways',
    }"
  />


  <!-- 👉 Settings -->
  <VerticalNavSectionTitle
    v-if="isAdmin"
    :item="{
      heading: 'Settings',
    }"
  />
  <VerticalNavLink
    v-if="isAdmin"
    :item="{
      title: 'Settings',
      icon: 'bx-cog',
      to: '/admin/settings',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Back to Site',
      icon: 'bx-left-arrow-alt',
      to: '/',
    }"
  />
</template>
