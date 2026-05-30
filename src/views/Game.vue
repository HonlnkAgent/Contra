<template>
  <div class="game-page">
    <!-- 游戏画布 -->
    <GameCanvas />

    <!-- 游戏UI覆盖层 -->
    <GameUI />

    <!-- 暂停菜单 -->
    <PauseMenu />

    <!-- 游戏结束界面 -->
    <GameOver />
  </div>
</template>

<script setup lang="ts">
import GameCanvas from '@/components/game/GameCanvas.vue'
import GameUI from '@/components/game/GameUI.vue'
import PauseMenu from '@/components/menu/PauseMenu.vue'
import GameOver from '@/components/menu/GameOver.vue'
</script>

<style scoped>
.game-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0f0f1a;
}
</style>
