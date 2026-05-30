/**
 * 敌人生成器 - 负责无限模式下敌人生成逻辑
 * 根据难度和游戏状态动态生成敌人
 */
import Phaser from 'phaser'
import { EnemyType, Direction } from '../../types/game'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { SoldierEnemy } from '../entities/SoldierEnemy'
import { MachineGunnerEnemy } from '../entities/MachineGunnerEnemy'
import { JumperEnemy } from '../entities/JumperEnemy'
import { GAME_WIDTH, GAME_HEIGHT, WORLD_WIDTH } from '../config/GameConstants'

/** 生成配置接口 */
interface SpawnConfig {
  spawnInterval: number
  minSpawnInterval: number
  maxEnemies: number
  difficultyIncreaseRate: number
  enemyTypeWeights: Map<EnemyType, number>
}

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

  /** 敌人实体管理 */
  private enemyEntities: Enemy[] = []

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
   * 更新难度
   * @param score 当前分数
   */
  updateDifficulty(score: number): void {
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
   * 更新敌人类型权重
   */
  private updateEnemyTypeWeights(): void {
    if (this.difficulty >= 3) {
      this.enemyTypeWeights.set(EnemyType.SOLDIER, 40)
      this.enemyTypeWeights.set(EnemyType.MACHINE_GUNNER, 40)
      this.enemyTypeWeights.set(EnemyType.JUMPER, 20)
    }
    if (this.difficulty >= 5) {
      this.enemyTypeWeights.set(EnemyType.SOLDIER, 30)
      this.enemyTypeWeights.set(EnemyType.MACHINE_GUNNER, 40)
      this.enemyTypeWeights.set(EnemyType.JUMPER, 30)
    }
  }

  /**
   * 随机选择敌人类型
   * @returns 敌人类型
   */
  getRandomEnemyType(): EnemyType {
    const totalWeight = Array.from(this.enemyTypeWeights.values()).reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight

    for (const [type, weight] of this.enemyTypeWeights) {
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
  }

  /**
   * 销毁敌人生成器
   */
  destroy(): void {
    this.stop()
    this.enemyEntities.forEach((e) => e.destroy())
    this.enemyEntities = []
  }
}