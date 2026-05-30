<template>
  <div ref="gameContainer" class="game-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Phaser from 'phaser'
import { createGameConfig } from '@/game/config/GameConfig'

/** 游戏容器 DOM 引用 */
const gameContainer = ref<HTMLDivElement | null>(null)

/** Phaser 游戏实例 */
let game: Phaser.Game | null = null

onMounted(() => {
  if (!gameContainer.value) return

  const config = createGameConfig(gameContainer.value)
  game = new Phaser.Game(config)
})

onUnmounted(() => {
  if (game) {
    game.destroy(true)
    game = null
  }
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0f0f1a;
}

.game-container :deep(canvas) {
  max-width: 100%;
  max-height: 100%;
  image-rendering: pixelated;
}
</style>
