<script setup>
const props = defineProps({
  item: {
    type: null,
    required: true,
  },
})
</script>

<template>
  <li
    class="nav-link"
    :class="{ disabled: item.disable }"
  >
    <Component
      :is="item.to ? 'RouterLink' : 'a'"
      :to="item.to"
      :href="item.href"
      :target="item.target"
    >
      <VIcon
        :icon="item.icon || 'bxs-circle'"
        class="nav-item-icon"
      />
      <!-- 👉 Title -->
      <span class="nav-item-title">
        {{ item.title }}
      </span>
      <span
        class="nav-item-badge"
        :class="item.badgeClass"
      >
        {{ item.badgeContent }}
      </span>
    </Component>
  </li>
</template>

<style lang="scss">
.nav-link {
  list-style: none;

  a {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    column-gap: 12px !important;
    padding: 10px 16px !important;
    text-decoration: none !important;
    color: inherit !important;
    width: 100%;
  }

  .nav-item-icon {
    font-size: 22px !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .nav-item-title {
    font-size: 15px !important;
    line-height: 1.2 !important;
    white-space: nowrap !important;
    flex-grow: 1 !important;
  }
}
</style>
