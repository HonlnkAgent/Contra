/**
 * 关卡管理器 - 负责加载关卡数据并生成游戏世界
 * 管理平台、敌人生成、道具生成和背景渲染
 */
import Phaser from 'phaser'
import {
  LevelData,
  PlatformData,
  EnemySpawnData,
  PowerUpSpawnData,
} from '../../types/game'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConstants'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { SoldierEnemy } from '../entities/SoldierEnemy'
import { MachineGunnerEnemy } from '../entities/MachineGunnerEnemy'
import { JumperEnemy } from '../entities/JumperEnemy'
import { PowerUp } from '../entities/PowerUp'

export class LevelManager {
  private scene: Phaser.Scene
  private currentLevel: LevelData | null = null

  /** 游戏对象组 */
  platforms!: Phaser.Physics.Arcade.StaticGroup
  enemies!: Phaser.Physics.Arcade.Group
  powerUps!: Phaser.Physics.Arcade.Group

  /** 实体引用 */
  private enemyEntities: Enemy[] = []
  private powerUpEntities: PowerUp[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * 加载关卡
   * @param levelData 关卡数据
   * @param player 玩家实例
   * @param enemyBullets 敌人子弹组
   */
  loadLevel(
    levelData: LevelData,
    player: Player,
    enemyBullets: Phaser.Physics.Arcade.Group
  ): void {
    this.currentLevel = levelData

    // 创建平台组
    this.platforms = this.scene.physics.add.staticGroup()
    this.createPlatforms(levelData.platforms)

    // 创建敌人组
    this.enemies = this.scene.physics.add.group({
      allowGravity: true,
    })
    this.spawnEnemies(levelData.enemies, player, enemyBullets)

    // 创建道具组
    this.powerUps = this.scene.physics.add.group({
      allowGravity: false,
    })
    this.spawnPowerUps(levelData.powerUps)

    // 渲染背景
    this.renderBackground(levelData)
  }

  /** 创建平台 */
  private createPlatforms(platforms: PlatformData[]): void {
    platforms.forEach((platformData) => {
      const { x, y, width, height } = platformData

      // 使用平铺纹理创建平台
      const tilesX = Math.ceil(width / 32)
      const tilesY = Math.ceil(height / 32)

      for (let tx = 0; tx < tilesX; tx++) {
        for (let ty = 0; ty < tilesY; ty++) {
          const tile = this.platforms.create(
            x + tx * 32 + 16,
            y + ty * 32 + 16,
            'platform'
          ) as Phaser.Physics.Arcade.Sprite
          tile.setDisplaySize(32, 32)
          tile.refreshBody()
        }
      }
    })
  }

  /**
   * 生成敌人
   * @param enemies 敌人生成数据
   * @param player 玩家实例
   * @param enemyBullets 敌人子弹组
   */
  private spawnEnemies(
    enemies: EnemySpawnData[],
    player: Player,
    enemyBullets: Phaser.Physics.Arcade.Group
  ): void {
    enemies.forEach((spawnData) => {
      let enemy: Enemy

      switch (spawnData.type) {
        case 'soldier':
          enemy = new SoldierEnemy(
            this.scene,
            spawnData.x,
            spawnData.y,
            spawnData.patrolRange || 100,
            enemyBullets
          )
          break
        case 'machine_gunner':
          enemy = new MachineGunnerEnemy(
            this.scene,
            spawnData.x,
            spawnData.y,
            spawnData.patrolRange || 80,
            enemyBullets
          )
          break
        case 'jumper':
          enemy = new JumperEnemy(
            this.scene,
            spawnData.x,
            spawnData.y,
            spawnData.patrolRange || 150
          )
          break
        default:
          enemy = new SoldierEnemy(
            this.scene,
            spawnData.x,
            spawnData.y,
            spawnData.patrolRange || 100,
            enemyBullets
          )
      }

      // 设置玩家引用
      enemy.setPlayerRef(player.sprite)

      // 添加到组
      this.enemies.add(enemy.sprite)
      this.enemyEntities.push(enemy)
    })
  }

  /** 生成道具 */
  private spawnPowerUps(powerUps: PowerUpSpawnData[]): void {
    powerUps.forEach((spawnData) => {
      const powerUp = new PowerUp(
        this.scene,
        spawnData.x,
        spawnData.y,
        spawnData.type
      )

      this.powerUps.add(powerUp.sprite)
      this.powerUpEntities.push(powerUp)
    })
  }

  /** 渲染背景 */
  private renderBackground(levelData: LevelData): void {
    // 绘制渐变背景
    const bgGfx = this.scene.add.graphics()
    bgGfx.setScrollFactor(0)
    bgGfx.setDepth(-10)

    const topColor = 0x1a1a2e
    const bottomColor = 0x16213e

    // 绘制渐变
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const ratio = y / GAME_HEIGHT
      const r = Phaser.Math.Interpolation.Linear(
        [(topColor >> 16) & 0xff, (bottomColor >> 16) & 0xff],
        ratio
      )
      const g = Phaser.Math.Interpolation.Linear(
        [(topColor >> 8) & 0xff, (bottomColor >> 8) & 0xff],
        ratio
      )
      const b = Phaser.Math.Interpolation.Linear(
        [topColor & 0xff, bottomColor & 0xff],
        ratio
      )
      const color = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b)
      bgGfx.fillStyle(color, 1)
      bgGfx.fillRect(0, y, GAME_WIDTH, 1)
    }

    // 绘制远景装饰（山丘轮廓）
    const mountains = this.scene.add.graphics()
    mountains.setScrollFactor(0.2)
    mountains.setDepth(-5)
    mountains.fillStyle(0x0f3460, 0.4)

    // 绘制简单的山丘形状
    const hillPoints: Phaser.Math.Vector2[] = []
    for (let x = 0; x < GAME_WIDTH + 200; x += 50) {
      const hillY = GAME_HEIGHT - 200 + Math.sin(x * 0.008) * 80 + Math.cos(x * 0.003) * 40
      hillPoints.push(new Phaser.Math.Vector2(x, hillY))
    }
    hillPoints.push(new Phaser.Math.Vector2(GAME_WIDTH + 200, GAME_HEIGHT))
    hillPoints.push(new Phaser.Math.Vector2(0, GAME_HEIGHT))

    mountains.fillPoints(hillPoints, true)

    // 添加一些星星装饰
    const stars = this.scene.add.graphics()
    stars.setScrollFactor(0.1)
    stars.setDepth(-8)
    stars.fillStyle(0xffffff, 0.6)

    for (let i = 0; i < 30; i++) {
      const starX = Math.random() * GAME_WIDTH
      const starY = Math.random() * (GAME_HEIGHT * 0.5)
      const starSize = Math.random() * 2 + 1
      stars.fillCircle(starX, starY, starSize)
    }
  }

  /** 获取所有活跃的敌人实体 */
  getEnemyEntities(): Enemy[] {
    return this.enemyEntities.filter((e) => e.sprite.active)
  }

  /** 获取所有活跃的道具实体 */
  getPowerUpEntities(): PowerUp[] {
    return this.powerUpEntities.filter((p) => p.sprite.active)
  }

  /** 更新所有关卡中的实体 */
  update(time: number, delta: number): void {
    // 更新敌人
    this.enemyEntities.forEach((enemy) => {
      if (enemy.sprite.active) {
        enemy.update(time, delta)
      }
    })
  }

  /** 清理已销毁的实体引用 */
  cleanup(): void {
    this.enemyEntities = this.enemyEntities.filter((e) => e.sprite.active)
    this.powerUpEntities = this.powerUpEntities.filter((p) => p.sprite.active)
  }

  /** 销毁关卡管理器 */
  destroy(): void {
    this.enemyEntities.forEach((e) => e.destroy())
    this.powerUpEntities.forEach((p) => p.destroy())
    this.enemyEntities = []
    this.powerUpEntities = []
  }
}
