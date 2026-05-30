/**
 * 预加载场景 - 加载所有游戏资源
 * 使用简单几何图形作为临时精灵（后续替换为像素画资源）
 */
import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/GameConstants'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload(): void {
    // 创建加载进度条
    const barBg = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      300,
      25,
      0x333333
    )
    barBg.setStrokeStyle(2, 0xffffff)

    const bar = this.add.rectangle(
      GAME_WIDTH / 2 - 148,
      GAME_HEIGHT / 2,
      0,
      21,
      0x00ff00
    )
    bar.setOrigin(0, 0.5)

    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '加载资源...', {
      fontSize: '14px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#00ff00',
    })
    loadingText.setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      bar.width = 296 * value
    })

    // 使用 Phaser Graphics API 生成临时纹理
    this.generateTextures()
  }

  /** 使用 Graphics API 生成临时精灵纹理 */
  private generateTextures(): void {
    // 玩家精灵 (蓝色矩形)
    const playerGfx = this.make.graphics({ x: 0, y: 0, add: false })
    playerGfx.fillStyle(COLORS.PLAYER, 1)
    playerGfx.fillRect(0, 0, 32, 48)
    playerGfx.lineStyle(2, 0xffffff, 1)
    playerGfx.strokeRect(0, 0, 32, 48)
    // 画头部（小矩形）
    playerGfx.fillStyle(0x6699ff, 1)
    playerGfx.fillRect(6, 2, 20, 14)
    playerGfx.generateTexture('player', 32, 48)
    playerGfx.destroy()

    // 敌人士兵（红色矩形）
    const soldierGfx = this.make.graphics({ x: 0, y: 0, add: false })
    soldierGfx.fillStyle(COLORS.ENEMY_SOLDIER, 1)
    soldierGfx.fillRect(0, 0, 32, 48)
    soldierGfx.lineStyle(2, 0xffffff, 1)
    soldierGfx.strokeRect(0, 0, 32, 48)
    soldierGfx.fillStyle(0xff8888, 1)
    soldierGfx.fillRect(6, 2, 20, 14)
    soldierGfx.generateTexture('enemy_soldier', 32, 48)
    soldierGfx.destroy()

    // 机枪手（橙色矩形）
    const mgGfx = this.make.graphics({ x: 0, y: 0, add: false })
    mgGfx.fillStyle(COLORS.ENEMY_MACHINE_GUNNER, 1)
    mgGfx.fillRect(0, 0, 32, 48)
    mgGfx.lineStyle(2, 0xffffff, 1)
    mgGfx.strokeRect(0, 0, 32, 48)
    mgGfx.fillStyle(0xffaa44, 1)
    mgGfx.fillRect(6, 2, 20, 14)
    // 画机枪
    mgGfx.fillStyle(0xaaaaaa, 1)
    mgGfx.fillRect(24, 20, 12, 4)
    mgGfx.generateTexture('enemy_machine_gunner', 44, 48)
    mgGfx.destroy()

    // 跳跃兵（紫色矩形）
    const jumperGfx = this.make.graphics({ x: 0, y: 0, add: false })
    jumperGfx.fillStyle(COLORS.ENEMY_JUMPER, 1)
    jumperGfx.fillRect(0, 0, 32, 48)
    jumperGfx.lineStyle(2, 0xffffff, 1)
    jumperGfx.strokeRect(0, 0, 32, 48)
    jumperGfx.fillStyle(0xff44ff, 1)
    jumperGfx.fillRect(6, 2, 20, 14)
    jumperGfx.generateTexture('enemy_jumper', 32, 48)
    jumperGfx.destroy()

    // 玩家子弹（黄色小圆）
    const bulletGfx = this.make.graphics({ x: 0, y: 0, add: false })
    bulletGfx.fillStyle(COLORS.PLAYER_BULLET, 1)
    bulletGfx.fillCircle(4, 2, 4)
    bulletGfx.generateTexture('bullet_player', 8, 4)
    bulletGfx.destroy()

    // 敌人子弹（橙色小圆）
    const eBulletGfx = this.make.graphics({ x: 0, y: 0, add: false })
    eBulletGfx.fillStyle(COLORS.ENEMY_BULLET, 1)
    eBulletGfx.fillCircle(3, 2, 3)
    eBulletGfx.generateTexture('bullet_enemy', 6, 4)
    eBulletGfx.destroy()

    // 平台纹理（灰色矩形）
    const platGfx = this.make.graphics({ x: 0, y: 0, add: false })
    platGfx.fillStyle(COLORS.PLATFORM, 1)
    platGfx.fillRect(0, 0, 32, 32)
    platGfx.lineStyle(1, 0x888888, 0.5)
    platGfx.strokeRect(0, 0, 32, 32)
    platGfx.generateTexture('platform', 32, 32)
    platGfx.destroy()

    // 道具纹理（各颜色矩形）
    const powerUpTypes = [
      { key: 'powerup_rapid', color: COLORS.POWER_UP_RAPID },
      { key: 'powerup_spread', color: COLORS.POWER_UP_SPREAD },
      { key: 'powerup_laser', color: COLORS.POWER_UP_LASER },
      { key: 'powerup_life', color: COLORS.POWER_UP_LIFE },
      { key: 'powerup_shield', color: COLORS.POWER_UP_SHIELD },
    ]

    powerUpTypes.forEach(({ key, color }) => {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false })
      gfx.fillStyle(color, 1)
      gfx.fillRect(0, 0, 24, 24)
      gfx.lineStyle(2, 0xffffff, 1)
      gfx.strokeRect(0, 0, 24, 24)
      // 画一个十字标记
      gfx.fillStyle(0xffffff, 0.8)
      gfx.fillRect(10, 4, 4, 16)
      gfx.fillRect(4, 10, 16, 4)
      gfx.generateTexture(key, 24, 24)
      gfx.destroy()
    })

    // 爆炸粒子
    const particleGfx = this.make.graphics({ x: 0, y: 0, add: false })
    particleGfx.fillStyle(0xffffff, 1)
    particleGfx.fillCircle(4, 4, 4)
    particleGfx.generateTexture('particle', 8, 8)
    particleGfx.destroy()
  }

  create(): void {
    // 所有资源加载完成后跳转到游戏场景
    this.scene.start('GameScene')
  }
}
