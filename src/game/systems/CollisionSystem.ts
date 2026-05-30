/**
 * 碰撞检测系统 - 使用 Phaser Arcade 物理引擎
 * 管理游戏中所有碰撞和重叠检测
 */
import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Bullet } from '../entities/Bullet'
import { Enemy } from '../entities/Enemy'
import { PowerUp } from '../entities/PowerUp'
import { eventBus, GameEvents } from '../../utils/EventBus'
import { COLORS } from '../config/GameConstants'

export class CollisionSystem {
  private scene: Phaser.Scene
  private player!: Player
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private playerBullets!: Phaser.Physics.Arcade.Group
  private enemyBullets!: Phaser.Physics.Arcade.Group
  private enemies!: Phaser.Physics.Arcade.Group
  private powerUps!: Phaser.Physics.Arcade.Group

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * 初始化碰撞检测
   * 注册所有需要检测碰撞的实体组
   */
  init(
    player: Player,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    playerBullets: Phaser.Physics.Arcade.Group,
    enemyBullets: Phaser.Physics.Arcade.Group,
    enemies: Phaser.Physics.Arcade.Group,
    powerUps: Phaser.Physics.Arcade.Group
  ): void {
    this.player = player
    this.platforms = platforms
    this.playerBullets = playerBullets
    this.enemyBullets = enemyBullets
    this.enemies = enemies
    this.powerUps = powerUps
    this.setupCollisions()
  }

  /** 设置所有碰撞回调 */
  private setupCollisions(): void {
    // 玩家与平台碰撞
    this.scene.physics.add.collider(this.player.sprite, this.platforms)

    // 敌人与平台碰撞
    this.scene.physics.add.collider(this.enemies, this.platforms)

    // 玩家子弹与平台碰撞（销毁子弹）
    this.scene.physics.add.collider(
      this.playerBullets,
      this.platforms,
      this.onBulletHitPlatform,
      undefined,
      this
    )

    // 敌人子弹与平台碰撞（销毁子弹）
    this.scene.physics.add.collider(
      this.enemyBullets,
      this.platforms,
      this.onBulletHitPlatform,
      undefined,
      this
    )

    // 玩家子弹与敌人碰撞
    this.scene.physics.add.overlap(
      this.playerBullets,
      this.enemies,
      this.onPlayerBulletHitEnemy,
      undefined,
      this
    )

    // 敌人子弹与玩家碰撞
    this.scene.physics.add.overlap(
      this.player.sprite,
      this.enemyBullets,
      this.onEnemyBulletHitPlayer,
      undefined,
      this
    )

    // 玩家与敌人碰撞
    this.scene.physics.add.overlap(
      this.player.sprite,
      this.enemies,
      this.onPlayerHitEnemy,
      undefined,
      this
    )

    // 玩家与道具碰撞
    this.scene.physics.add.overlap(
      this.player.sprite,
      this.powerUps,
      this.onPlayerCollectPowerUp,
      undefined,
      this
    )
  }

  /** 子弹击中平台 */
  private onBulletHitPlatform(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _platform: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const bullet = bulletObj as Phaser.Physics.Arcade.Sprite
    const bulletEntity = bullet.getData('entity') as Bullet | undefined
    if (bulletEntity) {
      bulletEntity.destroy()
    } else {
      bullet.destroy()
    }
  }

  /** 玩家子弹击中敌人 */
  private onPlayerBulletHitEnemy(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const bullet = bulletObj as Phaser.Physics.Arcade.Sprite
    const enemySprite = enemyObj as Phaser.Physics.Arcade.Sprite
    const bulletEntity = bullet.getData('entity') as Bullet | undefined
    const enemyEntity = enemySprite.getData('entity') as Enemy | undefined

    if (bulletEntity && enemyEntity) {
      const damage = bulletEntity.damage
      bulletEntity.destroy()
      enemyEntity.takeDamage(damage)
    } else {
      bullet.destroy()
    }
  }

  /** 敌人子弹击中玩家 */
  private onEnemyBulletHitPlayer(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const bullet = bulletObj as Phaser.Physics.Arcade.Sprite
    const bulletEntity = bullet.getData('entity') as Bullet | undefined

    if (this.player.isInvincible) {
      if (bulletEntity) bulletEntity.destroy()
      return
    }

    if (bulletEntity) {
      const damage = bulletEntity.damage
      bulletEntity.destroy()
      this.player.takeDamage(damage)
      eventBus.emit(GameEvents.PLAYER_HURT, damage)
    }
  }

  /** 玩家与敌人直接碰撞 */
  private onPlayerHitEnemy(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    if (this.player.isInvincible) return

    this.player.takeDamage(20)
    eventBus.emit(GameEvents.PLAYER_HURT, 20)
  }

  /** 玩家拾取道具 */
  private onPlayerCollectPowerUp(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    powerUpObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const powerUpSprite = powerUpObj as Phaser.Physics.Arcade.Sprite
    const powerUpEntity = powerUpSprite.getData('entity') as PowerUp | undefined

    if (powerUpEntity) {
      powerUpEntity.collect(this.player)
    }
  }
}
