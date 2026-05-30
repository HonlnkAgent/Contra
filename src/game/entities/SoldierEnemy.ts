/**
 * 步兵敌人 - 基础敌人类型
 * 行为模式：巡逻、检测到玩家后射击
 */
import { Enemy, EnemyConfigData } from './Enemy'
import { EnemyType, Direction } from '../../types/game'
import { ENEMY } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class SoldierEnemy extends Enemy {
  private bullets: Phaser.Physics.Arcade.Group

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number = 100,
    bullets: Phaser.Physics.Arcade.Group
  ) {
    const config: EnemyConfigData = {
      width: ENEMY.SOLDIER.WIDTH,
      height: ENEMY.SOLDIER.HEIGHT,
      speed: ENEMY.SOLDIER.SPEED,
      health: ENEMY.SOLDIER.HEALTH,
      damage: ENEMY.SOLDIER.DAMAGE,
      score: ENEMY.SOLDIER.SCORE,
      detectionRange: ENEMY.SOLDIER.DETECTION_RANGE,
      fireRate: ENEMY.SOLDIER.FIRE_RATE,
    }

    super(scene, x, y, 'enemy_soldier', EnemyType.SOLDIER, config, patrolRange)
    this.bullets = bullets
  }

  /** 攻击行为 - 检测到玩家后射击 */
  protected attack(): void {
    super.attack()

    const now = this.scene.time.now
    if (now - this.lastFireTime < this.fireRate) return

    this.lastFireTime = now

    // 发射子弹
    const offsetX = this.direction === Direction.RIGHT ? 20 : -20
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
