/**
 * 火焰兵敌人 - 发射火焰子弹的远程敌人
 * 行为模式：检测到玩家后发射火焰子弹
 */
import { Enemy, EnemyConfigData } from './Enemy'
import { EnemyType, Direction } from '../../types/game'
import { ENEMY } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class FlameEnemy extends Enemy {
  private bullets: Phaser.Physics.Arcade.Group

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number = 100,
    bullets: Phaser.Physics.Arcade.Group
  ) {
    const config: EnemyConfigData = {
      width: ENEMY.FLAME.WIDTH,
      height: ENEMY.FLAME.HEIGHT,
      speed: ENEMY.FLAME.SPEED,
      health: ENEMY.FLAME.HEALTH,
      damage: ENEMY.FLAME.DAMAGE,
      score: ENEMY.FLAME.SCORE,
      detectionRange: ENEMY.FLAME.DETECTION_RANGE,
      fireRate: ENEMY.FLAME.FIRE_RATE,
    }

    super(scene, x, y, 'enemy_flame', EnemyType.FLAME, config, patrolRange)
    this.bullets = bullets
  }

  /** 攻击行为 - 发射火焰子弹 */
  protected attack(): void {
    super.attack()

    const now = this.scene.time.now
    if (now - this.lastFireTime < this.fireRate) return

    this.lastFireTime = now

    // 发射火焰子弹
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