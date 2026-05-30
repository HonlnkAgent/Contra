/**
 * 子弹实体类 - 管理子弹的创建、移动和销毁
 * 使用对象池模式减少GC压力
 */
import Phaser from 'phaser'
import { Direction, WeaponType } from '../../types/game'
import { BULLET } from '../config/GameConstants'

export class Bullet {
  /** 子弹精灵 */
  readonly sprite: Phaser.Physics.Arcade.Sprite
  private scene: Phaser.Scene

  /** 子弹属性 */
  readonly damage: number
  readonly speed: number
  private direction: Direction
  private lifetime: number
  private spawnTime: number

  /** 是否为玩家子弹 */
  readonly isPlayerBullet: boolean

  /**
   * 创建子弹
   * @param scene 场景引用
   * @param x 起始X坐标
   * @param y 起始Y坐标
   * @param direction 发射方向
   * @param isPlayerBullet 是否为玩家子弹
   * @param weapon 武器类型（影响子弹属性）
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: Direction,
    isPlayerBullet: boolean = true,
    weapon: WeaponType = WeaponType.NORMAL
  ) {
    this.scene = scene
    this.direction = direction
    this.isPlayerBullet = isPlayerBullet

    // 根据来源设置子弹属性
    if (isPlayerBullet) {
      const config = BULLET.PLAYER
      this.speed = config.SPEED
      this.lifetime = config.LIFETIME

      // 根据武器类型调整伤害
      switch (weapon) {
        case WeaponType.LASER:
          this.damage = config.DAMAGE * 2
          break
        case WeaponType.SPREAD:
          this.damage = config.DAMAGE * 0.8
          break
        default:
          this.damage = config.DAMAGE
      }
    } else {
      const config = BULLET.ENEMY
      this.speed = config.SPEED
      this.damage = config.DAMAGE
      this.lifetime = config.LIFETIME
    }

    // 创建子弹精灵
    const textureKey = isPlayerBullet ? 'bullet_player' : 'bullet_enemy'
    this.sprite = scene.physics.add.sprite(x, y, textureKey)
    this.sprite.setCollideWorldBounds(false)
    this.sprite.setDepth(5)
    this.sprite.setData('entity', this)

    // 设置子弹速度
    const velocityX = direction === Direction.RIGHT ? this.speed : -this.speed
    this.sprite.body!.setVelocityX(velocityX)
    this.sprite.body!.setAllowGravity(false)

    // 根据方向翻转精灵
    this.sprite.setFlipX(direction === Direction.LEFT)

    this.spawnTime = scene.time.now
  }

  /**
   * 更新子弹状态 - 每帧调用
   * @param time 当前游戏时间
   */
  update(time: number): void {
    // 检查是否超出生命周期
    if (time - this.spawnTime > this.lifetime) {
      this.destroy()
      return
    }

    // 检查是否超出世界边界
    const x = this.sprite.x
    if (x < -50 || x > 3250) {
      this.destroy()
    }
  }

  /** 销毁子弹 */
  destroy(): void {
    if (this.sprite && this.sprite.active) {
      this.sprite.setActive(false)
      this.sprite.setVisible(false)
      this.sprite.body!.setVelocity(0, 0)
      this.sprite.destroy()
    }
  }
}
