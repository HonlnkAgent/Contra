/**
 * 游戏相关类型定义
 */

/** 方向枚举 */
export enum Direction {
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
  DOWN = 'down',
}

/** 游戏状态 */
export enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameover',
}

/** 武器类型 */
export enum WeaponType {
  NORMAL = 'normal',
  RAPID_FIRE = 'rapid_fire',
  SPREAD = 'spread',
  LASER = 'laser',
}

/** 道具类型 */
export enum PowerUpType {
  RAPID_FIRE = 'rapid_fire',
  SPREAD = 'spread',
  LASER = 'laser',
  LIFE = 'life',
  SHIELD = 'shield',
}

/** 敌人类型 */
export enum EnemyType {
  SOLDIER = 'soldier',
  MACHINE_GUNNER = 'machine_gunner',
  JUMPER = 'jumper',
}

/** 游戏配置接口 */
export interface GameConfigData {
  width: number
  height: number
  worldWidth: number
  worldHeight: number
  backgroundColor: string
  physics: {
    gravity: number
    debug: boolean
  }
}

/** 二维坐标 */
export interface Vector2 {
  x: number
  y: number
}

/** 矩形区域 */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** 关卡数据结构 */
export interface LevelData {
  id: number
  name: string
  width: number
  height: number
  playerStart: Vector2
  platforms: PlatformData[]
  enemies: EnemySpawnData[]
  powerUps: PowerUpSpawnData[]
  boss: BossData | null
  background: BackgroundData
}

/** 平台数据 */
export interface PlatformData {
  x: number
  y: number
  width: number
  height: number
  type?: 'static' | 'moving'
  moveRange?: { minX: number; maxX: number; minY: number; maxY: number }
  moveSpeed?: number
}

/** 敌人生成数据 */
export interface EnemySpawnData {
  type: EnemyType
  x: number
  y: number
  patrolRange?: number
  direction?: Direction
}

/** 道具生成数据 */
export interface PowerUpSpawnData {
  type: PowerUpType
  x: number
  y: number
}

/** Boss 数据 */
export interface BossData {
  x: number
  y: number
  health: number
  phases: BossPhaseData[]
}

/** Boss 阶段数据 */
export interface BossPhaseData {
  healthThreshold: number
  attackPattern: string
  speed: number
}

/** 背景数据 */
export interface BackgroundData {
  layers: BackgroundLayerData[]
}

/** 背景层数据 */
export interface BackgroundLayerData {
  type: 'color' | 'gradient' | 'parallax'
  color?: number
  colors?: { top: number; bottom: number }
  scrollFactor?: number
}
