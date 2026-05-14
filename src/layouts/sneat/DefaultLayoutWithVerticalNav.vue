<script setup>
import NavItems from './NavItems.vue'
import logo from '@images/logo.svg?raw'
import VerticalNavLayout from '@layouts/components/VerticalNavLayout.vue'
import Footer from './Footer.vue'
import NavbarThemeSwitcher from './NavbarThemeSwitcher.vue'
import UserProfile from './UserProfile.vue'
</script>

<template>
  <VerticalNavLayout>
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center w-100">
        <!-- 👉 Vertical nav toggle in overlay mode -->
        <IconBtn
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="bx-menu" />
        </IconBtn>

        <!-- 👉 Search -->
        <div
          class="d-flex align-center cursor-pointer ms-lg-n3"
          style="user-select: none;"
        >
          <VTextField
            placeholder="Search (Ctrl+/)"
            prepend-inner-icon="bx-search"
            density="compact"
            variant="solo"
            hide-details
            class="d-none d-md-flex"
            style="width: 260px; --v-field-padding-start: 12px;"
            flat
          />
          <IconBtn class="d-md-none">
            <VIcon icon="bx-search" />
          </IconBtn>
        </div>

        <VSpacer />

        <div class="d-flex align-center gap-2">
          <VBtn
            variant="text"
            icon
            color="secondary"
          >
            <VBadge
              content="4"
              color="error"
              size="x-small"
            >
              <VIcon icon="bx-bell" />
            </VBadge>
          </VBtn>

          <NavbarThemeSwitcher />

          <VDivider
            vertical
            inset
            class="mx-2"
          />

          <UserProfile />
        </div>
      </div>
    </template>

    <template #vertical-nav-header="{ toggleIsOverlayNavActive }">
      <RouterLink
        to="/admin/dashboard"
        class="app-logo app-title-wrapper"
      >
        <div
          class="d-flex"
          v-html="logo"
        />

        <h1 class="app-logo-title text-primary font-weight-black">
          TUNAMENT
        </h1>
      </RouterLink>

      <IconBtn
        class="d-block d-lg-none"
        @click="toggleIsOverlayNavActive(false)"
      >
        <VIcon icon="bx-x" />
      </IconBtn>
    </template>

    <template #vertical-nav-content>
      <NavItems />
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>

<style lang="scss" scoped>
.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  line-height: 1.3125rem;
  padding-block: 0.125rem;
  padding-inline: 0.25rem;
}

.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.75rem;

  .app-logo-title {
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.75rem;
    text-transform: uppercase;
  }
}
</style>
