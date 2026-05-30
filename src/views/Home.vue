<template>
  <div class="home-page">
    <MainMenu />
  </div>
</template>

<script setup lang="ts">
import MainMenu from '@/components/menu/MainMenu.vue'
</script>

<style scoped>
.home-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f1a;
  position: relative;
}
</style>
