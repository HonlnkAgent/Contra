/**
 * 敌人基类 - 所有敌人类型的基类
 * 定义敌人的通用行为：巡逻、检测玩家、受伤、死亡
 */
import Phaser from 'phaser'
import { Direction, EnemyType } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { eventBus, GameEvents } from '../../utils/EventBus'

/** 敌人配置接口 */
export interface EnemyConfigData {
  width: number
  height: number
  speed: number
  health: number
  damage: number
  score: number
  detectionRange: number
  fireRate?: number
  jumpVelocity?: number
  jumpInterval?: number
}

export class Enemy {
  /** 敌人精灵 */
  readonly sprite: Phaser.Physics.Arcade.Sprite
  protected scene: Phaser.Scene

  /** 敌人属性 */
  readonly type: EnemyType
  health: number
  protected maxHealth: number
  protected speed: number
  readonly damage: number
  readonly score: number
  protected detectionRange: number
  protected fireRate: number

  /** 状态管理 */
  state: EnemyState = EnemyState.PATROL
  direction: Direction = Direction.LEFT

  /** 巡逻控制 */
  protected patrolStartX: number
  protected patrolRange: number

  /** 射击控制 */
  protected lastFireTime: number = 0

  /** 玩家引用（用于检测距离） */
  protected playerSprite: Phaser.Physics.Arcade.Sprite | null = null

  /**
   * @param scene 场景引用
   * @param x 初始X坐标
   * @param y 初始Y坐标
   * @param textureKey 纹理键名
   * @param type 敌人类型
   * @param config 敌人配置
   * @param patrolRange 巡逻范围
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    type: EnemyType,
    config: EnemyConfigData,
    patrolRange: number = 100
  ) {
    this.scene = scene
    this.type = type
    this.health = config.health
    this.maxHealth = config.health
    this.speed = config.speed
    this.damage = config.damage
    this.score = config.score
    this.detectionRange = config.detectionRange
    this.fireRate = config.fireRate || 2000
    this.patrolStartX = x
    this.patrolRange = patrolRange

    // 创建精灵
    this.sprite = scene.physics.add.sprite(x, y, textureKey)
    this.sprite.setCollideWorldBounds(true)
    this.sprite.setBounce(0)
    this.sprite.setDepth(8)
    this.sprite.setData('entity', this)

    // 设置物理属性
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setGravityY(600)
  }

  /**
   * 设置玩家引用
   * @param player 玩家精灵
   */
  setPlayerRef(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerSprite = player
  }

  /**
   * 更新敌人状态 - 每帧调用
   * @param time 当前游戏时间
   * @param delta 帧间隔时间
   */
  update(time: number, _delta: number): void {
    if (this.state === EnemyState.DEAD) return

    // 检测玩家距离
    const distanceToPlayer = this.getDistanceToPlayer()

    if (distanceToPlayer !== null && distanceToPlayer < this.detectionRange) {
      this.onPlayerDetected(distanceToPlayer)
    } else {
      this.patrol()
    }
  }

  /** 巡逻行为 - 在起始点附近来回移动 */
  protected patrol(): void {
    this.state = EnemyState.PATROL
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down || body.touching.down

    if (!onGround) return

    // 判断是否超出巡逻范围
    const distFromStart = this.sprite.x - this.patrolStartX

    if (Math.abs(distFromStart) >= this.patrolRange) {
      // 转向
      this.direction = distFromStart > 0 ? Direction.LEFT : Direction.RIGHT
    }

    // 移动
    const velocityX = this.direction === Direction.RIGHT ? this.speed : -this.speed
    body.setVelocityX(velocityX)
    this.sprite.setFlipX(this.direction === Direction.LEFT)
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
        ? Direction.LEFT
        : Direction.RIGHT
      this.sprite.setFlipX(this.direction === Direction.LEFT)
    }

    // 在攻击范围内时攻击
    if (distance < this.detectionRange * 0.6) {
      this.attack()
    }
  }

  /** 攻击行为 - 基础类不射击，由子类覆盖 */
  protected attack(): void {
    this.state = EnemyState.ATTACK
    // 基类只停止移动
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocityX(0)
  }

  /**
   * 受到伤害
   * @param amount 伤害值
   */
  takeDamage(amount: number): void {
    if (this.state === EnemyState.DEAD) return

    this.health -= amount

    // 受伤闪白效果
    this.sprite.setTint(0xffffff)
    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) {
        this.sprite.clearTint()
      }
    })

    if (this.health <= 0) {
      this.die()
    } else {
      this.state = EnemyState.HURT
      // 击退效果
      const knockbackDir = this.direction === Direction.RIGHT ? -1 : 1
      const body = this.sprite.body as Phaser.Physics.Arcade.Body
      body.setVelocity(knockbackDir * 100, -100)
    }
  }

  /** 敌人死亡 */
  die(): void {
    this.state = EnemyState.DEAD

    // 发送死亡事件
    eventBus.emit(GameEvents.ENEMY_DEATH, {
      x: this.sprite.x,
      y: this.sprite.y,
      score: this.score,
      type: this.type,
    })

    // 死亡动画
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.sprite.y - 20,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      onComplete: () => {
        this.sprite.destroy()
      },
    })
  }

  /**
   * 获取到玩家的距离
   * @returns 距离值或null（玩家不存在时）
   */
  protected getDistanceToPlayer(): number | null {
    if (!this.playerSprite || !this.playerSprite.active) return null
    return Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.playerSprite.x,
      this.playerSprite.y
    )
  }

  /** 销毁敌人 */
  destroy(): void {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy()
    }
  }
}
