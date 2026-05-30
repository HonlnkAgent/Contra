/**
 * 场景管理器 - 负责无限模式下场景切换和生成
 * 管理5种不同场景类型的背景和平台生成
 * 支持按概率随机选择场景类型
 */
import Phaser from 'phaser'
import { PlatformData } from '../../types/game'
import { GAME_WIDTH, GAME_HEIGHT, WORLD_WIDTH, SCENES } from '../config/GameConstants'
import { eventBus, GameEvents } from '../../utils/EventBus'

/** 场景类型枚举 */
export enum SceneType {
  MILITARY_BASE = 'military_base',
  JUNGLE = 'jungle',
  DESERT = 'desert',
  SNOW = 'snow',
  ALIEN = 'alien',
}

/** 场景配置接口 */
interface SceneConfig {
  name: string
  background: {
    topColor: number
    bottomColor: number
    parallaxColor: number
    parallaxFactor: number
  }
  platformConfig: {
    minHeight: number
    maxHeight: number
    minWidth: number
    maxWidth: number
    density: number
  }
  enemySpawnRate: number
  probability: number
}

export class SceneManager {
  private scene: Phaser.Scene
  private currentSceneType: SceneType = SceneType.MILITARY_BASE

  /** 场景类型配置 */
  private sceneConfigs: Map<SceneType, SceneConfig> = new Map([
    [SceneType.MILITARY_BASE, {
      name: SCENES.MILITARY_BASE.name,
      background: {
        topColor: SCENES.MILITARY_BASE.topColor,
        bottomColor: SCENES.MILITARY_BASE.bottomColor,
        parallaxColor: SCENES.MILITARY_BASE.parallaxColor,
        parallaxFactor: 0.3,
      },
      platformConfig: {
        minHeight: SCENES.MILITARY_BASE.platformMinHeight,
        maxHeight: SCENES.MILITARY_BASE.platformMaxHeight,
        minWidth: SCENES.MILITARY_BASE.platformMinWidth,
        maxWidth: SCENES.MILITARY_BASE.platformMaxWidth,
        density: SCENES.MILITARY_BASE.platformDensity,
      },
      enemySpawnRate: 1.0,
      probability: SCENES.MILITARY_BASE.probability,
    }],
    [SceneType.JUNGLE, {
      name: SCENES.JUNGLE.name,
      background: {
        topColor: SCENES.JUNGLE.topColor,
        bottomColor: SCENES.JUNGLE.bottomColor,
        parallaxColor: SCENES.JUNGLE.parallaxColor,
        parallaxFactor: 0.4,
      },
      platformConfig: {
        minHeight: SCENES.JUNGLE.platformMinHeight,
        maxHeight: SCENES.JUNGLE.platformMaxHeight,
        minWidth: SCENES.JUNGLE.platformMinWidth,
        maxWidth: SCENES.JUNGLE.platformMaxWidth,
        density: SCENES.JUNGLE.platformDensity,
      },
      enemySpawnRate: 1.1,
      probability: SCENES.JUNGLE.probability,
    }],
    [SceneType.DESERT, {
      name: SCENES.DESERT.name,
      background: {
        topColor: SCENES.DESERT.topColor,
        bottomColor: SCENES.DESERT.bottomColor,
        parallaxColor: SCENES.DESERT.parallaxColor,
        parallaxFactor: 0.5,
      },
      platformConfig: {
        minHeight: SCENES.DESERT.platformMinHeight,
        maxHeight: SCENES.DESERT.platformMaxHeight,
        minWidth: SCENES.DESERT.platformMinWidth,
        maxWidth: SCENES.DESERT.platformMaxWidth,
        density: SCENES.DESERT.platformDensity,
      },
      enemySpawnRate: 0.9,
      probability: SCENES.DESERT.probability,
    }],
    [SceneType.SNOW, {
      name: SCENES.SNOW.name,
      background: {
        topColor: SCENES.SNOW.topColor,
        bottomColor: SCENES.SNOW.bottomColor,
        parallaxColor: SCENES.SNOW.parallaxColor,
        parallaxFactor: 0.35,
      },
      platformConfig: {
        minHeight: SCENES.SNOW.platformMinHeight,
        maxHeight: SCENES.SNOW.platformMaxHeight,
        minWidth: SCENES.SNOW.platformMinWidth,
        maxWidth: SCENES.SNOW.platformMaxWidth,
        density: SCENES.SNOW.platformDensity,
      },
      enemySpawnRate: 1.0,
      probability: SCENES.SNOW.probability,
    }],
    [SceneType.ALIEN, {
      name: SCENES.ALIEN.name,
      background: {
        topColor: SCENES.ALIEN.topColor,
        bottomColor: SCENES.ALIEN.bottomColor,
        parallaxColor: SCENES.ALIEN.parallaxColor,
        parallaxFactor: 0.45,
      },
      platformConfig: {
        minHeight: SCENES.ALIEN.platformMinHeight,
        maxHeight: SCENES.ALIEN.platformMaxHeight,
        minWidth: SCENES.ALIEN.platformMinWidth,
        maxWidth: SCENES.ALIEN.platformMaxWidth,
        density: SCENES.ALIEN.platformDensity,
      },
      enemySpawnRate: 1.2,
      probability: SCENES.ALIEN.probability,
    }],
  ])

  /**
   * 构造函数
   * @param scene 场景引用
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * 按概率随机选择下一个场景类型
   * @returns 新的场景类型
   */
  switchScene(): SceneType {
    const newSceneType = this.getRandomSceneType()
    this.currentSceneType = newSceneType

    // 发送场景切换事件
    const config = this.sceneConfigs.get(newSceneType)
    eventBus.emit(GameEvents.UI_UPDATE_SCENE, {
      sceneType: newSceneType,
      sceneName: config?.name || '未知区域',
    })

    return newSceneType
  }

  /**
   * 按概率随机选择场景类型
   * @returns 场景类型
   */
  private getRandomSceneType(): SceneType {
    const rand = Math.random()
    let cumulative = 0

    for (const [sceneType, config] of this.sceneConfigs) {
      cumulative += config.probability
      if (rand <= cumulative) {
        // 避免连续相同场景
        if (sceneType === this.currentSceneType) {
          return this.getRandomSceneTypeDifferent()
        }
        return sceneType
      }
    }

    // 默认返回军事基地
    return SceneType.MILITARY_BASE
  }

  /**
   * 获取一个与当前场景不同的场景类型
   * @returns 不同的场景类型
   */
  private getRandomSceneTypeDifferent(): SceneType {
    const types = Array.from(this.sceneConfigs.keys()).filter(
      (t) => t !== this.currentSceneType
    )
    const rand = Math.random()
    let cumulative = 0
    const totalProb = types.reduce(
      (sum, t) => sum + (this.sceneConfigs.get(t)?.probability || 0),
      0
    )

    for (const sceneType of types) {
      const config = this.sceneConfigs.get(sceneType)
      if (config) {
        cumulative += config.probability / totalProb
        if (rand <= cumulative) {
          return sceneType
        }
      }
    }

    return types[0] || SceneType.MILITARY_BASE
  }

  /**
   * 渲染场景背景
   * @param sceneType 场景类型
   */
  renderBackground(sceneType: SceneType): void {
    const config = this.sceneConfigs.get(sceneType)
    if (!config) return

    // 清除之前的背景
    this.scene.children.each((child) => {
      if (child.getData('background')) {
        child.destroy()
      }
    })

    // 绘制渐变背景
    const bgGfx = this.scene.add.graphics()
    bgGfx.setScrollFactor(0)
    bgGfx.setDepth(-10)
    bgGfx.setData('background', true)

    const topColor = config.background.topColor
    const bottomColor = config.background.bottomColor

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

    // 绘制远景装饰
    this.renderBackgroundDecor(sceneType, config)
  }

  /**
   * 根据场景类型渲染不同的背景装饰
   * @param sceneType 场景类型
   * @param config 场景配置
   */
  private renderBackgroundDecor(sceneType: SceneType, config: SceneConfig): void {
    switch (sceneType) {
      case SceneType.MILITARY_BASE:
        this.renderMilitaryBaseDecor(config)
        break
      case SceneType.JUNGLE:
        this.renderJungleDecor(config)
        break
      case SceneType.DESERT:
        this.renderDesertDecor(config)
        break
      case SceneType.SNOW:
        this.renderSnowDecor(config)
        break
      case SceneType.ALIEN:
        this.renderAlienDecor(config)
        break
    }
  }

  /** 军事基地装饰 - 钢铁建筑轮廓 */
  private renderMilitaryBaseDecor(config: SceneConfig): void {
    const buildings = this.scene.add.graphics()
    buildings.setScrollFactor(0.3)
    buildings.setDepth(-5)
    buildings.setData('background', true)

    // 绘制建筑轮廓
    buildings.fillStyle(config.background.parallaxColor, 0.5)
    for (let i = 0; i < 6; i++) {
      const x = i * 150 + 20
      const height = 100 + Math.random() * 200
      const width = 60 + Math.random() * 80
      buildings.fillRect(x, GAME_HEIGHT - height - 50, width, height)

      // 窗户
      buildings.fillStyle(0xffff44, 0.3)
      for (let wy = 0; wy < height - 30; wy += 30) {
        for (let wx = 10; wx < width - 10; wx += 20) {
          buildings.fillRect(x + wx, GAME_HEIGHT - height - 50 + wy + 10, 8, 12)
        }
      }
      buildings.fillStyle(config.background.parallaxColor, 0.5)
    }

    // 地面装饰
    this.addStars(config, 15)
  }

  /** 丛林装饰 - 树木和灌木 */
  private renderJungleDecor(config: SceneConfig): void {
    const trees = this.scene.add.graphics()
    trees.setScrollFactor(0.35)
    trees.setDepth(-5)
    trees.setData('background', true)

    // 绘制树木剪影
    for (let i = 0; i < 8; i++) {
      const x = i * 110 + 30
      const trunkHeight = 120 + Math.random() * 150
      const crownRadius = 30 + Math.random() * 40

      // 树干
      trees.fillStyle(0x2d1a0a, 0.6)
      trees.fillRect(x + 10, GAME_HEIGHT - trunkHeight - 50, 12, trunkHeight)

      // 树冠
      trees.fillStyle(config.background.parallaxColor, 0.5)
      trees.fillCircle(x + 16, GAME_HEIGHT - trunkHeight - 50 - crownRadius * 0.5, crownRadius)
      trees.fillCircle(x + 16 - crownRadius * 0.4, GAME_HEIGHT - trunkHeight - 50, crownRadius * 0.7)
      trees.fillCircle(x + 16 + crownRadius * 0.4, GAME_HEIGHT - trunkHeight - 50, crownRadius * 0.7)
    }

    // 添加雾气效果
    const fog = this.scene.add.graphics()
    fog.setScrollFactor(0.15)
    fog.setDepth(-6)
    fog.setData('background', true)
    fog.fillStyle(0x88aa88, 0.1)
    for (let i = 0; i < 5; i++) {
      const fogX = i * 200
      const fogY = GAME_HEIGHT - 200 + Math.random() * 100
      fog.fillEllipse(fogX + 100, fogY, 300, 40)
    }
  }

  /** 沙漠装饰 - 沙丘和仙人掌 */
  private renderDesertDecor(config: SceneConfig): void {
    const dunes = this.scene.add.graphics()
    dunes.setScrollFactor(0.3)
    dunes.setDepth(-5)
    dunes.setData('background', true)

    // 绘制沙丘
    dunes.fillStyle(config.background.parallaxColor, 0.4)
    const dunePoints: Phaser.Math.Vector2[] = []
    for (let x = 0; x < GAME_WIDTH + 200; x += 30) {
      const y = GAME_HEIGHT - 180 + Math.sin(x * 0.005) * 60 + Math.cos(x * 0.012) * 30
      dunePoints.push(new Phaser.Math.Vector2(x, y))
    }
    dunePoints.push(new Phaser.Math.Vector2(GAME_WIDTH + 200, GAME_HEIGHT))
    dunePoints.push(new Phaser.Math.Vector2(0, GAME_HEIGHT))
    dunes.fillPoints(dunePoints, true)

    // 绘制仙人掌
    dunes.fillStyle(0x2d6b2d, 0.6)
    for (let i = 0; i < 4; i++) {
      const cx = i * 200 + 80
      const cactusHeight = 40 + Math.random() * 30
      dunes.fillRect(cx, GAME_HEIGHT - 200 - cactusHeight, 8, cactusHeight)
      dunes.fillRect(cx - 10, GAME_HEIGHT - 200 - cactusHeight * 0.7, 8, 20)
      dunes.fillRect(cx + 8, GAME_HEIGHT - 200 - cactusHeight * 0.5, 8, 15)
    }

    this.addStars(config, 10)
  }

  /** 雪山装饰 - 山峰和雪花 */
  private renderSnowDecor(config: SceneConfig): void {
    const mountains = this.scene.add.graphics()
    mountains.setScrollFactor(0.3)
    mountains.setDepth(-5)
    mountains.setData('background', true)

    // 绘制雪山
    for (let i = 0; i < 4; i++) {
      const mx = i * 220 + 50
      const peakHeight = 200 + Math.random() * 150
      const baseWidth = 180 + Math.random() * 100

      // 山体
      mountains.fillStyle(0x8899aa, 0.5)
      mountains.fillTriangle(
        mx, GAME_HEIGHT - 50,
        mx + baseWidth / 2, GAME_HEIGHT - 50 - peakHeight,
        mx + baseWidth, GAME_HEIGHT - 50
      )

      // 雪顶
      mountains.fillStyle(0xeeeeff, 0.6)
      mountains.fillTriangle(
        mx + baseWidth * 0.3, GAME_HEIGHT - 50 - peakHeight * 0.6,
        mx + baseWidth / 2, GAME_HEIGHT - 50 - peakHeight,
        mx + baseWidth * 0.7, GAME_HEIGHT - 50 - peakHeight * 0.6
      )
    }

    // 雪花效果
    const snow = this.scene.add.graphics()
    snow.setScrollFactor(0.1)
    snow.setDepth(-7)
    snow.setData('background', true)
    snow.fillStyle(0xffffff, 0.7)
    for (let i = 0; i < 40; i++) {
      const sx = Math.random() * GAME_WIDTH
      const sy = Math.random() * GAME_HEIGHT
      snow.fillCircle(sx, sy, 1 + Math.random() * 2)
    }
  }

  /** 异形巢穴装饰 - 有机物和孢子 */
  private renderAlienDecor(config: SceneConfig): void {
    const organic = this.scene.add.graphics()
    organic.setScrollFactor(0.35)
    organic.setDepth(-5)
    organic.setData('background', true)

    // 细长的有机柱
    organic.fillStyle(config.background.parallaxColor, 0.5)
    for (let i = 0; i < 7; i++) {
      const px = i * 120 + 40
      const pillarHeight = 150 + Math.random() * 200
      const topWidth = 8 + Math.random() * 15
      const bottomWidth = 20 + Math.random() * 25

      organic.fillTriangle(
        px - bottomWidth / 2, GAME_HEIGHT - 50,
        px, GAME_HEIGHT - 50 - pillarHeight,
        px + bottomWidth / 2, GAME_HEIGHT - 50
      )

      // 顶部发光体
      organic.fillStyle(0xff44ff, 0.3)
      organic.fillCircle(px, GAME_HEIGHT - 50 - pillarHeight, topWidth)
      organic.fillStyle(config.background.parallaxColor, 0.5)
    }

    // 孢子/粒子效果
    const spores = this.scene.add.graphics()
    spores.setScrollFactor(0.15)
    spores.setDepth(-7)
    spores.setData('background', true)
    for (let i = 0; i < 25; i++) {
      const sx = Math.random() * GAME_WIDTH
      const sy = Math.random() * GAME_HEIGHT
      const size = 2 + Math.random() * 3
      spores.fillStyle(0xff66ff, 0.2 + Math.random() * 0.3)
      spores.fillCircle(sx, sy, size)
    }
  }

  /** 通用星星装饰 */
  private addStars(config: SceneConfig, count: number): void {
    const stars = this.scene.add.graphics()
    stars.setScrollFactor(0.1)
    stars.setDepth(-8)
    stars.setData('background', true)
    stars.fillStyle(0xffffff, 0.6)

    for (let i = 0; i < count; i++) {
      const starX = Math.random() * GAME_WIDTH
      const starY = Math.random() * (GAME_HEIGHT * 0.4)
      const starSize = Math.random() * 2 + 1
      stars.fillCircle(starX, starY, starSize)
    }
  }

  /**
   * 生成场景平台
   * @param sceneType 场景类型
   * @returns 平台数据数组
   */
  generatePlatforms(sceneType: SceneType): PlatformData[] {
    const config = this.sceneConfigs.get(sceneType)
    if (!config) return []

    const platforms: PlatformData[] = []
    const platformCount = Math.floor(10 * config.platformConfig.density)

    // 生成地面平台（连续的地面）
    const groundSegments = 5
    const segmentWidth = WORLD_WIDTH / groundSegments
    for (let i = 0; i < groundSegments; i++) {
      platforms.push({
        x: i * segmentWidth,
        y: GAME_HEIGHT - 32,
        width: segmentWidth - 50,
        height: 32,
      })
    }

    // 生成浮空平台
    for (let i = 0; i < platformCount; i++) {
      const x = Math.random() * (WORLD_WIDTH - 200)
      const y = config.platformConfig.minHeight +
                Math.random() * (config.platformConfig.maxHeight - config.platformConfig.minHeight)
      const width = config.platformConfig.minWidth +
                    Math.random() * (config.platformConfig.maxWidth - config.platformConfig.minWidth)

      // 避免平台重叠
      const overlaps = platforms.some((p) => {
        const pRight = p.x + p.width
        const pBottom = p.y + p.height
        const newRight = x + width
        const newBottom = y + 32

        return (
          x < pRight + 20 &&
          newRight > p.x - 20 &&
          y < pBottom + 20 &&
          newBottom > p.y - 20
        )
      })

      if (!overlaps) {
        platforms.push({
          x,
          y,
          width,
          height: 32,
        })
      }
    }

    return platforms
  }

  /**
   * 获取当前场景类型
   * @returns 当前场景类型
   */
  getCurrentSceneType(): SceneType {
    return this.currentSceneType
  }

  /**
   * 获取场景配置
   * @param sceneType 场景类型
   * @returns 场景配置
   */
  getSceneConfig(sceneType: SceneType): SceneConfig | undefined {
    return this.sceneConfigs.get(sceneType)
  }

  /**
   * 获取敌人生成倍率
   * @param sceneType 场景类型
   * @returns 敌人生成倍率
   */
  getEnemySpawnRate(sceneType: SceneType): number {
    const config = this.sceneConfigs.get(sceneType)
    return config ? config.enemySpawnRate : 1.0
  }

  /**
   * 获取场景名称
   * @param sceneType 场景类型
   * @returns 场景名称
   */
  getSceneName(sceneType: SceneType): string {
    const config = this.sceneConfigs.get(sceneType)
    return config?.name || '未知区域'
  }

  /**
   * 销毁场景管理器
   */
  destroy(): void {
    // 清理场景特定的资源
  }
}
