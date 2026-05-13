<template>
  <div class="min-h-screen flex" style="background-color: var(--color-bg-darkest);">
    <!-- Admin Sidebar will go here -->
    <div class="flex-1 flex flex-col">
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
