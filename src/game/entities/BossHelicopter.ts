/**
 * 武装直升机 BOSS - 空中飞行 BOSS
 * 攻击模式：机枪扫射、火箭弹轰炸
 * 特点：在空中飞行，定期发射子弹
 */
import Phaser from 'phaser'
import { Boss, BossConfigData } from './Boss'
import { BossType, Direction } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { ENEMY, GAME_HEIGHT } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class BossHelicopter extends Boss {
  private bullets: Phaser.Physics.Arcade.Group

  /** 飞行控制 */
  private flySpeed: number = ENEMY.BOSS.HELICOPTER.SPEED
  private flyDirection: number = 1 // 1 向右，-1 向左
  private baseY: number = 0
  private flyAmplitude: number = 40 // 上下浮动幅度
  private flyFrequency: number = 0.002 // 浮动频率

  /** 攻击控制 */
  private machineGunInterval: number = 200 // 机枪射击间隔
  private rocketInterval: number = 3000 // 火箭弹发射间隔
  private lastMachineGunTime: number = 0
  private lastRocketTime: number = 0
  private machineGunBurstCount: number = 0
  private machineGunMaxBurst: number = 5 // 连射子弹数

  /** 攻击模式 */
  private attackMode: 'machinegun' | 'rocket' = 'machinegun'
  private modeSwitchTime: number = 0
  private modeDuration: number = 5000 // 每种模式持续时间

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bullets: Phaser.Physics.Arcade.Group
  ) {
    const config: BossConfigData = {
      width: ENEMY.BOSS.HELICOPTER.WIDTH,
      height: ENEMY.BOSS.HELICOPTER.HEIGHT,
      speed: ENEMY.BOSS.HELICOPTER.SPEED,
      health: ENEMY.BOSS.HELICOPTER.HEALTH,
      damage: ENEMY.BOSS.HELICOPTER.DAMAGE,
      score: ENEMY.BOSS.HELICOPTER.SCORE,
      detectionRange: ENEMY.BOSS.HELICOPTER.DETECTION_RANGE,
      fireRate: ENEMY.BOSS.HELICOPTER.FIRE_RATE,
      bossType: BossType.HELICOPTER,
    }

    super(scene, x, y, 'boss_helicopter', BossType.HELICOPTER, config)
    this.bullets = bullets
    this.baseY = y

    // 禁用重力 - 直升机在空中
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setGravityY(0)
    body.setAllowGravity(false)

    // 设置初始位置（空中）
    this.sprite.setY(GAME_HEIGHT - 250)
    this.baseY = GAME_HEIGHT - 250
  }

  /**
   * 更新直升机状态
   */
  update(time: number, delta: number): void {
    if (this.state === EnemyState.DEAD) return

    this.isActive = true

    // 飞行行为
    this.fly(time)

    // 面向玩家
    this.facePlayer()

    // 攻击行为
    this.attack()

    // 更新血条
    this.updateHealthBarPosition()
  }

  /**
   * 飞行行为
   * @param time 当前时间
   */
  private fly(time: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body

    // 水平飞行
    body.setVelocityX(this.flyDirection * this.flySpeed)

    // 垂直浮动（正弦波）
    const floatOffset = Math.sin(time * this.flyFrequency) * this.flyAmplitude
    const targetY = this.baseY + floatOffset
    body.setVelocityY((targetY - this.sprite.y) * 0.05)

    // 边界检测转向
    if (this.sprite.x <= 100) {
      this.flyDirection = 1
    } else if (this.sprite.x >= 3100) {
      this.flyDirection = -1
    }
  }

  /**
   * 攻击行为 - 切换机枪和火箭弹模式
   */
  protected attack(): void {
    this.state = EnemyState.ATTACK

    const now = this.scene.time.now

    // 切换攻击模式
    if (now - this.modeSwitchTime > this.modeDuration) {
      this.modeSwitchTime = now
      this.attackMode = this.attackMode === 'machinegun' ? 'rocket' : 'machinegun'
    }

    // 根据模式执行攻击
    if (this.attackMode === 'machinegun') {
      this.machineGunAttack(now)
    } else {
      this.rocketAttack(now)
    }
  }

  /**
   * 机枪扫射攻击
   * @param now 当前时间
   */
  private machineGunAttack(now: number): void {
    if (now - this.lastMachineGunTime < this.machineGunInterval) return

    this.lastMachineGunTime = now
    this.machineGunBurstCount++

    // 发射机枪子弹
    const offsetX = this.direction === Direction.RIGHT ? 30 : -30
    const bullet = new Bullet(
      this.scene,
      this.sprite.x + offsetX,
      this.sprite.y + 10,
      this.direction,
      false
    )
    this.bullets.add(bullet.sprite)

    eventBus.emit(GameEvents.ENEMY_SHOOT, {
      x: this.sprite.x + offsetX,
      y: this.sprite.y + 10,
      direction: this.direction,
      type: 'machinegun',
    })

    // 连射结束后切换模式
    if (this.machineGunBurstCount >= this.machineGunMaxBurst) {
      this.machineGunBurstCount = 0
      this.modeSwitchTime = now
      this.attackMode = 'rocket'
    }
  }

  /**
   * 火箭弹轰炸攻击
   * @param now 当前时间
   */
  private rocketAttack(now: number): void {
    if (now - this.lastRocketTime < this.rocketInterval) return

    this.lastRocketTime = now

    // 发射 3 发火箭弹（扇形）
    const angles = [-30, 0, 30]
    for (const angleDeg of angles) {
      const angle = (angleDeg * Math.PI) / 180
      const baseDir = this.direction === Direction.RIGHT ? 1 : -1
      const vx = Math.cos(angle) * baseDir * 300
      const vy = Math.sin(angle) * 300

      // 创建子弹并设置自定义速度
      const bullet = new Bullet(
        this.scene,
        this.sprite.x,
        this.sprite.y + 15,
        this.direction,
        false
      )
      bullet.sprite.body!.setVelocity(vx, vy)
      this.bullets.add(bullet.sprite)
    }

    eventBus.emit(GameEvents.ENEMY_SHOOT, {
      x: this.sprite.x,
      y: this.sprite.y + 15,
      direction: this.direction,
      type: 'rocket',
    })
  }

  /**
   * 特殊攻击 - 火箭弹轰炸（接口实现）
   */
  protected specialAttack(): void {
    const now = this.scene.time.now
    this.rocketAttack(now)
  }
}
