/**
 * BOSS 基类 - 所有 BOSS 类型的基类
 * 继承自 Enemy，增加了血条显示和特殊攻击模式
 */
import Phaser from 'phaser'
import { Enemy, EnemyConfigData } from './Enemy'
import { BossType, Direction, EnemyType } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { eventBus, GameEvents } from '../../utils/EventBus'

/** BOSS 配置接口 */
export interface BossConfigData extends EnemyConfigData {
  bossType: BossType
}

export abstract class Boss extends Enemy {
  /** BOSS 类型 */
  readonly bossType: BossType

  /** 血条 */
  protected healthBar: Phaser.GameObjects.Graphics
  protected healthBarWidth: number = 200
  protected healthBarHeight: number = 12
  protected healthBarBg: Phaser.GameObjects.Graphics

  /** BOSS 状态 */
  protected isActive: boolean = false
  protected phaseIndex: number = 0

  /**
   * @param scene 场景引用
   * @param x 初始 X 坐标
   * @param y 初始 Y 坐标
   * @param textureKey 纹理键名
   * @param bossType BOSS 类型
   * @param config BOSS 配置
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    bossType: BossType,
    config: BossConfigData
  ) {
    // BOSS 使用 EnemyType.SOLDIER 作为 type 参数（BOSS 不参与普通敌人类型系统）
    super(scene, x, y, textureKey, EnemyType.SOLDIER, config, 0)
    this.bossType = bossType

    // BOSS 使用更大的碰撞体
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(config.width, config.height)

    // 创建血条
    this.healthBarBg = scene.add.graphics()
    this.healthBar = scene.add.graphics()
    this.updateHealthBar()
  }

  /**
   * 更新 BOSS 状态
   * BOSS 始终检测玩家并攻击
   */
  update(time: number, delta: number): void {
    if (this.state === EnemyState.DEAD) return

    this.isActive = true

    // 更新血条位置
    this.updateHealthBarPosition()

    // BOSS 始终攻击（不需要检测范围）
    this.attack()
  }

  /** 创建并更新血条 */
  protected updateHealthBar(): void {
    const barX = this.sprite.x - this.healthBarWidth / 2
    const barY = this.sprite.y - 40

    // 清除旧血条
    this.healthBarBg.clear()
    this.healthBar.clear()

    // 绘制背景（黑色边框）
    this.healthBarBg.fillStyle(0x000000, 0.8)
    this.healthBarBg.fillRect(barX - 1, barY - 1, this.healthBarWidth + 2, this.healthBarHeight + 2)

    // 绘制血量
    const healthPercent = this.health / this.maxHealth
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000

    this.healthBar.fillStyle(healthColor, 1)
    this.healthBar.fillRect(barX, barY, this.healthBarWidth * healthPercent, this.healthBarHeight)

    this.healthBarBg.setDepth(20)
    this.healthBar.setDepth(21)
  }

  /** 更新血条位置跟随 BOSS */
  protected updateHealthBarPosition(): void {
    this.updateHealthBar()
  }

  /**
   * 受到伤害 - 重写以更新血条
   */
  takeDamage(amount: number): void {
    if (this.state === EnemyState.DEAD) return

    this.health -= amount
    this.updateHealthBar()

    // 受伤闪白效果
    this.sprite.setTint(0xffffff)
    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) {
        this.sprite.clearTint()
      }
    })

    // 发送 BOSS 血量更新事件
    eventBus.emit(GameEvents.UI_UPDATE_BOSS_HEALTH, {
      health: this.health,
      maxHealth: this.maxHealth,
      bossType: this.bossType,
    })

    if (this.health <= 0) {
      this.die()
    } else {
      this.state = EnemyState.HURT
    }
  }

  /** BOSS 死亡 - 重写以清理血条 */
  die(): void {
    this.state = EnemyState.DEAD
    this.isActive = false

    // 清理血条
    if (this.healthBarBg) this.healthBarBg.destroy()
    if (this.healthBar) this.healthBar.destroy()

    // 发送死亡事件（BOSS 奖励更高分数）
    eventBus.emit(GameEvents.ENEMY_DEATH, {
      x: this.sprite.x,
      y: this.sprite.y,
      score: this.score,
      type: this.bossType,
      isBoss: true,
    })

    // BOSS 死亡动画（更大爆炸效果）
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 800,
      onComplete: () => {
        this.sprite.destroy()
      },
    })
  }

  /**
   * 特殊攻击模式 - 由子类实现
   */
  protected abstract specialAttack(): void

  /**
   * 攻击行为 - 基类实现，子类可覆盖
   */
  protected attack(): void {
    this.state = EnemyState.ATTACK
  }

  /**
   * 面向玩家
   */
  protected facePlayer(): void {
    if (this.playerSprite && this.playerSprite.active) {
      this.direction = this.playerSprite.x < this.sprite.x
        ? Direction.LEFT
        : Direction.RIGHT
      this.sprite.setFlipX(this.direction === Direction.LEFT)
    }
  }

  /**
   * 获取到玩家的方向向量
   * @returns 归一化方向向量或 null
   */
  protected getDirectionToPlayer(): { x: number; y: number } | null {
    if (!this.playerSprite || !this.playerSprite.active) return null

    const dx = this.playerSprite.x - this.sprite.x
    const dy = this.playerSprite.y - this.sprite.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist === 0) return { x: 0, y: 0 }

    return { x: dx / dist, y: dy / dist }
  }

  /** 销毁 BOSS（包含血条清理） */
  destroy(): void {
    if (this.healthBarBg) this.healthBarBg.destroy()
    if (this.healthBar) this.healthBar.destroy()
    super.destroy()
  }
}
