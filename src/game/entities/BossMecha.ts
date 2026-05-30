/**
 * 巨型机甲 BOSS - 地面行走 BOSS
 * 攻击模式：激光扫射、导弹齐射
 * 特点：在地面行走，高伤害
 */
import Phaser from 'phaser'
import { Boss, BossConfigData } from './Boss'
import { BossType, Direction } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { ENEMY, GAME_HEIGHT } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class BossMecha extends Boss {
  private bullets: Phaser.Physics.Arcade.Group

  /** 移动控制 */
  private moveSpeed: number = ENEMY.BOSS.MECHA.SPEED
  private moveDirection: number = 1 // 1 向右，-1 向左
  private moveRange: number = 400 // 移动范围
  private startX: number = 0

  /** 攻击控制 */
  private laserInterval: number = 2000 // 激光射击间隔
  private missileInterval: number = 4000 // 导弹齐射间隔
  private lastLaserTime: number = 0
  private lastMissileTime: number = 0

  /** 攻击模式 */
  private attackMode: 'laser' | 'missile' = 'laser'
  private modeSwitchTime: number = 0
  private modeDuration: number = 6000 // 每种模式持续时间

  /** 激光扫射状态 */
  private laserSweepAngle: number = 0
  private laserSweepSpeed: number = 0.03 // 扫射角速度
  private laserSweepRange: number = 60 // 扫射角度范围（度）

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bullets: Phaser.Physics.Arcade.Group
  ) {
    const config: BossConfigData = {
      width: ENEMY.BOSS.MECHA.WIDTH,
      height: ENEMY.BOSS.MECHA.HEIGHT,
      speed: ENEMY.BOSS.MECHA.SPEED,
      health: ENEMY.BOSS.MECHA.HEALTH,
      damage: ENEMY.BOSS.MECHA.DAMAGE,
      score: ENEMY.BOSS.MECHA.SCORE,
      detectionRange: ENEMY.BOSS.MECHA.DETECTION_RANGE,
      fireRate: ENEMY.BOSS.MECHA.FIRE_RATE,
      bossType: BossType.MECHA,
    }

    super(scene, x, y, 'boss_mecha', BossType.MECHA, config)
    this.bullets = bullets
    this.startX = x

    // 设置在地面上
    const groundY = GAME_HEIGHT - 100
    this.sprite.setY(groundY - config.height / 2)
  }

  /**
   * 更新机甲状态
   */
  update(time: number, delta: number): void {
    if (this.state === EnemyState.DEAD) return

    this.isActive = true

    // 移动行为
    this.move()

    // 面向玩家
    this.facePlayer()

    // 攻击行为
    this.attack()

    // 更新血条
    this.updateHealthBarPosition()
  }

  /**
   * 移动行为 - 在范围内来回移动
   */
  private move(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down || body.touching.down

    if (!onGround) return

    // 检查是否超出移动范围
    const distFromStart = this.sprite.x - this.startX
    if (Math.abs(distFromStart) >= this.moveRange) {
      this.moveDirection *= -1
    }

    // 移动
    const velocityX = this.moveDirection * this.moveSpeed
    body.setVelocityX(velocityX)
  }

  /**
   * 攻击行为 - 切换激光和导弹模式
   */
  protected attack(): void {
    this.state = EnemyState.ATTACK

    const now = this.scene.time.now

    // 切换攻击模式
    if (now - this.modeSwitchTime > this.modeDuration) {
      this.modeSwitchTime = now
      this.laserSweepAngle = 0
      this.attackMode = this.attackMode === 'laser' ? 'missile' : 'laser'
    }

    // 根据模式执行攻击
    if (this.attackMode === 'laser') {
      this.laserAttack(now)
    } else {
      this.missileAttack(now)
    }
  }

  /**
   * 激光扫射攻击
   * @param now 当前时间
   */
  private laserAttack(now: number): void {
    if (now - this.lastLaserTime < this.laserInterval) return

    this.lastLaserTime = now

    // 激光扫射 - 发射扇形子弹
    const baseAngle = this.direction === Direction.RIGHT ? 0 : Math.PI
    this.laserSweepAngle += this.laserSweepSpeed

    // 扫射角度在范围内来回
    const sweepOffset = Math.sin(this.laserSweepAngle) * this.laserSweepRange
    const fireAngle = baseAngle + (sweepOffset * Math.PI) / 180

    const vx = Math.cos(fireAngle) * 400
    const vy = Math.sin(fireAngle) * 400

    const bullet = new Bullet(
      this.scene,
      this.sprite.x,
      this.sprite.y - 10,
      this.direction,
      false
    )
    bullet.sprite.body!.setVelocity(vx, vy)
    this.bullets.add(bullet.sprite)

    eventBus.emit(GameEvents.ENEMY_SHOOT, {
      x: this.sprite.x,
      y: this.sprite.y - 10,
      direction: this.direction,
      type: 'laser',
    })
  }

  /**
   * 导弹齐射攻击
   * @param now 当前时间
   */
  private missileAttack(now: number): void {
    if (now - this.lastMissileTime < this.missileInterval) return

    this.lastMissileTime = now

    // 发射 5 发导弹（扇形覆盖）
    const angles = [-60, -30, 0, 30, 60]
    const baseDir = this.direction === Direction.RIGHT ? 1 : -1

    for (const angleDeg of angles) {
      const angle = (angleDeg * Math.PI) / 180
      const vx = Math.cos(angle) * baseDir * 350
      const vy = Math.sin(angle) * 350 - 100 // 稍微向上

      const bullet = new Bullet(
        this.scene,
        this.sprite.x,
        this.sprite.y - 20,
        this.direction,
        false
      )
      bullet.sprite.body!.setVelocity(vx, vy)
      this.bullets.add(bullet.sprite)
    }

    eventBus.emit(GameEvents.ENEMY_SHOOT, {
      x: this.sprite.x,
      y: this.sprite.y - 20,
      direction: this.direction,
      type: 'missile_volley',
    })
  }

  /**
   * 特殊攻击 - 导弹齐射（接口实现）
   */
  protected specialAttack(): void {
    const now = this.scene.time.now
    this.missileAttack(now)
  }
}
