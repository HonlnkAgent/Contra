/**
 * 预加载场景 - 加载和生成所有游戏资源
 * 当前版本用 Phaser Graphics 生成像素风纹理和基础逐帧动画。
 */
import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/GameConstants'

type SoldierPalette = {
  body: number
  vest: number
  helmet: number
  trim: number
  skin: number
  weapon: number
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload(): void {
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

    this.generateTextures()
  }

  /** 生成像素风纹理和基础动画帧 */
  private generateTextures(): void {
    this.generatePlayerTextures()
    this.generateEnemyTextures()
    this.generateBossTextures()
    this.generateBulletTextures()
    this.generatePlatformTextures()
    this.generatePowerUpTextures()
    this.generateParticleTexture()
  }

  private makeCanvasTexture(
    key: string,
    width: number,
    height: number,
    draw: (gfx: Phaser.GameObjects.Graphics) => void
  ): void {
    if (this.textures.exists(key)) return
    const gfx = this.make.graphics({ x: 0, y: 0, add: false })
    draw(gfx)
    gfx.generateTexture(key, width, height)
    gfx.destroy()
  }

  private rect(
    gfx: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    alpha: number = 1
  ): void {
    gfx.fillStyle(color, alpha)
    gfx.fillRect(x, y, width, height)
  }

  private outline(gfx: Phaser.GameObjects.Graphics, width: number, height: number): void {
    gfx.lineStyle(2, 0x0b1020, 0.95)
    gfx.strokeRect(1, 1, width - 2, height - 2)
  }

  private generatePlayerTextures(): void {
    const palette: SoldierPalette = {
      body: 0x3f82ff,
      vest: 0x214ca3,
      helmet: 0x71a8ff,
      trim: 0xffffff,
      skin: 0xffc18a,
      weapon: 0xb8c0c8,
    }

    this.drawSoldierFrame('player', palette, 'idle', 0)
    this.drawSoldierFrame('player_idle_0', palette, 'idle', 0)
    this.drawSoldierFrame('player_idle_1', palette, 'idle', 1)
    this.drawSoldierFrame('player_run_0', palette, 'run', 0)
    this.drawSoldierFrame('player_run_1', palette, 'run', 1)
    this.drawSoldierFrame('player_jump_0', palette, 'jump', 0)
    this.drawSoldierFrame('player_shoot_0', palette, 'shoot', 0)
    this.drawSoldierFrame('player_hurt_0', { ...palette, body: 0xff6666 }, 'hurt', 0)
  }

  private generateEnemyTextures(): void {
    const enemies: Array<{ key: string; palette: SoldierPalette; gear?: string }> = [
      { key: 'enemy_soldier', palette: { body: 0xff4848, vest: 0x8f1515, helmet: 0xff8a8a, trim: 0xffffff, skin: 0xffc18a, weapon: 0x222222 } },
      { key: 'enemy_machine_gunner', palette: { body: 0xff8a22, vest: 0x8d4108, helmet: 0xffbd68, trim: 0xffffff, skin: 0xffc18a, weapon: 0x222222 }, gear: 'heavyGun' },
      { key: 'enemy_jumper', palette: { body: 0xb847ff, vest: 0x5b168a, helmet: 0xde9dff, trim: 0xffffff, skin: 0xffc18a, weapon: 0x222222 } },
      { key: 'enemy_flame', palette: { body: 0xff3600, vest: 0x7c1400, helmet: 0xffa84d, trim: 0xffe066, skin: 0xffc18a, weapon: 0x333333 }, gear: 'flame' },
      { key: 'enemy_sniper', palette: { body: 0x2bbf5a, vest: 0x145c2d, helmet: 0x83df98, trim: 0xd5ffd7, skin: 0xffc18a, weapon: 0x1d1d1d }, gear: 'rifle' },
      { key: 'enemy_bomber', palette: { body: 0xffd21c, vest: 0x9e7310, helmet: 0xffef88, trim: 0xffffff, skin: 0xffc18a, weapon: 0x5a1b1b }, gear: 'bomb' },
      { key: 'enemy_flyer', palette: { body: 0x2a9dff, vest: 0x155885, helmet: 0x8fd4ff, trim: 0xffffff, skin: 0xffc18a, weapon: 0x222222 }, gear: 'jetpack' },
      { key: 'enemy_shield', palette: { body: 0x9a9a9a, vest: 0x494949, helmet: 0xd8d8d8, trim: 0xffffff, skin: 0xffc18a, weapon: 0x222222 }, gear: 'shield' },
    ]

    enemies.forEach(({ key, palette, gear }) => {
      this.drawSoldierFrame(key, palette, 'idle', 0, gear)
      this.drawSoldierFrame(`${key}_walk_0`, palette, 'run', 0, gear)
      this.drawSoldierFrame(`${key}_walk_1`, palette, 'run', 1, gear)
      this.drawSoldierFrame(`${key}_attack_0`, palette, 'shoot', 0, gear)
      this.drawSoldierFrame(`${key}_hurt_0`, { ...palette, body: 0xffffff, vest: palette.body }, 'hurt', 0, gear)
    })
  }

  private drawSoldierFrame(
    key: string,
    palette: SoldierPalette,
    pose: 'idle' | 'run' | 'jump' | 'shoot' | 'hurt',
    frame: number,
    gear?: string
  ): void {
    this.makeCanvasTexture(key, 40, 48, (gfx) => {
      const bob = pose === 'run' && frame === 1 ? 1 : 0
      const legA = pose === 'run' && frame === 1 ? 2 : 0
      const legB = pose === 'run' && frame === 1 ? -2 : 0
      const armRaise = pose === 'shoot' ? -4 : 0

      this.rect(gfx, 16, 3 + bob, 14, 10, palette.helmet)
      this.rect(gfx, 18, 7 + bob, 10, 8, palette.skin)
      this.rect(gfx, 15, 14 + bob, 16, 17, palette.body)
      this.rect(gfx, 18, 16 + bob, 10, 13, palette.vest)
      this.rect(gfx, 13, 18 + armRaise + bob, 5, 14, palette.body)
      this.rect(gfx, 29, 18 + armRaise + bob, 5, 14, palette.body)
      this.rect(gfx, 17 + legA, 31, 5, 14, palette.body)
      this.rect(gfx, 25 + legB, 31, 5, 14, palette.body)
      this.rect(gfx, 14 + legA, 43, 9, 3, 0x111111)
      this.rect(gfx, 24 + legB, 43, 9, 3, 0x111111)
      this.rect(gfx, 29, 20 + armRaise + bob, 9, 3, palette.weapon)
      this.rect(gfx, 36, 19 + armRaise + bob, 4, 2, palette.weapon)
      this.rect(gfx, 22, 9 + bob, 2, 2, 0x0b1020)
      this.rect(gfx, 15, 3 + bob, 16, 3, palette.trim, 0.8)

      if (gear === 'heavyGun') {
        this.rect(gfx, 31, 18 + bob, 9, 5, 0x0d0d0d)
      } else if (gear === 'flame') {
        this.rect(gfx, 31, 20 + bob, 8, 5, 0xffe066)
        this.rect(gfx, 37, 18 + bob, 3, 8, 0xff5a00)
      } else if (gear === 'rifle') {
        this.rect(gfx, 30, 19 + bob, 12, 2, 0x1d1d1d)
        this.rect(gfx, 40, 18 + bob, 3, 1, 0xeeeeee)
      } else if (gear === 'bomb') {
        this.rect(gfx, 11, 16 + bob, 4, 10, 0x5a1b1b)
        this.rect(gfx, 12, 14 + bob, 2, 2, 0xff3300)
      } else if (gear === 'jetpack') {
        this.rect(gfx, 9, 16 + bob, 6, 18, 0x263f66)
        this.rect(gfx, 10, 34 + bob, 4, 8, 0xffcc33)
      } else if (gear === 'shield') {
        this.rect(gfx, 5, 17 + bob, 10, 20, 0xcfd7df)
        this.rect(gfx, 8, 20 + bob, 4, 14, 0x56606a)
      }

      if (pose === 'jump') {
        this.rect(gfx, 10, 36, 6, 4, palette.trim)
      }

      this.outline(gfx, 40, 48)
    })
  }

  private generateBossTextures(): void {
    this.makeCanvasTexture('boss_helicopter', 80, 48, (gfx) => {
      this.rect(gfx, 14, 18, 42, 16, COLORS.BOSS_HELICOPTER)
      this.rect(gfx, 44, 15, 16, 10, 0xff7777)
      this.rect(gfx, 57, 22, 18, 4, 0x333333)
      this.rect(gfx, 2, 14, 22, 4, 0xcccccc)
      this.rect(gfx, 20, 6, 42, 3, 0xcccccc)
      this.rect(gfx, 36, 2, 4, 11, 0xcccccc)
      this.rect(gfx, 23, 34, 6, 7, 0x222222)
      this.rect(gfx, 44, 34, 6, 7, 0x222222)
      this.rect(gfx, 22, 21, 8, 5, 0x9fd7ff)
      this.outline(gfx, 80, 48)
    })

    this.makeCanvasTexture('boss_mecha', 64, 72, (gfx) => {
      this.rect(gfx, 19, 6, 26, 16, 0xaa1111)
      this.rect(gfx, 14, 22, 36, 28, COLORS.BOSS_MECHA)
      this.rect(gfx, 8, 25, 9, 24, 0x440000)
      this.rect(gfx, 48, 25, 9, 24, 0x440000)
      this.rect(gfx, 20, 50, 8, 18, 0x440000)
      this.rect(gfx, 36, 50, 8, 18, 0x440000)
      this.rect(gfx, 25, 12, 4, 4, 0xffee66)
      this.rect(gfx, 35, 12, 4, 4, 0xffee66)
      this.rect(gfx, 48, 31, 14, 5, 0x222222)
      this.outline(gfx, 64, 72)
    })

    this.makeCanvasTexture('boss_nest', 80, 80, (gfx) => {
      this.rect(gfx, 18, 16, 44, 48, COLORS.BOSS_NEST)
      this.rect(gfx, 25, 24, 30, 32, 0x771177)
      this.rect(gfx, 33, 31, 14, 14, 0xff55ff)
      this.rect(gfx, 8, 35, 14, 8, 0x662266)
      this.rect(gfx, 58, 35, 14, 8, 0x662266)
      this.rect(gfx, 12, 58, 12, 6, 0x884488)
      this.rect(gfx, 56, 58, 12, 6, 0x884488)
      this.rect(gfx, 37, 45, 6, 16, 0x220022)
      this.outline(gfx, 80, 80)
    })
  }

  private generateBulletTextures(): void {
    this.makeCanvasTexture('bullet_player', 12, 6, (gfx) => {
      this.rect(gfx, 0, 2, 9, 2, COLORS.PLAYER_BULLET)
      this.rect(gfx, 8, 1, 4, 4, 0xffffff)
    })

    this.makeCanvasTexture('bullet_enemy', 10, 6, (gfx) => {
      this.rect(gfx, 1, 2, 7, 2, COLORS.ENEMY_BULLET)
      this.rect(gfx, 7, 1, 3, 4, 0xffcc66)
    })
  }

  private generatePlatformTextures(): void {
    this.makeCanvasTexture('platform', 32, 32, (gfx) => {
      this.rect(gfx, 0, 0, 32, 32, 0x555b61)
      this.rect(gfx, 0, 0, 32, 6, 0x8a8f94)
      this.rect(gfx, 2, 8, 28, 3, 0x70767b)
      this.rect(gfx, 3, 16, 26, 2, 0x41464a)
      this.rect(gfx, 5, 24, 22, 2, 0x41464a)
      gfx.lineStyle(1, 0x2a2f33, 0.8)
      gfx.strokeRect(0, 0, 32, 32)
    })
  }

  private generatePowerUpTextures(): void {
    const powerUpTypes = [
      { key: 'powerup_rapid', color: COLORS.POWER_UP_RAPID, mark: 'rapid' },
      { key: 'powerup_spread', color: COLORS.POWER_UP_SPREAD, mark: 'spread' },
      { key: 'powerup_laser', color: COLORS.POWER_UP_LASER, mark: 'laser' },
      { key: 'powerup_life', color: COLORS.POWER_UP_LIFE, mark: 'life' },
      { key: 'powerup_shield', color: COLORS.POWER_UP_SHIELD, mark: 'shield' },
    ]

    powerUpTypes.forEach(({ key, color, mark }) => {
      this.makeCanvasTexture(key, 24, 24, (gfx) => {
        this.rect(gfx, 2, 2, 20, 20, color)
        this.rect(gfx, 5, 5, 14, 14, 0x101020, 0.35)
        gfx.lineStyle(2, 0xffffff, 1)
        gfx.strokeRect(2, 2, 20, 20)
        gfx.lineStyle(1, 0x111111, 1)
        gfx.strokeRect(0, 0, 24, 24)
        this.drawPowerUpMark(gfx, mark)
      })
    })
  }

  private drawPowerUpMark(gfx: Phaser.GameObjects.Graphics, mark: string): void {
    const c = 0xffffff
    if (mark === 'rapid') {
      this.rect(gfx, 8, 6, 3, 12, c)
      this.rect(gfx, 11, 6, 5, 3, c)
      this.rect(gfx, 11, 11, 5, 3, c)
      this.rect(gfx, 14, 14, 3, 4, c)
    } else if (mark === 'spread') {
      this.rect(gfx, 8, 6, 9, 3, c)
      this.rect(gfx, 8, 6, 3, 6, c)
      this.rect(gfx, 8, 12, 9, 3, c)
      this.rect(gfx, 14, 12, 3, 6, c)
      this.rect(gfx, 8, 15, 9, 3, c)
    } else if (mark === 'laser') {
      this.rect(gfx, 8, 6, 3, 12, c)
      this.rect(gfx, 8, 15, 9, 3, c)
    } else if (mark === 'life') {
      this.rect(gfx, 11, 6, 3, 12, c)
      this.rect(gfx, 7, 10, 11, 3, c)
    } else {
      this.rect(gfx, 8, 6, 9, 3, c)
      this.rect(gfx, 8, 6, 3, 9, c)
      this.rect(gfx, 14, 6, 3, 9, c)
      this.rect(gfx, 10, 15, 5, 3, c)
    }
  }

  private generateParticleTexture(): void {
    this.makeCanvasTexture('particle', 8, 8, (gfx) => {
      gfx.fillStyle(0xffffff, 1)
      gfx.fillCircle(4, 4, 4)
    })
  }

  create(): void {
    this.scene.start('GameScene')
  }
}
