<template>
  <div class="main-menu">
    <!-- 背景 -->
    <div class="menu-bg"></div>

    <!-- 标题 -->
    <div class="title-section">
      <h1 class="game-title">CONTRA</h1>
      <p class="game-subtitle">魂 斗 罗</p>
    </div>

    <!-- 菜单选项 -->
    <div class="menu-options">
      <button class="btn-contra" @click="startGame">
        START GAME
      </button>
      <button class="btn-contra opacity-70" @click="toggleSettings">
        SETTINGS
      </button>
    </div>

    <!-- 操作提示 -->
    <div class="controls-hint">
      <p>操作说明：</p>
      <p>← → 移动 | SPACE 跳跃 | Z 射击 | ESC 暂停</p>
    </div>

    <!-- 最高分 -->
    <div class="high-score" v-if="gameStore.highScore > 0">
      HI-SCORE: {{ gameStore.highScore }}
    </div>

    <!-- 设置面板 -->
    <div v-if="showSettings" class="settings-panel">
      <h3 class="settings-title">SETTINGS</h3>
      <div class="setting-item">
        <span>音效</span>
        <button
          class="toggle-btn"
          :class="{ active: gameStore.soundEnabled }"
          @click="gameStore.toggleSound()"
        >
          {{ gameStore.soundEnabled ? 'ON' : 'OFF' }}
        </button>
      </div>
      <div class="setting-item">
        <span>音乐</span>
        <button
          class="toggle-btn"
          :class="{ active: gameStore.musicEnabled }"
          @click="gameStore.toggleMusic()"
        >
          {{ gameStore.musicEnabled ? 'ON' : 'OFF' }}
        </button>
      </div>
      <button class="btn-contra mt-4" @click="toggleSettings">CLOSE</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()
const showSettings = ref(false)

/** 开始游戏 */
function startGame(): void {
  gameStore.startGame()
  router.push('/game')
}

/** 切换设置面板 */
function toggleSettings(): void {
  showSettings.value = !showSettings.value
}
</script>

<style scoped>
.main-menu {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.menu-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  z-index: -1;
}

/* 背景扫描线效果 */
.menu-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.03) 2px,
    rgba(0, 255, 0, 0.03) 4px
  );
}

.title-section {
  text-align: center;
  margin-bottom: 48px;
}

.game-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 64px;
  color: #ff6600;
  text-shadow:
    0 0 20px rgba(255, 102, 0, 0.8),
    0 0 40px rgba(255, 102, 0, 0.4),
    4px 4px 0 #882200;
  letter-spacing: 8px;
  animation: titlePulse 2s ease-in-out infinite;
}

.game-subtitle {
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
  margin-top: 12px;
  letter-spacing: 16px;
}

@keyframes titlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.controls-hint {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #666;
  text-align: center;
  line-height: 2;
}

.high-score {
  position: absolute;
  bottom: 20px;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffcc00;
}

.settings-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #00ff00;
  padding: 32px;
  min-width: 300px;
}

.settings-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #00ff00;
  text-align: center;
  margin-bottom: 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ccc;
}

.toggle-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  padding: 4px 12px;
  border: 2px solid #666;
  background: transparent;
  color: #666;
  cursor: pointer;
}

.toggle-btn.active {
  border-color: #00ff00;
  color: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}
</style>
