/**
 * 玩家相关类型定义
 */

import { Direction, WeaponType } from './game'

/** 玩家状态 */
export enum PlayerState {
  IDLE = 'idle',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling',
  SHOOTING = 'shooting',
  DEAD = 'dead',
}

/** 玩家配置 */
export interface PlayerConfig {
  speed: number
  jumpVelocity: number
  maxHealth: number
  initialLives: number
  invincibleDuration: number
  fireRate: number
}

/** 玩家运行时状态 */
export interface PlayerRuntimeState {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  health: number
  lives: number
  weapon: WeaponType
  score: number
  state: PlayerState
  direction: Direction
  isInvincible: boolean
  isOnGround: boolean
  lastFireTime: number
}
