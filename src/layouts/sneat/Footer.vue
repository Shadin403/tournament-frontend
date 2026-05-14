<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center">
      &copy;
      {{ new Date().getFullYear() }}
      Made With
      <VIcon
        icon="bx-heart"
        color="error"
        size="1.25rem"
        class="mx-1"
        style="margin-top: -2px;"
      />
      By <a
        href="https://wa.me/8801833950228"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >Shadin Sharkar</a>
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="https://wa.me/8801833950228"
        target="_blank"
        rel="noopener noreferrer"
      >Contact Support</a>
    </span>
  </div>
</template>
