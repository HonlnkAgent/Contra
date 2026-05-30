/**
 * 盾牌兵敌人 - 高血量、慢速的防御型敌人
 * 行为模式：缓慢移动，检测到玩家后发射子弹
 */
import { Enemy, EnemyConfigData } from './Enemy'
import { EnemyType, Direction } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { ENEMY } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class ShieldEnemy extends Enemy {
  private bullets: Phaser.Physics.Arcade.Group
  private shieldActive: boolean = true
  private shieldHealth: number = 50 // 护盾额外血量

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number = 100,
    bullets: Phaser.Physics.Arcade.Group
  ) {
    const config: EnemyConfigData = {
      width: ENEMY.SHIELD.WIDTH,
      height: ENEMY.SHIELD.HEIGHT,
      speed: ENEMY.SHIELD.SPEED,
      health: ENEMY.SHIELD.HEALTH,
      damage: ENEMY.SHIELD.DAMAGE,
      score: ENEMY.SHIELD.SCORE,
      detectionRange: ENEMY.SHIELD.DETECTION_RANGE,
      fireRate: ENEMY.SHIELD.FIRE_RATE,
    }

    super(scene, x, y, 'enemy_shield', EnemyType.SHIELD, config, patrolRange)
    this.bullets = bullets
  }

  /**
   * 受到伤害
   * @param amount 伤害值
   */
  takeDamage(amount: number): void {
    if (this.state === EnemyState.DEAD) return

    // 如果护盾激活，先消耗护盾
    if (this.shieldActive && this.shieldHealth > 0) {
      this.shieldHealth -= amount
      if (this.shieldHealth <= 0) {
        this.shieldActive = false
        // 护盾破碎效果
        this.sprite.setTint(0xffffff)
        this.scene.time.delayedCall(200, () => {
          if (this.sprite.active) {
            this.sprite.clearTint()
          }
        })
      }
      return
    }

    // 护盾破碎后受到正常伤害
    super.takeDamage(amount)
  }

  /** 攻击行为 - 发射子弹 */
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