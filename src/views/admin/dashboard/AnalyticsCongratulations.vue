<script setup>
import { useTheme } from 'vuetify'
import illustrationJohnDark from '@images/cards/illustration-john-dark.png'
import illustrationJohnLight from '@images/cards/illustration-john-light.png'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const authStore = useAuthStore()
const { global } = useTheme()
const illustrationJohn = computed(() => global.name.value === 'dark' ? illustrationJohnDark : illustrationJohnLight)
</script>

<template>
  <VCard class="text-center text-sm-start">
    <VRow no-gutters>
      <VCol
        cols="12"
        sm="8"
        order="2"
        order-sm="1"
      >
        <VCardItem class="pb-3">
          <VCardTitle class="text-primary">
            Welcome back, {{ authStore.user?.name || 'Admin' }}! 👋
          </VCardTitle>
        </VCardItem>

        <VCardText>
          The platform has <strong>{{ props.data.total_users || 0 }}</strong> total users.
          <br>
          There are <strong>{{ props.data.active_matches || 0 }}</strong> active matches currently.
          <br>
          <VBtn
            variant="tonal"
            class="mt-6"
            size="small"
            to="/admin/matches"
          >
            Manage Matches
          </VBtn>
        </VCardText>
      </VCol>

      <VCol
        cols="12"
        sm="4"
        order="1"
        order-sm="2"
        class="text-center"
      >
        <img
          :src="illustrationJohn"
          :height="$vuetify.display.xs ? '150' : '182'"
          :class="$vuetify.display.xs ? 'mt-6 mb-n2' : 'position-absolute'"
          class="john-illustration flip-in-rtl"
        >
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss" scoped>
.john-illustration {
  inset-block-end: -0.125rem;
  inset-inline-end: 3.5rem;
}
</style>
