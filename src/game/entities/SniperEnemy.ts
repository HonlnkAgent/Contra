/**
 * 狙击手敌人 - 高伤害远程敌人
 * 行为模式：检测到玩家后发射高伤害子弹，射击间隔长
 */
import { Enemy, EnemyConfigData } from './Enemy'
import { EnemyType, Direction } from '../../types/game'
import { ENEMY } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class SniperEnemy extends Enemy {
  private bullets: Phaser.Physics.Arcade.Group

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number = 80,
    bullets: Phaser.Physics.Arcade.Group
  ) {
    const config: EnemyConfigData = {
      width: ENEMY.SNIPER.WIDTH,
      height: ENEMY.SNIPER.HEIGHT,
      speed: ENEMY.SNIPER.SPEED,
      health: ENEMY.SNIPER.HEALTH,
      damage: ENEMY.SNIPER.DAMAGE,
      score: ENEMY.SNIPER.SCORE,
      detectionRange: ENEMY.SNIPER.DETECTION_RANGE,
      fireRate: ENEMY.SNIPER.FIRE_RATE,
    }

    super(scene, x, y, 'enemy_sniper', EnemyType.SNIPER, config, patrolRange)
    this.bullets = bullets
  }

  /** 攻击行为 - 发射高伤害子弹 */
  protected attack(): void {
    super.attack()

    const now = this.scene.time.now
    if (now - this.lastFireTime < this.fireRate) return

    this.lastFireTime = now

    // 发射高伤害子弹
    const offsetX = this.direction === Direction.RIGHT ? 24 : -24
    const bullet = new Bullet(
      this.scene,
      this.sprite.x + offsetX,
      this.sprite.y - 4,
      this.direction,
      false
    )

    this.bullets.add(bullet.sprite)
    eventBus.emit(GameEvents.ENEMY_SHOOT, {
      x: this.sprite.x + offsetX,
      y: this.sprite.y - 4,
      direction: this.direction,
    })
  }
}