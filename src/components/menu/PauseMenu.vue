<template>
  <Transition name="fade">
    <div v-if="gameStore.isPaused" class="pause-overlay">
      <div class="pause-panel">
        <h2 class="pause-title">PAUSED</h2>
        <div class="pause-divider"></div>

        <div class="menu-buttons">
          <button class="btn-contra" @click="resumeGame">
            RESUME
          </button>
          <button class="btn-contra" @click="restartGame">
            RESTART
          </button>
          <button class="btn-contra-danger" @click="quitToMenu">
            QUIT
          </button>
        </div>

        <!-- 操作提示 -->
        <div class="hint">
          <p>按 ESC 继续游戏</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { eventBus, GameEvents } from '@/utils/EventBus'

const gameStore = useGameStore()
const playerStore = usePlayerStore()

/** 恢复游戏 */
function resumeGame(): void {
  gameStore.resumeGame()
  eventBus.emit(GameEvents.GAME_RESUME)
}

/** 重新开始 */
function restartGame(): void {
  playerStore.reset()
  gameStore.goToMenu()
  // 重新加载场景
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
.pause-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}

.pause-panel {
  background: rgba(26, 26, 46, 0.95);
  border: 4px solid #00ff00;
  padding: 40px 48px;
  text-align: center;
  min-width: 280px;
  box-shadow:
    0 0 30px rgba(0, 255, 0, 0.3),
    inset 0 0 30px rgba(0, 255, 0, 0.05);
}

.pause-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 28px;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
  margin-bottom: 16px;
}

.pause-divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #00ff00, transparent);
  margin-bottom: 24px;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hint {
  margin-top: 24px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #666;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
