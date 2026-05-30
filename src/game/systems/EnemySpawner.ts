/**
 * 敌人生成器 - 负责无限模式下敌人生成逻辑
 * 根据难度和游戏状态动态生成敌人和 BOSS
 */
import Phaser from 'phaser'
import { EnemyType, BossType } from '../../types/game'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { SoldierEnemy } from '../entities/SoldierEnemy'
import { MachineGunnerEnemy } from '../entities/MachineGunnerEnemy'
import { JumperEnemy } from '../entities/JumperEnemy'
import { FlameEnemy } from '../entities/FlameEnemy'
import { SniperEnemy } from '../entities/SniperEnemy'
import { BomberEnemy } from '../entities/BomberEnemy'
import { FlyerEnemy } from '../entities/FlyerEnemy'
import { ShieldEnemy } from '../entities/ShieldEnemy'
import { Boss } from '../entities/Boss'
import { BossHelicopter } from '../entities/BossHelicopter'
import { BossMecha } from '../entities/BossMecha'
import { BossNest } from '../entities/BossNest'
import { GAME_HEIGHT, WORLD_WIDTH, ENEMY } from '../config/GameConstants'

/** BOSS 生成间隔（分数） */
const BOSS_SPAWN_SCORE_INTERVAL = 10000

export class EnemySpawner {
  private scene: Phaser.Scene
  private player: Player
  private enemyBullets: Phaser.Physics.Arcade.Group
  private enemies: Phaser.Physics.Arcade.Group

  /** 生成控制 */
  private spawnTimer: Phaser.Time.TimerEvent | null = null
  private spawnInterval: number = 3000 // 初始生成间隔
  private minSpawnInterval: number = 1000 // 最小生成间隔
  private difficulty: number = 1 // 难度等级
  private maxEnemies: number = 10 // 最大敌人数量
  private difficultyIncreaseRate: number = 0.1 // 难度增长率

  /** 敌人类型权重 */
  private enemyTypeWeights: Map<EnemyType, number> = new Map([
    [EnemyType.SOLDIER, 60],
    [EnemyType.MACHINE_GUNNER, 30],
    [EnemyType.JUMPER, 10],
  ])

  /** 已解锁的敌人类型 */
  private unlockedEnemyTypes: Set<EnemyType> = new Set([
    EnemyType.SOLDIER,
    EnemyType.MACHINE_GUNNER,
    EnemyType.JUMPER,
  ])

  /** 解锁阈值 */
  private unlockThresholds: Map<EnemyType, number> = new Map([
    [EnemyType.BOMBER, ENEMY.BOMBER.UNLOCK_SCORE],
    [EnemyType.FLAME, ENEMY.FLAME.UNLOCK_SCORE],
    [EnemyType.SNIPER, ENEMY.SNIPER.UNLOCK_SCORE],
    [EnemyType.FLYER, ENEMY.FLYER.UNLOCK_SCORE],
    [EnemyType.SHIELD, ENEMY.SHIELD.UNLOCK_SCORE],
  ])

  /** 敌人实体管理 */
  private enemyEntities: Enemy[] = []

  /** BOSS 管理 */
  private activeBoss: Boss | null = null
  private lastBossScore: number = 0 // 上次生成 BOSS 时的分数
  private bossTypes: BossType[] = [
    BossType.HELICOPTER,
    BossType.MECHA,
    BossType.NEST,
  ]

  /**
   * 构造函数
   * @param scene 场景引用
   * @param player 玩家实例
   * @param enemyBullets 敌人子弹组
   * @param enemies 敌人组
   */
  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemyBullets: Phaser.Physics.Arcade.Group,
    enemies: Phaser.Physics.Arcade.Group
  ) {
    this.scene = scene
    this.player = player
    this.enemyBullets = enemyBullets
    this.enemies = enemies
  }

  /**
   * 开始生成敌人
   */
  start(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy()
    }

    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnInterval,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    })
  }

  /**
   * 停止生成敌人
   */
  stop(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy()
      this.spawnTimer = null
    }
  }

  /**
   * 生成敌人
   */
  spawnEnemy(): void {
    // 检查当前活跃敌人数量
    const activeEnemies = this.enemyEntities.filter((e) => e.sprite.active)
    if (activeEnemies.length >= this.maxEnemies) {
      return
    }

    // 随机选择敌人类型
    const enemyType = this.getRandomEnemyType()

    // 随机生成位置（在玩家前方或后方）
    const spawnX = this.getSpawnX()
    const spawnY = this.getSpawnY(spawnX)

    // 创建敌人
    let enemy: Enemy
    switch (enemyType) {
      case EnemyType.SOLDIER:
        enemy = new SoldierEnemy(
          this.scene,
          spawnX,
          spawnY,
          100 + Math.random() * 100,
          this.enemyBullets
        )
        break
      case EnemyType.MACHINE_GUNNER:
        enemy = new MachineGunnerEnemy(
          this.scene,
          spawnX,
          spawnY,
          50 + Math.random() * 50,
          this.enemyBullets
        )
        break
      case EnemyType.JUMPER:
        enemy = new JumperEnemy(
          this.scene,
          spawnX,
          spawnY,
          150 + Math.random() * 100
        )
        break
      case EnemyType.FLAME:
        enemy = new FlameEnemy(
          this.scene,
          spawnX,
          spawnY,
          100 + Math.random() * 100,
          this.enemyBullets
        )
        break
      case EnemyType.SNIPER:
        enemy = new SniperEnemy(
          this.scene,
          spawnX,
          spawnY,
          80 + Math.random() * 50,
          this.enemyBullets
        )
        break
      case EnemyType.BOMBER:
        enemy = new BomberEnemy(
          this.scene,
          spawnX,
          spawnY,
          150 + Math.random() * 100
        )
        break
      case EnemyType.FLYER:
        enemy = new FlyerEnemy(
          this.scene,
          spawnX,
          spawnY,
          200 + Math.random() * 100,
          this.enemyBullets
        )
        break
      case EnemyType.SHIELD:
        enemy = new ShieldEnemy(
          this.scene,
          spawnX,
          spawnY,
          100 + Math.random() * 100,
          this.enemyBullets
        )
        break
      default:
        enemy = new SoldierEnemy(
          this.scene,
          spawnX,
          spawnY,
          100 + Math.random() * 100,
          this.enemyBullets
        )
    }

    // 设置玩家引用
    enemy.setPlayerRef(this.player.sprite)

    // 添加到组
    this.enemies.add(enemy.sprite)
    this.enemyEntities.push(enemy)
  }

  /**
   * 更新难度和检查 BOSS 生成
   * @param score 当前分数
   */
  updateDifficulty(score: number): void {
    // 检查解锁新敌人类型
    this.checkEnemyUnlocks(score)

    // 检查是否需要生成 BOSS
    this.checkBossSpawn(score)

    // 根据分数计算难度等级
    const newDifficulty = Math.floor(score / 1000) * this.difficultyIncreaseRate + 1
    if (newDifficulty > this.difficulty) {
      this.difficulty = newDifficulty

      // 更新生成间隔（随难度增加而减少）
      this.spawnInterval = Math.max(
        this.minSpawnInterval,
        3000 - (this.difficulty - 1) * 200
      )

      // 更新最大敌人数量（随难度增加而增加）
      this.maxEnemies = Math.min(20, 10 + Math.floor(this.difficulty / 2))

      // 更新敌人类型权重（难度越高，高级敌人越多）
      this.updateEnemyTypeWeights()

      // 重启生成计时器
      if (this.spawnTimer) {
        this.spawnTimer.destroy()
        this.spawnTimer = this.scene.time.addEvent({
          delay: this.spawnInterval,
          callback: this.spawnEnemy,
          callbackScope: this,
          loop: true,
        })
      }
    }
  }

  /**
   * 检查是否需要生成 BOSS
   * @param score 当前分数
   */
  private checkBossSpawn(score: number): void {
    // 如果已有活跃 BOSS，不生成新的
    if (this.activeBoss && this.activeBoss.sprite.active) {
      return
    }

    // 检查是否达到 BOSS 生成分数间隔
    const nextBossScore = this.lastBossScore + BOSS_SPAWN_SCORE_INTERVAL
    if (score >= nextBossScore && score > 0) {
      this.lastBossScore = score
      this.spawnBoss()
    }
  }

  /**
   * 生成 BOSS
   */
  private spawnBoss(): void {
    // 随机选择 BOSS 类型
    const randomIndex = Math.floor(Math.random() * this.bossTypes.length)
    const bossType = this.bossTypes[randomIndex]

    // 计算生成位置（在玩家前方）
    const playerX = this.player.sprite.x
    const spawnDirection = Math.random() > 0.5 ? 1 : -1
    const spawnDistance = 400 + Math.random() * 200
    let spawnX = playerX + spawnDirection * spawnDistance

    // 确保在世界范围内
    spawnX = Phaser.Math.Clamp(spawnX, 100, WORLD_WIDTH - 100)
    const spawnY = GAME_HEIGHT - 200

    // 创建 BOSS
    let boss: Boss
    switch (bossType) {
      case BossType.HELICOPTER:
        boss = new BossHelicopter(this.scene, spawnX, spawnY, this.enemyBullets)
        break
      case BossType.MECHA:
        boss = new BossMecha(this.scene, spawnX, spawnY, this.enemyBullets)
        break
      case BossType.NEST:
        boss = new BossNest(
          this.scene,
          spawnX,
          spawnY,
          this.enemyBullets,
          this.enemies,
          this.enemyBullets
        )
        break
      default:
        boss = new BossHelicopter(this.scene, spawnX, spawnY, this.enemyBullets)
    }

    // 设置玩家引用
    boss.setPlayerRef(this.player.sprite)

    // 添加到管理
    this.enemies.add(boss.sprite)
    this.enemyEntities.push(boss)
    this.activeBoss = boss

    // 暂停普通敌人生成（BOSS 战期间）
    this.stop()

    // 5秒后恢复普通敌人生成（较少数量）
    this.scene.time.delayedCall(5000, () => {
      if (this.activeBoss && this.activeBoss.sprite.active) {
        this.maxEnemies = 5 // BOSS 战期间减少敌人数量
        this.spawnInterval = 5000 // 增加生成间隔
        this.start()
      }
    })
  }

  /**
   * 检查解锁新敌人类型
   * @param score 当前分数
   */
  private checkEnemyUnlocks(score: number): void {
    for (const [enemyType, threshold] of this.unlockThresholds) {
      if (score >= threshold && !this.unlockedEnemyTypes.has(enemyType)) {
        this.unlockedEnemyTypes.add(enemyType)
      }
    }
  }

  /**
   * 更新敌人类型权重
   */
  private updateEnemyTypeWeights(): void {
    // 基础权重
    const baseWeights = new Map<EnemyType, number>([
      [EnemyType.SOLDIER, 60],
      [EnemyType.MACHINE_GUNNER, 30],
      [EnemyType.JUMPER, 10],
    ])

    // 根据难度调整基础权重
    if (this.difficulty >= 3) {
      baseWeights.set(EnemyType.SOLDIER, 40)
      baseWeights.set(EnemyType.MACHINE_GUNNER, 40)
      baseWeights.set(EnemyType.JUMPER, 20)
    }
    if (this.difficulty >= 5) {
      baseWeights.set(EnemyType.SOLDIER, 30)
      baseWeights.set(EnemyType.MACHINE_GUNNER, 40)
      baseWeights.set(EnemyType.JUMPER, 30)
    }

    // 添加已解锁的高级敌人类型
    const advancedTypes = [
      EnemyType.FLAME,
      EnemyType.SNIPER,
      EnemyType.BOMBER,
      EnemyType.FLYER,
      EnemyType.SHIELD,
    ]

    let advancedWeight = 0
    for (const enemyType of advancedTypes) {
      if (this.unlockedEnemyTypes.has(enemyType)) {
        // 每个高级敌人类型分配10%权重
        baseWeights.set(enemyType, 10)
        advancedWeight += 10
      }
    }

    // 如果有高级敌人，按比例减少基础敌人的权重
    if (advancedWeight > 0) {
      const reductionFactor = (100 - advancedWeight) / 100
      for (const [type, weight] of baseWeights) {
        if (!advancedTypes.includes(type)) {
          baseWeights.set(type, Math.floor(weight * reductionFactor))
        }
      }
    }

    this.enemyTypeWeights = baseWeights
  }

  /**
   * 随机选择敌人类型
   * @returns 敌人类型
   */
  getRandomEnemyType(): EnemyType {
    // 只考虑已解锁的敌人类型
    const availableTypes = new Map<EnemyType, number>()
    let totalWeight = 0

    for (const [type, weight] of this.enemyTypeWeights) {
      if (this.unlockedEnemyTypes.has(type)) {
        availableTypes.set(type, weight)
        totalWeight += weight
      }
    }

    // 如果没有可用类型，返回默认类型
    if (totalWeight === 0) {
      return EnemyType.SOLDIER
    }

    let random = Math.random() * totalWeight

    for (const [type, weight] of availableTypes) {
      random -= weight
      if (random <= 0) {
        return type
      }
    }

    return EnemyType.SOLDIER
  }

  /**
   * 获取生成X坐标
   * @returns X坐标
   */
  private getSpawnX(): number {
    const playerX = this.player.sprite.x
    const minDistance = 300
    const maxDistance = 600

    // 随机在玩家前方或后方生成
    const direction = Math.random() > 0.5 ? 1 : -1
    const distance = minDistance + Math.random() * (maxDistance - minDistance)
    let spawnX = playerX + direction * distance

    // 确保在世界范围内
    spawnX = Phaser.Math.Clamp(spawnX, 50, WORLD_WIDTH - 50)

    return spawnX
  }

  /**
   * 获取生成Y坐标
   * @param x X坐标
   * @returns Y坐标
   */
  private getSpawnY(x: number): number {
    // 在地面附近生成（考虑地形变化）
    const groundY = GAME_HEIGHT - 100
    const variation = Math.random() * 50
    return groundY - variation
  }

  /**
   * 获取当前活跃的 BOSS
   * @returns BOSS 实例或 null
   */
  getActiveBoss(): Boss | null {
    if (this.activeBoss && this.activeBoss.sprite.active) {
      return this.activeBoss
    }
    return null
  }

  /**
   * 获取所有活跃的敌人实体
   * @returns 活跃敌人数组
   */
  getEnemyEntities(): Enemy[] {
    return this.enemyEntities.filter((e) => e.sprite.active)
  }

  /**
   * 清理已销毁的敌人引用
   */
  cleanup(): void {
    this.enemyEntities = this.enemyEntities.filter((e) => e.sprite.active)

    // 检查 BOSS 是否还活着
    if (this.activeBoss && !this.activeBoss.sprite.active) {
      this.activeBoss = null

      // BOSS 死亡后恢复正常的敌人生成
      this.maxEnemies = 10 + Math.floor(this.difficulty / 2)
      this.spawnInterval = Math.max(
        this.minSpawnInterval,
        3000 - (this.difficulty - 1) * 200
      )
      if (!this.spawnTimer) {
        this.start()
      }
    }
  }

  /**
   * 销毁敌人生成器
   */
  destroy(): void {
    this.stop()
    this.enemyEntities.forEach((e) => e.destroy())
    this.enemyEntities = []
    this.activeBoss = null
  }
}
