/**
 * 主游戏场景 - 游戏的核心场景
 * 集成所有游戏系统：玩家、敌人、子弹、碰撞、关卡、道具
 * 管理游戏主循环和状态更新
 */
import Phaser from 'phaser'
import { GameStatus, Direction, WeaponType, PowerUpType } from '../../types/game'
import { GAME_HEIGHT, WORLD_WIDTH } from '../config/GameConstants'
import { eventBus, GameEvents } from '../../utils/EventBus'
import { InputSystem } from '../systems/InputSystem'
import { CollisionSystem } from '../systems/CollisionSystem'
import { AudioManager } from '../systems/AudioManager'
import { AssetManager } from '../systems/AssetManager'
import { LevelManager } from '../levels/LevelManager'
import { Player } from '../entities/Player'
import { Bullet } from '../entities/Bullet'
import { getLevelData } from '../levels/LevelData'
import { PowerUp } from '../entities/PowerUp'

export class GameScene extends Phaser.Scene {
  /** 游戏状态 */
  private gameStatus: GameStatus = GameStatus.PLAYING
  private currentLevel: number = 1

  /** 核心系统 */
  private inputSystem!: InputSystem
  private collisionSystem!: CollisionSystem
  private audioManager!: AudioManager
  private assetManager!: AssetManager
  private levelManager!: LevelManager

  /** 游戏实体 */
  private player!: Player
  private playerBullets!: Phaser.Physics.Arcade.Group
  private enemyBullets!: Phaser.Physics.Arcade.Group

  /** 子弹实体管理 */
  private bulletEntities: Bullet[] = []

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    // 初始化系统
    this.inputSystem = new InputSystem(this)
    this.audioManager = new AudioManager(this)
    this.assetManager = new AssetManager(this)
    this.levelManager = new LevelManager(this)
    this.collisionSystem = new CollisionSystem(this)

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 30,
      runChildUpdate: false,
      allowGravity: false,
    })

    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 50,
      runChildUpdate: false,
      allowGravity: false,
    })

    // 加载关卡
    this.loadLevel(this.currentLevel)

    // 设置碰撞检测
    this.setupCollisions()

    // 注册事件监听
    this.setupEventListeners()

    // 通知 Vue 层游戏已就绪
    eventBus.emit(GameEvents.GAME_READY)
    eventBus.emit(GameEvents.GAME_START)
    eventBus.emit(GameEvents.UI_UPDATE_SCORE, 0)
    eventBus.emit(GameEvents.UI_UPDATE_HEALTH, this.player.health)
    eventBus.emit(GameEvents.UI_UPDATE_LIVES, this.player.lives)
    eventBus.emit(GameEvents.UI_UPDATE_WEAPON, this.player.weapon)
  }

  /**
   * 加载关卡
   * @param levelId 关卡ID
   */
  private loadLevel(levelId: number): void {
    const levelData = getLevelData(levelId)

    // 创建玩家
    this.player = new Player(
      this,
      levelData.playerStart.x,
      levelData.playerStart.y
    )

    // 加载关卡
    this.levelManager.loadLevel(levelData, this.player, this.enemyBullets)
  }

  /** 设置碰撞检测 */
  private setupCollisions(): void {
    this.collisionSystem.init(
      this.player,
      this.levelManager.platforms,
      this.playerBullets,
      this.enemyBullets,
      this.levelManager.enemies,
      this.levelManager.powerUps
    )
  }

  /** 设置事件监听 */
  private setupEventListeners(): void {
    // 监听玩家射击事件
    eventBus.on(GameEvents.PLAYER_SHOOT, (data: { x: number; y: number; direction: Direction; weapon: WeaponType }) => {
      this.createPlayerBullet(data.x, data.y, data.direction, data.weapon)
    })

    // 监听敌人射击事件
    eventBus.on(GameEvents.ENEMY_SHOOT, (data: { x: number; y: number; direction: Direction }) => {
      this.createEnemyBullet(data.x, data.y, data.direction)
    })

    // 监听敌人死亡事件
    eventBus.on(GameEvents.ENEMY_DEATH, (data: { score: number }) => {
      this.player.addScore(data.score)

      // 随机掉落道具
      this.maybeSpawnPowerUp()
    })

    // 监听游戏暂停
    eventBus.on(GameEvents.GAME_PAUSE, () => {
      this.gameStatus = GameStatus.PAUSED
      this.scene.pause()
    })

    // 监听游戏恢复
    eventBus.on(GameEvents.GAME_RESUME, () => {
      this.gameStatus = GameStatus.PLAYING
      this.scene.resume()
    })

    // 监听游戏结束
    eventBus.on(GameEvents.GAME_OVER, () => {
      this.gameStatus = GameStatus.GAME_OVER
    })
  }

  /**
   * 创建玩家子弹
   * @param x X坐标
   * @param y Y坐标
   * @param direction 发射方向
   * @param weapon 武器类型
   */
  private createPlayerBullet(
    x: number,
    y: number,
    direction: Direction,
    weapon: WeaponType
  ): void {
    // 创建子弹
    const bullet = new Bullet(this, x, y, direction, true, weapon)
    this.playerBullets.add(bullet.sprite)
    this.bulletEntities.push(bullet)
    bullet.activate()  // 添加到组后激活，设置速度

    // 散弹模式：额外发射两颗子弹
    if (weapon === WeaponType.SPREAD) {
      const bullet2 = new Bullet(this, x, y - 12, direction, true, weapon)
      this.playerBullets.add(bullet2.sprite)
      this.bulletEntities.push(bullet2)
      bullet2.activate()

      const bullet3 = new Bullet(this, x, y + 12, direction, true, weapon)
      this.playerBullets.add(bullet3.sprite)
      this.bulletEntities.push(bullet3)
      bullet3.activate()
    }
  }

  /**
   * 创建敌人子弹
   * @param x X坐标
   * @param y Y坐标
   * @param direction 发射方向
   */
  private createEnemyBullet(x: number, y: number, direction: Direction): void {
    const bullet = new Bullet(this, x, y, direction, false)
    this.enemyBullets.add(bullet.sprite)
    this.bulletEntities.push(bullet)
    bullet.activate()  // 添加到组后激活，设置速度
  }

  /** 随机生成道具（敌人死亡时） */
  private maybeSpawnPowerUp(): void {
    const chance = Math.random()
    if (chance > 0.3) return // 30% 概率掉落

    const types = [
      PowerUpType.RAPID_FIRE,
      PowerUpType.SPREAD,
      PowerUpType.LASER,
      PowerUpType.SHIELD,
    ]
    const randomType = types[Math.floor(Math.random() * types.length)]

    // 在玩家附近随机位置生成
    const x = this.player.sprite.x + (Math.random() - 0.5) * 200
    const y = this.player.sprite.y - 100 - Math.random() * 100

    // 确保在世界范围内
    const clampedX = Phaser.Math.Clamp(x, 50, WORLD_WIDTH - 50)
    const clampedY = Phaser.Math.Clamp(y, 100, GAME_HEIGHT - 100)

    // 创建道具并添加到管理器
    const powerUp = new PowerUp(this, clampedX, clampedY, randomType)
    this.levelManager.powerUps.add(powerUp.sprite)
  }

  /**
   * 游戏主循环 - 每帧调用
   * @param time 当前游戏时间
   * @param delta 帧间隔时间
   */
  update(time: number, delta: number): void {
    if (this.gameStatus !== GameStatus.PLAYING) return

    // 处理暂停输入
    if (this.inputSystem.isPause()) {
      this.gameStatus = GameStatus.PAUSED
      eventBus.emit(GameEvents.GAME_PAUSE)
      return
    }

    // 处理玩家输入
    this.handlePlayerInput()

    // 更新玩家
    this.player.update(time, delta)

    // 更新关卡（敌人等）
    this.levelManager.update(time, delta)

    // 更新所有子弹
    this.updateBullets(time)

    // 清理已销毁的子弹
    this.cleanupBullets()

    // 清理已销毁的关卡实体
    this.levelManager.cleanup()
  }

  /** 处理玩家输入 */
  private handlePlayerInput(): void {
    // 水平移动
    const moveDir = this.inputSystem.getHorizontalDirection()
    this.player.move(moveDir)

    // 跳跃
    if (this.inputSystem.isJump()) {
      this.player.jump()
    }

    // 射击
    if (this.inputSystem.isShoot()) {
      this.player.shoot()
    }
  }

  /**
   * 更新所有子弹
   * @param time 当前游戏时间
   */
  private updateBullets(time: number): void {
    this.bulletEntities.forEach((bullet) => {
      if (bullet.sprite.active) {
        bullet.update(time)
      }
    })
  }

  /** 清理已销毁的子弹引用 */
  private cleanupBullets(): void {
    this.bulletEntities = this.bulletEntities.filter(
      (bullet) => bullet.sprite.active
    )
  }

  /** 销毁场景时的清理 */
  shutdown(): void {
    // 移除事件监听
    eventBus.off(GameEvents.PLAYER_SHOOT)
    eventBus.off(GameEvents.ENEMY_SHOOT)
    eventBus.off(GameEvents.ENEMY_DEATH)
    eventBus.off(GameEvents.GAME_PAUSE)
    eventBus.off(GameEvents.GAME_RESUME)
    eventBus.off(GameEvents.GAME_OVER)

    // 销毁实体
    this.player.destroy()
    this.levelManager.destroy()
    this.audioManager.destroy()
    this.assetManager.destroy()

    // 清理子弹
    this.bulletEntities.forEach((b) => b.destroy())
    this.bulletEntities = []
  }
}
