<script setup>
const props = defineProps({
  data: { type: Array, default: () => [] }
})

const moreList = [
  {
    title: 'View All',
    value: 'View All',
    to: '/admin/deposits'
  }
]
</script>

<template>
  <VCard title="Recent Deposits">
    <template #append>
      <MoreBtn :menu-list="moreList" />
    </template>

    <VCardText>
      <VList class="card-list">
        <VListItem
          v-for="item in props.data"
          :key="item.id"
        >
          <template #prepend>
            <VAvatar
              rounded
              variant="tonal"
              color="primary"
              icon="bx-down-arrow-alt"
              size="40"
            />
          </template>

          <VListItemSubtitle>
            {{ item.method }}
          </VListItemSubtitle>
          <VListItemTitle>
            {{ item.user?.name || 'User' }}
          </VListItemTitle>

          <template #append>
            <VListItemAction>
              <span class="me-2" :class="item.status === 'approved' ? 'text-success' : 'text-warning'">
                ৳{{ item.amount }}
              </span>
              <span class="text-disabled text-xs">{{ item.status }}</span>
            </VListItemAction>
          </template>
        </VListItem>
        <VListItem v-if="!props.data.length">
          <VListItemTitle class="text-center text-muted">No recent deposits</VListItemTitle>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
  .card-list {
    --v-card-list-gap: 1.5rem;
  }
</style>
