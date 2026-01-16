<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="5"
    height="5"
    viewBox="0 0 5 5"
    class="module-input"
  >
    <circle cx="0" cy="0" r="5" fill="#fff" />
    <!-- ghost anchor to increase hitbox size for easier selection -->
    <circle cx="0" cy="0" r="15" fill="#fff" fill-opacity="0" />
  </svg>
</template>

<style scoped>
.module-input {
  cursor: pointer;
}
</style>
