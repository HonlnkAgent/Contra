/**
 * 道具实体类 - 可拾取的增强道具
 * 包括：速射、散弹、激光、1UP、护盾
 */
import Phaser from 'phaser'
import { PowerUpType, WeaponType } from '../../types/game'
import { POWER_UP } from '../config/GameConstants'
import { Player } from './Player'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class PowerUp {
  /** 道具精灵 */
  readonly sprite: Phaser.Physics.Arcade.Sprite
  private scene: Phaser.Scene
  readonly type: PowerUpType

  /** 浮动动画 */
  private floatTween: Phaser.Tweens.Tween | null = null

  /**
   * @param scene 场景引用
   * @param x X坐标
   * @param y Y坐标
   * @param type 道具类型
   */
  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    this.scene = scene
    this.type = type

    // 根据类型选择纹理
    const textureKey = this.getTextureKey(type)

    // 创建精灵
    this.sprite = scene.physics.add.sprite(x, y, textureKey)
    this.sprite.setDepth(7)
    this.sprite.setData('entity', this)

    // 设置物理属性（不受重力影响，悬浮在空中）
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setImmovable(true)

    // 上下浮动动画
    this.floatTween = scene.tweens.add({
      targets: this.sprite,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // 发送道具生成事件
    eventBus.emit(GameEvents.ITEM_SPAWN, { x, y, type })
  }

  /** 根据道具类型获取纹理键名 */
  private getTextureKey(type: PowerUpType): string {
    switch (type) {
      case PowerUpType.RAPID_FIRE:
        return 'powerup_rapid'
      case PowerUpType.SPREAD:
        return 'powerup_spread'
      case PowerUpType.LASER:
        return 'powerup_laser'
      case PowerUpType.LIFE:
        return 'powerup_life'
      case PowerUpType.SHIELD:
        return 'powerup_shield'
      default:
        return 'powerup_rapid'
    }
  }

  /**
   * 玩家拾取道具
   * @param player 玩家实例
   */
  collect(player: Player): void {
    switch (this.type) {
      case PowerUpType.RAPID_FIRE:
        player.setWeapon(WeaponType.RAPID_FIRE)
        break
      case PowerUpType.SPREAD:
        player.setWeapon(WeaponType.SPREAD)
        break
      case PowerUpType.LASER:
        player.setWeapon(WeaponType.LASER)
        break
      case PowerUpType.LIFE:
        player.addLife()
        break
      case PowerUpType.SHIELD:
        player.heal(100)
        break
    }

    // 发送拾取事件
    eventBus.emit(GameEvents.ITEM_COLLECT, {
      type: this.type,
      x: this.sprite.x,
      y: this.sprite.y,
    })

    // 拾取效果动画
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      y: this.sprite.y - 30,
      duration: 300,
      onComplete: () => {
        this.destroy()
      },
    })
  }

  /** 销毁道具 */
  destroy(): void {
    if (this.floatTween) {
      this.floatTween.destroy()
    }
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy()
    }
  }
}
