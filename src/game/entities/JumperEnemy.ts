/**
 * 跳跃兵敌人 - 高机动性近战敌人
 * 行为模式：不断跳跃接近玩家，造成接触伤害
 */
import { Enemy, EnemyConfigData } from './Enemy'
import { EnemyType } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { ENEMY } from '../config/GameConstants'

export class JumperEnemy extends Enemy {
  private jumpInterval: number
  private jumpVelocity: number
  private lastJumpTime: number = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number = 150
  ) {
    const config: EnemyConfigData = {
      width: ENEMY.JUMPER.WIDTH,
      height: ENEMY.JUMPER.HEIGHT,
      speed: ENEMY.JUMPER.SPEED,
      health: ENEMY.JUMPER.HEALTH,
      damage: ENEMY.JUMPER.DAMAGE,
      score: ENEMY.JUMPER.SCORE,
      detectionRange: ENEMY.JUMPER.DETECTION_RANGE,
      jumpVelocity: ENEMY.JUMPER.JUMP_VELOCITY,
      jumpInterval: ENEMY.JUMPER.JUMP_INTERVAL,
    }

    super(scene, x, y, 'enemy_jumper', EnemyType.JUMPER, config, patrolRange)
    this.jumpVelocity = config.jumpVelocity || ENEMY.JUMPER.JUMP_VELOCITY
    this.jumpInterval = config.jumpInterval || ENEMY.JUMPER.JUMP_INTERVAL
  }

  /**
   * 更新跳跃兵状态
   * 在基础巡逻逻辑上增加跳跃行为
   */
  update(time: number, delta: number): void {
    if (this.state === EnemyState.DEAD) return

    super.update(time, delta)

    // 检查是否可以跳跃
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down || body.touching.down

    if (onGround && time - this.lastJumpTime > this.jumpInterval) {
      this.lastJumpTime = time
      body.setVelocityY(this.jumpVelocity)
    }
  }

  /**
   * 检测到玩家后加速跳跃
   * @param distance 到玩家的距离
   */
  protected onPlayerDetected(distance: number): void {
    super.onPlayerDetected(distance)

    // 靠近玩家时加速
    if (distance < this.detectionRange * 0.5) {
      this.speed = ENEMY.JUMPER.SPEED * 1.5
      this.jumpInterval = ENEMY.JUMPER.JUMP_INTERVAL * 0.6
    } else {
      this.speed = ENEMY.JUMPER.SPEED
      this.jumpInterval = ENEMY.JUMPER.JUMP_INTERVAL
    }
  }
}
