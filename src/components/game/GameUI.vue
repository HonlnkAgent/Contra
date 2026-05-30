<template>
  <div class="game-ui" v-if="gameStore.isPlaying || gameStore.isPaused">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <!-- 得分 -->
      <div class="stat-item">
        <span class="stat-label">SCORE</span>
        <span class="stat-value text-yellow-400">{{ playerStore.score }}</span>
      </div>

      <!-- 生命值 -->
      <div class="stat-item">
        <span class="stat-label">HP</span>
        <div class="health-bar-container">
          <div class="health-bar" :style="{ width: healthPercent + '%' }"></div>
        </div>
      </div>

      <!-- 生命数 -->
      <div class="stat-item">
        <span class="stat-label">LIVES</span>
        <span class="stat-value text-red-400">{{ playerStore.lives }}</span>
      </div>

      <!-- 武器 -->
      <div class="stat-item">
        <span class="stat-label">WEAPON</span>
        <span class="stat-value text-cyan-400">{{ playerStore.getWeaponLabel() }}</span>
      </div>
    </div>

    <!-- 最高分 -->
    <div class="high-score">
      HI-SCORE: {{ gameStore.highScore }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'

const gameStore = useGameStore()
const playerStore = usePlayerStore()

/** 生命值百分比 */
const healthPercent = computed(() => {
  return (playerStore.health / playerStore.maxHealth) * 100
})
</script>

<style scoped>
.game-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 20;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
}

.stat-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  font-weight: bold;
}

.health-bar-container {
  width: 120px;
  height: 12px;
  background: #333;
  border: 2px solid #666;
  border-radius: 2px;
  overflow: hidden;
}

.health-bar {
  height: 100%;
  background: linear-gradient(to right, #ff4444, #ff8800, #00ff00);
  transition: width 0.3s ease;
}

.high-score {
  position: absolute;
  top: 40px;
  right: 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #666;
}
</style>
