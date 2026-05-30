/**
 * 玩家实体类 - 控制玩家角色的所有行为
 * 包括移动、跳跃、射击、受伤、无敌状态等
 */
import Phaser from 'phaser'
import { Direction, WeaponType } from '../../types/game'
import { PlayerState } from '../../types/player'
import {
  PLAYER,
  GAME_WIDTH,
  WORLD_WIDTH,
  GAME_HEIGHT,
} from '../config/GameConstants'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class Player {
  /** 玩家精灵 */
  readonly sprite: Phaser.Physics.Arcade.Sprite
  private scene: Phaser.Scene

  /** 玩家属性 */
  health: number = PLAYER.MAX_HEALTH
  lives: number = PLAYER.INITIAL_LIVES
  score: number = 0
  weapon: WeaponType = WeaponType.NORMAL
  direction: Direction = Direction.RIGHT
  state: PlayerState = PlayerState.IDLE
  isInvincible: boolean = false
  isOnGround: boolean = false

  /** 射击控制 */
  private lastFireTime: number = 0
  private currentFireRate: number = PLAYER.FIRE_RATE

  /** 无敌计时器 */
  private invincibleTimer: Phaser.Time.TimerEvent | null = null

  /** 闪烁效果 */
  private blinkTimer: Phaser.Time.TimerEvent | null = null

  /** 相机跟随 */
  private camera: Phaser.Cameras.Scene2D.Camera

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.sprite = scene.physics.add.sprite(x, y, 'player')
    this.sprite.setCollideWorldBounds(true)
    this.sprite.setBounce(0)
    this.sprite.setSize(24, 44)
    this.sprite.setOffset(4, 4)
    this.sprite.setDepth(10)
    this.sprite.setData('entity', this)

    // 设置物理属性
    this.sprite.body!.setGravityY(PLAYER.GRAVITY)

    // 设置相机
    this.camera = scene.cameras.main
    this.camera.startFollow(this.sprite, true, 0.1, 0.1)
    this.camera.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)

    // 设置世界边界
    scene.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
  }

  /**
   * 更新玩家状态 - 每帧调用
   * @param time 当前游戏时间
   * @param delta 帧间隔时间
   */
  update(time: number, _delta: number): void {
    this.updateGroundState()
    this.updateState()

    // 如果射击模式为速射，更新射击频率
    if (this.weapon === WeaponType.RAPID_FIRE) {
      this.currentFireRate = PLAYER.FIRE_RATE * 0.5
    } else {
      this.currentFireRate = PLAYER.FIRE_RATE
    }
  }

  /** 更新地面状态 */
  private updateGroundState(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.isOnGround = body.blocked.down || body.touching.down
  }

  /** 更新玩家动画状态 */
  private updateState(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body

    if (this.health <= 0) {
      this.state = PlayerState.DEAD
      return
    }

    if (!this.isOnGround) {
      this.state = body.velocity.y < 0 ? PlayerState.JUMPING : PlayerState.FALLING
      return
    }

    if (Math.abs(body.velocity.x) > 10) {
      this.state = PlayerState.RUNNING
    } else {
      this.state = PlayerState.IDLE
    }
  }

  /**
   * 水平移动
   * @param dir 方向 (-1 向左, 0 停止, 1 向右)
   */
  move(dir: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocityX(dir * PLAYER.SPEED)

    if (dir !== 0) {
      this.direction = dir > 0 ? Direction.RIGHT : Direction.LEFT
      this.sprite.setFlipX(dir < 0)
    }
  }

  /** 跳跃 */
  jump(): void {
    if (!this.isOnGround) return

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocityY(PLAYER.JUMP_VELOCITY)
    this.isOnGround = false
    eventBus.emit(GameEvents.PLAYER_JUMP)
  }

  /**
   * 射击
   * @returns 返回子弹数据或 null（如果射击冷却中）
   */
  shoot(): { x: number; y: number; direction: Direction; weapon: WeaponType } | null {
    const now = this.scene.time.now
    if (now - this.lastFireTime < this.currentFireRate) {
      return null
    }

    this.lastFireTime = now
    this.state = PlayerState.SHOOTING

    const offsetX = this.direction === Direction.RIGHT ? 20 : -12
    const bulletX = this.sprite.x + offsetX
    const bulletY = this.sprite.y - 4

    eventBus.emit(GameEvents.PLAYER_SHOOT, {
      x: bulletX,
      y: bulletY,
      direction: this.direction,
      weapon: this.weapon,
    })

    return { x: bulletX, y: bulletY, direction: this.direction, weapon: this.weapon }
  }

  /**
   * 受到伤害
   * @param amount 伤害值
   */
  takeDamage(amount: number): void {
    if (this.isInvincible || this.health <= 0) return

    this.health = Math.max(0, this.health - amount)
    eventBus.emit(GameEvents.UI_UPDATE_HEALTH, this.health)

    if (this.health <= 0) {
      this.die()
      return
    }

    // 进入无敌状态
    this.setInvincible()

    // 受伤击退效果
    const knockbackDir = this.direction === Direction.RIGHT ? -1 : 1
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocity(knockbackDir * 150, -200)
  }

  /** 玩家死亡 */
  private die(): void {
    this.lives--
    this.state = PlayerState.DEAD
    eventBus.emit(GameEvents.PLAYER_DEATH, this.lives)
    eventBus.emit(GameEvents.UI_UPDATE_LIVES, this.lives)

    if (this.lives > 0) {
      // 还有生命，延迟重生
      this.scene.time.delayedCall(1500, () => {
        this.respawn()
      })
    } else {
      // 游戏结束
      eventBus.emit(GameEvents.GAME_OVER, { score: this.score })
    }
  }

  /** 重生 */
  respawn(): void {
    this.health = PLAYER.MAX_HEALTH
    this.state = PlayerState.IDLE
    this.sprite.setPosition(100, GAME_HEIGHT - 100)
    this.sprite.setVelocity(0, 0)
    this.sprite.setAlpha(1)
    this.sprite.setActive(true)
    this.sprite.setVisible(true)
    this.setInvincible()
    eventBus.emit(GameEvents.PLAYER_RESPAWN)
    eventBus.emit(GameEvents.UI_UPDATE_HEALTH, this.health)
  }

  /** 设置无敌状态 */
  private setInvincible(): void {
    this.isInvincible = true

    // 清除之前的计时器
    if (this.invincibleTimer) this.invincibleTimer.destroy()
    if (this.blinkTimer) this.blinkTimer.destroy()

    // 闪烁效果
    this.blinkTimer = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.sprite.setAlpha(this.sprite.alpha === 1 ? 0.3 : 1)
      },
      repeat: PLAYER.INVINCIBLE_DURATION / 100 - 1,
    })

    // 无敌时间结束
    this.invincibleTimer = this.scene.time.delayedCall(
      PLAYER.INVINCIBLE_DURATION,
      () => {
        this.isInvincible = false
        this.sprite.setAlpha(1)
        if (this.blinkTimer) {
          this.blinkTimer.destroy()
          this.blinkTimer = null
        }
      }
    )
  }

  /**
   * 增加分数
   * @param points 增加的分数
   */
  addScore(points: number): void {
    this.score += points
    eventBus.emit(GameEvents.UI_UPDATE_SCORE, this.score)
  }

  /**
   * 切换武器
   * @param weapon 新武器类型
   */
  setWeapon(weapon: WeaponType): void {
    this.weapon = weapon
    eventBus.emit(GameEvents.UI_UPDATE_WEAPON, weapon)
  }

  /** 增加一条生命 */
  addLife(): void {
    this.lives++
    eventBus.emit(GameEvents.UI_UPDATE_LIVES, this.lives)
  }

  /** 恢复生命值 */
  heal(amount: number): void {
    this.health = Math.min(PLAYER.MAX_HEALTH, this.health + amount)
    eventBus.emit(GameEvents.UI_UPDATE_HEALTH, this.health)
  }

  /** 销毁玩家 */
  destroy(): void {
    if (this.invincibleTimer) this.invincibleTimer.destroy()
    if (this.blinkTimer) this.blinkTimer.destroy()
    this.sprite.destroy()
  }
}
