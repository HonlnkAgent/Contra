/**
 * 场景管理器 - 负责无限模式下场景切换和生成
 * 管理不同场景类型的背景和平台生成
 */
import Phaser from 'phaser'
import { PlatformData } from '../../types/game'
import { GAME_WIDTH, GAME_HEIGHT, WORLD_WIDTH } from '../config/GameConstants'

/** 场景类型枚举 */
export enum SceneType {
  FOREST = 'forest',
  BASE = 'base',
  MOUNTAIN = 'mountain',
  CITY = 'city',
  FACTORY = 'factory',
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
}

export class SceneManager {
  private scene: Phaser.Scene
  private currentScene: number = 0
  private currentSceneType: SceneType = SceneType.FOREST

  /** 场景类型配置 */
  private sceneConfigs: Map<SceneType, SceneConfig> = new Map([
    [SceneType.FOREST, {
      name: '丛林',
      background: {
        topColor: 0x1a1a2e,
        bottomColor: 0x16213e,
        parallaxColor: 0x0f3460,
        parallaxFactor: 0.3,
      },
      platformConfig: {
        minHeight: 200,
        maxHeight: 400,
        minWidth: 100,
        maxWidth: 300,
        density: 0.7,
      },
      enemySpawnRate: 1.0,
    }],
    [SceneType.BASE, {
      name: '基地',
      background: {
        topColor: 0x2d1b2e,
        bottomColor: 0x1a1a2e,
        parallaxColor: 0x3d1f5e,
        parallaxFactor: 0.4,
      },
      platformConfig: {
        minHeight: 250,
        maxHeight: 450,
        minWidth: 150,
        maxWidth: 350,
        density: 0.8,
      },
      enemySpawnRate: 1.2,
    }],
    [SceneType.MOUNTAIN, {
      name: '山脉',
      background: {
        topColor: 0x1a2e1a,
        bottomColor: 0x0f1f0f,
        parallaxColor: 0x2d4a2d,
        parallaxFactor: 0.5,
      },
      platformConfig: {
        minHeight: 150,
        maxHeight: 350,
        minWidth: 80,
        maxWidth: 250,
        density: 0.6,
      },
      enemySpawnRate: 1.1,
    }],
    [SceneType.CITY, {
      name: '城市',
      background: {
        topColor: 0x1a1a2e,
        bottomColor: 0x2d2d3e,
        parallaxColor: 0x4a4a5e,
        parallaxFactor: 0.6,
      },
      platformConfig: {
        minHeight: 200,
        maxHeight: 500,
        minWidth: 200,
        maxWidth: 400,
        density: 0.9,
      },
      enemySpawnRate: 1.3,
    }],
    [SceneType.FACTORY, {
      name: '工厂',
      background: {
        topColor: 0x2e1a1a,
        bottomColor: 0x1f0f0f,
        parallaxColor: 0x5e2d2d,
        parallaxFactor: 0.7,
      },
      platformConfig: {
        minHeight: 300,
        maxHeight: 550,
        minWidth: 250,
        maxWidth: 500,
        density: 1.0,
      },
      enemySpawnRate: 1.5,
    }],
  ])

  /** 场景类型序列 */
  private sceneSequence: SceneType[] = [
    SceneType.FOREST,
    SceneType.BASE,
    SceneType.MOUNTAIN,
    SceneType.CITY,
    SceneType.FACTORY,
  ]

  /**
   * 构造函数
   * @param scene 场景引用
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * 切换到下一个场景
   * @returns 新的场景类型
   */
  switchScene(): SceneType {
    this.currentScene = (this.currentScene + 1) % this.sceneSequence.length
    this.currentSceneType = this.sceneSequence[this.currentScene]
    return this.currentSceneType
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
    const mountains = this.scene.add.graphics()
    mountains.setScrollFactor(config.background.parallaxFactor)
    mountains.setDepth(-5)
    mountains.setData('background', true)
    mountains.fillStyle(config.background.parallaxColor, 0.4)

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
    stars.setData('background', true)
    stars.fillStyle(0xffffff, 0.6)

    for (let i = 0; i < 30; i++) {
      const starX = Math.random() * GAME_WIDTH
      const starY = Math.random() * (GAME_HEIGHT * 0.5)
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
          x < pRight &&
          newRight > p.x &&
          y < pBottom &&
          newBottom > p.y
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
   * 销毁场景管理器
   */
  destroy(): void {
    // 清理场景特定的资源
  }
}