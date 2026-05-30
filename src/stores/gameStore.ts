/**
 * 游戏状态管理 - Pinia Store
 * 管理游戏全局状态，与 Phaser 游戏状态同步
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { GameStatus, WeaponType } from '../types/game'
import { eventBus, GameEvents } from '../utils/EventBus'

export const useGameStore = defineStore('game', () => {
  /** 游戏状态 */
  const status = ref<GameStatus>(GameStatus.MENU)
  const currentLevel = ref<number>(1)
  const isGameReady = ref<boolean>(false)

  /** 得分 */
  const score = ref<number>(0)
  const highScore = ref<number>(0)

  /** 游戏设置 */
  const soundEnabled = ref<boolean>(true)
  const musicEnabled = ref<boolean>(true)

  /** 计算属性 */
  const isPlaying = computed(() => status.value === GameStatus.PLAYING)
  const isPaused = computed(() => status.value === GameStatus.PAUSED)
  const isGameOver = computed(() => status.value === GameStatus.GAME_OVER)
  const isMenu = computed(() => status.value === GameStatus.MENU)

  /** 开始游戏 */
  function startGame(): void {
    status.value = GameStatus.PLAYING
    score.value = 0
    eventBus.emit(GameEvents.GAME_START)
  }

  /** 暂停游戏 */
  function pauseGame(): void {
    if (status.value !== GameStatus.PLAYING) return
    status.value = GameStatus.PAUSED
    eventBus.emit(GameEvents.GAME_PAUSE)
  }

  /** 恢复游戏 */
  function resumeGame(): void {
    if (status.value !== GameStatus.PAUSED) return
    status.value = GameStatus.PLAYING
    eventBus.emit(GameEvents.GAME_RESUME)
  }

  /** 游戏结束 */
  function gameOver(finalScore: number): void {
    status.value = GameStatus.GAME_OVER
    if (finalScore > highScore.value) {
      highScore.value = finalScore
      // 保存最高分到本地存储
      try {
        localStorage.setItem('contra_high_score', String(highScore.value))
      } catch {
        // 静默忽略存储错误
      }
    }
  }

  /** 返回主菜单 */
  function goToMenu(): void {
    status.value = GameStatus.MENU
  }

  /** 更新分数 */
  function updateScore(newScore: number): void {
    score.value = newScore
  }

  /** 设置游戏就绪 */
  function setGameReady(): void {
    isGameReady.value = true
  }

  /** 切换音效 */
  function toggleSound(): void {
    soundEnabled.value = !soundEnabled.value
  }

  /** 切换音乐 */
  function toggleMusic(): void {
    musicEnabled.value = !musicEnabled.value
  }

  /** 从本地存储加载最高分 */
  function loadHighScore(): void {
    try {
      const saved = localStorage.getItem('contra_high_score')
      if (saved) {
        highScore.value = parseInt(saved, 10) || 0
      }
    } catch {
      // 静默忽略
    }
  }

  // 初始化时加载最高分
  loadHighScore()

  // 监听来自 Phaser 的事件
  eventBus.on(GameEvents.UI_UPDATE_SCORE, (newScore: number) => {
    score.value = newScore
  })

  eventBus.on(GameEvents.GAME_READY, () => {
    isGameReady.value = true
  })

  eventBus.on(GameEvents.GAME_OVER, (data: { score: number }) => {
    gameOver(data.score)
  })

  return {
    // 状态
    status,
    currentLevel,
    isGameReady,
    score,
    highScore,
    soundEnabled,
    musicEnabled,

    // 计算属性
    isPlaying,
    isPaused,
    isGameOver,
    isMenu,

    // 方法
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    goToMenu,
    updateScore,
    setGameReady,
    toggleSound,
    toggleMusic,
    loadHighScore,
  }
})
