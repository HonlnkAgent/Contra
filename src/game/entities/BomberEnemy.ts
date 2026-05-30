/**
 * 自爆兵敌人 - 接触玩家后自爆的近战敌人
 * 行为模式：检测到玩家后冲向玩家，接触时造成大量伤害
 */
import { Enemy, EnemyConfigData } from './Enemy'
import { EnemyType } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { ENEMY } from '../config/GameConstants'

export class BomberEnemy extends Enemy {
  private isRushing: boolean = false
  private rushSpeed: number = ENEMY.BOMBER.SPEED * 2

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number = 150
  ) {
    const config: EnemyConfigData = {
      width: ENEMY.BOMBER.WIDTH,
      height: ENEMY.BOMBER.HEIGHT,
      speed: ENEMY.BOMBER.SPEED,
      health: ENEMY.BOMBER.HEALTH,
      damage: ENEMY.BOMBER.DAMAGE,
      score: ENEMY.BOMBER.SCORE,
      detectionRange: ENEMY.BOMBER.DETECTION_RANGE,
    }

    super(scene, x, y, 'enemy_bomber', EnemyType.BOMBER, config, patrolRange)
  }

  /**
   * 更新自爆兵状态
   * 检测到玩家后冲向玩家
   */
  update(time: number, delta: number): void {
    if (this.state === EnemyState.DEAD) return

    // 检测玩家距离
    const distanceToPlayer = this.getDistanceToPlayer()

    if (distanceToPlayer !== null && distanceToPlayer < this.detectionRange) {
      this.onPlayerDetected(distanceToPlayer)
    } else {
      this.patrol()
      this.isRushing = false
    }
  }

  /**
   * 当检测到玩家时的行为
   * @param distance 到玩家的距离
   */
  protected onPlayerDetected(distance: number): void {
    this.state = EnemyState.CHASE

    // 面向玩家
    if (this.playerSprite) {
      this.direction = this.playerSprite.x < this.sprite.x
        ? 'left'
        : 'right'
      this.sprite.setFlipX(this.direction === 'left')
    }

    // 冲向玩家
    if (distance < this.detectionRange * 0.8) {
      this.isRushing = true
      const body = this.sprite.body as Phaser.Physics.Arcade.Body
      const rushDirection = this.direction === 'right' ? 1 : -1
      body.setVelocityX(rushDirection * this.rushSpeed)
    }
  }

  /**
   * 攻击行为 - 自爆
   */
  protected attack(): void {
    this.state = EnemyState.ATTACK

    // 自爆动画
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      onComplete: () => {
        this.die()
      },
    })
  }
}