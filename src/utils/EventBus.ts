/**
 * 事件总线 - 用于 Vue 和 Phaser 之间的通信
 * 实现发布-订阅模式，支持事件的注册、触发和移除
 */
import Phaser from 'phaser'

class EventBus extends Phaser.Events.EventEmitter {
  private static instance: EventBus

  private constructor() {
    super()
  }

  /** 获取 EventBus 单例 */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }
}

export const eventBus = EventBus.getInstance()

/** 游戏事件常量 */
export const GameEvents = {
  // 玩家事件
  PLAYER_MOVE: 'player:move',
  PLAYER_JUMP: 'player:jump',
  PLAYER_SHOOT: 'player:shoot',
  PLAYER_HURT: 'player:hurt',
  PLAYER_DEATH: 'player:death',
  PLAYER_RESPAWN: 'player:respawn',

  // 敌人事件
  ENEMY_SPAWN: 'enemy:spawn',
  ENEMY_DEATH: 'enemy:death',
  ENEMY_SHOOT: 'enemy:shoot',

  // 道具事件
  ITEM_SPAWN: 'item:spawn',
  ITEM_COLLECT: 'item:collect',

  // 游戏事件
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  LEVEL_START: 'level:start',

  // UI 事件
  UI_UPDATE_SCORE: 'ui:updateScore',
  UI_UPDATE_HEALTH: 'ui:updateHealth',
  UI_UPDATE_LIVES: 'ui:updateLives',
  UI_UPDATE_WEAPON: 'ui:updateWeapon',
  UI_UPDATE_BOSS_HEALTH: 'ui:updateBossHealth',

  // 游戏引擎就绪
  GAME_READY: 'game:ready',
} as const

export type GameEventType = (typeof GameEvents)[keyof typeof GameEvents]
