/**
 * 飞行兵敌人 - 在空中飞行的远程敌人
 * 行为模式：在空中飞行，检测到玩家后发射子弹
 */
import { Enemy, EnemyConfigData } from './Enemy'
import { EnemyType, Direction } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { ENEMY } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class FlyerEnemy extends Enemy {
  private bullets: Phaser.Physics.Arcade.Group
  private flyHeight: number = 200 // 飞行高度
  private flyDirection: number = 1 // 1 向右，-1 向左
  private flySpeed: number = ENEMY.FLYER.SPEED * 0.8

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number = 200,
    bullets: Phaser.Physics.Arcade.Group
  ) {
    const config: EnemyConfigData = {
      width: ENEMY.FLYER.WIDTH,
      height: ENEMY.FLYER.HEIGHT,
      speed: ENEMY.FLYER.SPEED,
      health: ENEMY.FLYER.HEALTH,
      damage: ENEMY.FLYER.DAMAGE,
      score: ENEMY.FLYER.SCORE,
      detectionRange: ENEMY.FLYER.DETECTION_RANGE,
      fireRate: ENEMY.FLYER.FIRE_RATE,
    }

    super(scene, x, y, 'enemy_flyer', EnemyType.FLYER, config, patrolRange)
    this.bullets = bullets

    // 禁用重力，让飞行兵在空中
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setGravityY(0)
    body.setAllowGravity(false)

    // 设置初始飞行高度
    this.sprite.setY(y - this.flyHeight)
  }

  /**
   * 更新飞行兵状态
   * 在空中飞行并射击
   */
  update(time: number, delta: number): void {
    if (this.state === EnemyState.DEAD) return

    // 飞行行为
    this.fly(time)

    // 检测玩家距离
    const distanceToPlayer = this.getDistanceToPlayer()

    if (distanceToPlayer !== null && distanceToPlayer < this.detectionRange) {
      this.onPlayerDetected(distanceToPlayer)
    } else {
      this.state = EnemyState.PATROL
    }
  }

  /**
   * 飞行行为
   * @param time 当前时间
   */
  private fly(time: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body

    // 水平飞行
    body.setVelocityX(this.flyDirection * this.flySpeed)

    // 垂直浮动
    const floatOffset = Math.sin(time * 0.002) * 20
    const targetY = this.patrolStartX - this.flyHeight + floatOffset
    body.setVelocityY((targetY - this.sprite.y) * 0.1)

    // 边界检测
    const distFromStart = this.sprite.x - this.patrolStartX
    if (Math.abs(distFromStart) >= this.patrolRange) {
      this.flyDirection *= -1
      this.sprite.setFlipX(this.flyDirection < 0)
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

    // 在攻击范围内时攻击
    if (distance < this.detectionRange * 0.6) {
      this.attack()
    }
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
      this.sprite.y,
      this.direction,
      false
    )

    this.bullets.add(bullet.sprite)
    bullet.activate()  // 激活子弹，设置速度
    eventBus.emit(GameEvents.ENEMY_SHOOT, {
      x: this.sprite.x + offsetX,
      y: this.sprite.y,
      direction: this.direction,
    })
  }
}