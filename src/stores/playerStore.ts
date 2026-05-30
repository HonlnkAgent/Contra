/**
 * 玩家状态管理 - Pinia Store
 * 管理玩家的UI显示状态，与 Phaser 玩家状态同步
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { WeaponType } from '../types/game'
import { PLAYER } from '../game/config/GameConstants'
import { eventBus, GameEvents } from '../utils/EventBus'

export const usePlayerStore = defineStore('player', () => {
  /** 玩家状态 */
  const health = ref<number>(PLAYER.MAX_HEALTH)
  const maxHealth = ref<number>(PLAYER.MAX_HEALTH)
  const lives = ref<number>(PLAYER.INITIAL_LIVES)
  const weapon = ref<WeaponType>(WeaponType.NORMAL)
  const score = ref<number>(0)
  const isInvincible = ref<boolean>(false)

  /** 武器显示名映射 */
  const weaponLabels: Record<WeaponType, string> = {
    [WeaponType.NORMAL]: '普通',
    [WeaponType.RAPID_FIRE]: '速射',
    [WeaponType.SPREAD]: '散弹',
    [WeaponType.LASER]: '激光',
  }

  /** 获取当前武器名称 */
  function getWeaponLabel(): string {
    return weaponLabels[weapon.value] || '普通'
  }

  /** 重置玩家状态 */
  function reset(): void {
    health.value = PLAYER.MAX_HEALTH
    lives.value = PLAYER.INITIAL_LIVES
    weapon.value = WeaponType.NORMAL
    score.value = 0
    isInvincible.value = false
  }

  // 监听来自 Phaser 的事件
  eventBus.on(GameEvents.UI_UPDATE_HEALTH, (newHealth: number) => {
    health.value = newHealth
  })

  eventBus.on(GameEvents.UI_UPDATE_LIVES, (newLives: number) => {
    lives.value = newLives
  })

  eventBus.on(GameEvents.UI_UPDATE_WEAPON, (newWeapon: WeaponType) => {
    weapon.value = newWeapon
  })

  eventBus.on(GameEvents.UI_UPDATE_SCORE, (newScore: number) => {
    score.value = newScore
  })

  eventBus.on(GameEvents.PLAYER_RESPAWN, () => {
    health.value = PLAYER.MAX_HEALTH
    weapon.value = WeaponType.NORMAL
  })

  return {
    health,
    maxHealth,
    lives,
    weapon,
    score,
    isInvincible,
    getWeaponLabel,
    reset,
  }
})
