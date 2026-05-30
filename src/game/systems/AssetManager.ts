/**
 * 资源管理器 - 管理游戏资源的加载和缓存
 * 由于当前使用几何图形作为临时精灵，此管理器主要用于
 * 管理未来替换为真实资源时的加载逻辑
 */
import Phaser from 'phaser'

export class AssetManager {
  private scene: Phaser.Scene
  private loadedAssets: Set<string> = new Set()

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * 检查资源是否已加载
   * @param key 资源键名
   */
  isLoaded(key: string): boolean {
    return this.loadedAssets.has(key)
  }

  /**
   * 标记资源已加载
   * @param key 资源键名
   */
  markLoaded(key: string): void {
    this.loadedAssets.add(key)
  }

  /**
   * 获取资源加载进度
   * @param total 总资源数
   */
  getProgress(): { loaded: number; total: number } {
    return {
      loaded: this.loadedAssets.size,
      total: this.loadedAssets.size,
    }
  }

  /** 清除所有缓存 */
  clearCache(): void {
    this.loadedAssets.clear()
  }

  /** 销毁资源管理器 */
  destroy(): void {
    this.clearCache()
  }
}
