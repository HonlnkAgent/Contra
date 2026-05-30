/**
 * 游戏常量配置
 * 包含游戏中使用的所有常量定义
 */

/** 游戏画面尺寸 */
export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600

/** 物理世界边界 */
export const WORLD_WIDTH = 3200
export const WORLD_HEIGHT = 600

/** 玩家相关常量 */
export const PLAYER = {
  WIDTH: 32,
  HEIGHT: 48,
  SPEED: 200,
  JUMP_VELOCITY: -450,
  GRAVITY: 900,
  MAX_HEALTH: 100,
  INITIAL_LIVES: 3,
  INVINCIBLE_DURATION: 2000,
  FIRE_RATE: 200,
  BULLET_SPEED: 500,
  BULLET_DAMAGE: 25,
} as const

/** 敌人相关常量 */
export const ENEMY = {
  SOLDIER: {
    WIDTH: 32,
    HEIGHT: 48,
    SPEED: 80,
    HEALTH: 50,
    DAMAGE: 10,
    SCORE: 100,
    FIRE_RATE: 2000,
    DETECTION_RANGE: 300,
  },
  MACHINE_GUNNER: {
    WIDTH: 32,
    HEIGHT: 48,
    SPEED: 50,
    HEALTH: 80,
    DAMAGE: 15,
    SCORE: 200,
    FIRE_RATE: 800,
    DETECTION_RANGE: 400,
  },
  JUMPER: {
    WIDTH: 32,
    HEIGHT: 48,
    SPEED: 120,
    HEALTH: 40,
    DAMAGE: 20,
    SCORE: 150,
    JUMP_VELOCITY: -500,
    JUMP_INTERVAL: 1500,
    DETECTION_RANGE: 250,
  },
} as const

/** 子弹相关常量 */
export const BULLET = {
  PLAYER: {
    WIDTH: 8,
    HEIGHT: 4,
    SPEED: 500,
    DAMAGE: 25,
    LIFETIME: 2000,
  },
  ENEMY: {
    WIDTH: 6,
    HEIGHT: 4,
    SPEED: 300,
    DAMAGE: 10,
    LIFETIME: 3000,
  },
} as const

/** 道具相关常量 */
export const POWER_UP = {
  WIDTH: 24,
  HEIGHT: 24,
  SPAWN_CHANCE: 0.3,
  TYPES: {
    RAPID_FIRE: { fireRateMultiplier: 0.5, label: '速射' },
    SPREAD: { bulletCount: 3, label: '散弹' },
    LASER: { damage: 50, width: 8, label: '激光' },
    LIFE: { lives: 1, label: '1UP' },
    SHIELD: { duration: 5000, label: '护盾' },
  },
} as const

/** 颜色常量 (用于临时精灵) */
export const COLORS = {
  PLAYER: 0x4488ff,
  PLAYER_BULLET: 0xffff00,
  ENEMY_SOLDIER: 0xff4444,
  ENEMY_MACHINE_GUNNER: 0xff8800,
  ENEMY_JUMPER: 0xff00ff,
  ENEMY_BULLET: 0xff6600,
  POWER_UP_RAPID: 0x00ffaa,
  POWER_UP_SPREAD: 0xaaff00,
  POWER_UP_LASER: 0xff00ff,
  POWER_UP_LIFE: 0xff6699,
  POWER_UP_SHIELD: 0x66ccff,
  PLATFORM: 0x666666,
  BACKGROUND_SKY: 0x1a1a2e,
  BACKGROUND_GROUND: 0x3d2b1f,
} as const

/** 关卡相关常量 */
export const LEVEL = {
  TILE_SIZE: 32,
  PLATFORM_HEIGHT: 32,
  SCROLL_SPEED: 0,
} as const

/** 音频相关常量 */
export const AUDIO = {
  MUSIC_VOLUME: 0.5,
  SFX_VOLUME: 0.7,
  FADE_DURATION: 1000,
} as const
