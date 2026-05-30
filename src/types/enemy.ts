/**
 * 敌人相关类型定义
 */

import { EnemyType, Direction } from './game'

/** 敌人状态 */
export enum EnemyState {
  IDLE = 'idle',
  PATROL = 'patrol',
  CHASE = 'chase',
  ATTACK = 'attack',
  HURT = 'hurt',
  DEAD = 'dead',
}

/** 敌人配置 */
export interface EnemyConfig {
  width: number
  height: number
  speed: number
  health: number
  damage: number
  score: number
  detectionRange: number
  fireRate?: number
  jumpVelocity?: number
  jumpInterval?: number
}

/** 敌人运行时状态 */
export interface EnemyRuntimeState {
  type: EnemyType
  position: { x: number; y: number }
  health: number
  state: EnemyState
  direction: Direction
  patrolRange: number
  lastFireTime: number
  lastJumpTime: number
}
