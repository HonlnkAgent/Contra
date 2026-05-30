<template>
  <Transition name="fade">
    <div v-if="gameStore.isLevelComplete" class="level-complete-overlay">
      <div class="level-complete-panel">
        <h2 class="level-complete-title">LEVEL COMPLETE!</h2>
        <div class="level-complete-divider"></div>

        <!-- 得分 -->
        <div class="score-section">
          <div class="score-label">SCORE</div>
          <div class="score-value">{{ gameStore.score }}</div>
        </div>

        <!-- 最高分 -->
        <div class="high-score-section">
          <div class="score-label">HI-SCORE</div>
          <div class="high-score-value">{{ gameStore.highScore }}</div>
        </div>

        <!-- 新纪录提示 -->
        <div v-if="isNewRecord" class="new-record">
          NEW RECORD!
        </div>

        <div class="menu-buttons">
          <button class="btn-contra" @click="nextLevel">
            NEXT LEVEL
          </button>
          <button class="btn-contra-danger" @click="quitToMenu">
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'

const gameStore = useGameStore()
const playerStore = usePlayerStore()

/** 是否是新纪录 */
const isNewRecord = computed(() => {
  return gameStore.score >= gameStore.highScore && gameStore.score > 0
})

/** 下一关 */
function nextLevel(): void {
  gameStore.startGame()
  window.location.reload()
}

/** 退出到主菜单 */
function quitToMenu(): void {
  playerStore.reset()
  gameStore.goToMenu()
  window.location.reload()
}
</script>

<style scoped>
.level-complete-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(6px);
}

.level-complete-panel {
  background: rgba(26, 26, 46, 0.95);
  border: 4px solid #00ff00;
  padding: 40px 48px;
  text-align: center;
  min-width: 320px;
  box-shadow:
    0 0 40px rgba(0, 255, 0, 0.4),
    inset 0 0 30px rgba(0, 255, 0, 0.05);
}

.level-complete-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 28px;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  margin-bottom: 16px;
  animation: levelCompletePulse 1.5s ease-in-out infinite;
}

@keyframes levelCompletePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.level-complete-divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #00ff00, transparent);
  margin-bottom: 24px;
}

.score-section {
  margin-bottom: 16px;
}

.score-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #888;
  margin-bottom: 8px;
}

.score-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 28px;
  color: #ffcc00;
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.6);
}

.high-score-section {
  margin-bottom: 16px;
}

.high-score-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #00ff00;
}

.new-record {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ff6600;
  text-shadow: 0 0 10px rgba(255, 102, 0, 0.8);
  margin-bottom: 24px;
  animation: newRecordBlink 0.5s ease-in-out infinite alternate;
}

@keyframes newRecordBlink {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
