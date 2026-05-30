/**
 * 异形母巢 BOSS - 固定位置 BOSS
 * 攻击模式：孵化小怪、酸液喷射
 * 特点：定期生成小怪，不移动
 */
import Phaser from 'phaser'
import { Boss, BossConfigData } from './Boss'
import { BossType, Direction, EnemyType } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { ENEMY, GAME_HEIGHT } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'
import { Enemy } from './Enemy'

/** 孵化的小怪类型 */
interface SpawnedMinion {
  enemy: Enemy
  spawnTime: number
}

export class BossNest extends Boss {
  private bullets: Phaser.Physics.Arcade.Group
  private enemies: Phaser.Physics.Arcade.Group
  private enemyBullets: Phaser.Physics.Arcade.Group

  /** 孵化控制 */
  private spawnInterval: number = ENEMY.BOSS.NEST.SPAWN_RATE
  private lastSpawnTime: number = 0
  private maxMinions: number = 5 // 最大小怪数量
  private spawnedMinions: SpawnedMinion[] = []

  /** 酸液喷射控制 */
  private acidInterval: number = ENEMY.BOSS.NEST.FIRE_RATE
  private lastAcidTime: number = 0
  private acidBurstCount: number = 0
  private acidBurstMax: number = 3 // 连射酸液数
  private acidBurstInterval: number = 300 // 连射间隔

  /** 动画状态 */
  private pulseTime: number = 0
  private pulseSpeed: number = 0.003

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bullets: Phaser.Physics.Arcade.Group,
    enemies: Phaser.Physics.Arcade.Group,
    enemyBullets: Phaser.Physics.Arcade.Group
  ) {
    const config: BossConfigData = {
      width: ENEMY.BOSS.NEST.WIDTH,
      height: ENEMY.BOSS.NEST.HEIGHT,
      speed: ENEMY.BOSS.NEST.SPEED,
      health: ENEMY.BOSS.NEST.HEALTH,
      damage: ENEMY.BOSS.NEST.DAMAGE,
      score: ENEMY.BOSS.NEST.SCORE,
      detectionRange: ENEMY.BOSS.NEST.DETECTION_RANGE,
      fireRate: ENEMY.BOSS.NEST.FIRE_RATE,
      bossType: BossType.NEST,
    }

    super(scene, x, y, 'boss_nest', BossType.NEST, config)
    this.bullets = bullets
    this.enemies = enemies
    this.enemyBullets = enemyBullets

    // 母巢固定在地面上
    const groundY = GAME_HEIGHT - 100
    this.sprite.setY(groundY - config.height / 2)
  }

  /**
   * 更新母巢状态
   */
  update(time: number, delta: number): void {
    if (this.state === EnemyState.DEAD) return

    this.isActive = true

    // 脉动动画
    this.pulse(time)

    // 面向玩家
    this.facePlayer()

    // 攻击行为
    this.attack()

    // 清理已死亡的小怪
    this.cleanupMinions()

    // 更新血条
    this.updateHealthBarPosition()
  }

  /**
   * 脉动动画 - 母巢呼吸效果
   * @param time 当前时间
   */
  private pulse(time: number): void {
    this.pulseTime = time
    const scale = 1 + Math.sin(time * this.pulseSpeed) * 0.05
    this.sprite.setScale(scale)
  }

  /**
   * 攻击行为 - 孵化小怪和酸液喷射
   */
  protected attack(): void {
    this.state = EnemyState.ATTACK

    const now = this.scene.time.now

    // 孵化小怪
    if (now - this.lastSpawnTime >= this.spawnInterval) {
      this.spawnMinion(now)
    }

    // 酸液喷射
    if (now - this.lastAcidTime >= this.acidInterval) {
      this.acidAttack(now)
    }
  }

  /**
   * 孵化小怪
   * @param now 当前时间
   */
  private spawnMinion(now: number): void {
    // 检查最大小怪数量
    if (this.spawnedMinions.length >= this.maxMinions) return

    this.lastSpawnTime = now

    // 随机选择小怪类型
    const minionTypes = [EnemyType.SOLDIER, EnemyType.JUMPER, EnemyType.BOMBER]
    const randomType = minionTypes[Math.floor(Math.random() * minionTypes.length)]

    // 计算生成位置（母巢周围随机位置）
    const spawnX = this.sprite.x + (Math.random() - 0.5) * 100
    const spawnY = this.sprite.y + 20

    // 创建小怪
    let minion: Enemy
    switch (randomType) {
      case EnemyType.JUMPER:
        minion = this.createJumperMinion(spawnX, spawnY)
        break
      case EnemyType.BOMBER:
        minion = this.createBomberMinion(spawnX, spawnY)
        break
      default:
        minion = this.createSoldierMinion(spawnX, spawnY)
        break
    }

    // 设置玩家引用
    if (this.playerSprite) {
      minion.setPlayerRef(this.playerSprite)
    }

    // 添加到管理
    this.enemies.add(minion.sprite)
    this.spawnedMinions.push({
      enemy: minion,
      spawnTime: now,
    })

    eventBus.emit(GameEvents.ENEMY_SPAWN, {
      x: spawnX,
      y: spawnY,
      type: randomType,
      isMinion: true,
    })
  }

  /**
   * 创建步兵小怪
   */
  private createSoldierMinion(x: number, y: number): Enemy {
    // 动态导入避免循环依赖
    const { SoldierEnemy } = require('./SoldierEnemy')
    return new SoldierEnemy(this.scene, x, y, 50 + Math.random() * 50, this.enemyBullets)
  }

  /**
   * 创建跳跃兵小怪
   */
  private createJumperMinion(x: number, y: number): Enemy {
    const { JumperEnemy } = require('./JumperEnemy')
    return new JumperEnemy(this.scene, x, y, 80 + Math.random() * 50)
  }

  /**
   * 创建自爆兵小怪
   */
  private createBomberMinion(x: number, y: number): Enemy {
    const { BomberEnemy } = require('./BomberEnemy')
    return new BomberEnemy(this.scene, x, y, 100 + Math.random() * 50)
  }

  /**
   * 酸液喷射攻击
   * @param now 当前时间
   */
  private acidAttack(now: number): void {
    this.lastAcidTime = now

    // 发射酸液弹（向下抛射）
    const directionToPlayer = this.getDirectionToPlayer()
    const baseAngle = directionToPlayer
      ? Math.atan2(directionToPlayer.y, directionToPlayer.x)
      : (this.direction === Direction.RIGHT ? 0 : Math.PI)

    // 发射 3 发酸液弹
    for (let i = -1; i <= 1; i++) {
      const angle = baseAngle + (i * 20 * Math.PI) / 180
      const speed = 250
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed - 100 // 向上抛射

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
      type: 'acid',
    })
  }

  /**
   * 清理已死亡的小怪
   */
  private cleanupMinions(): void {
    this.spawnedMinions = this.spawnedMinions.filter(
      (minion) => minion.enemy.sprite.active
    )
  }

  /**
   * 特殊攻击 - 酸液喷射（接口实现）
   */
  protected specialAttack(): void {
    const now = this.scene.time.now
    this.acidAttack(now)
  }

  /**
   * 受到伤害 - 母巢被击中时加速孵化
   */
  takeDamage(amount: number): void {
    super.takeDamage(amount)

    // 血量越低，孵化越快
    const healthPercent = this.health / this.maxHealth
    if (healthPercent < 0.3) {
      this.spawnInterval = ENEMY.BOSS.NEST.SPAWN_RATE * 0.4
      this.maxMinions = 8
    } else if (healthPercent < 0.6) {
      this.spawnInterval = ENEMY.BOSS.NEST.SPAWN_RATE * 0.6
      this.maxMinions = 6
    }
  }

  /**
   * 母巢死亡 - 清理所有小怪
   */
  die(): void {
    // 杀死所有小怪
    for (const minion of this.spawnedMinions) {
      if (minion.enemy.sprite.active) {
        minion.enemy.die()
      }
    }
    this.spawnedMinions = []

    super.die()
  }

  /**
   * 销毁母巢
   */
  destroy(): void {
    this.spawnedMinions = []
    super.destroy()
  }
}
