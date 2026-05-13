<template>
  <div class="min-h-screen flex items-center justify-center" style="background-color: var(--color-bg-darkest);">
    <div class="w-full max-w-md px-4">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold gradient-text-orange">BATTLEZONE</h1>
        <p style="color: var(--color-text-secondary);" class="mt-2">Gaming Tournament Platform</p>
      </div>
      <div class="glass-card neon-border-orange p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
