/**
 * 启动场景 - 游戏启动时的第一个场景
 * 负责加载最基础的资源（如加载条）并跳转到预加载场景
 */
import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConstants'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // 创建加载进度条背景
    const barBg = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      300,
      25,
      0x333333
    )
    barBg.setStrokeStyle(2, 0xffffff)

    // 创建加载进度条
    const bar = this.add.rectangle(
      GAME_WIDTH / 2 - 148,
      GAME_HEIGHT / 2,
      0,
      21,
      0x00ff00
    )
    bar.setOrigin(0, 0.5)

    // 加载文字
    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '加载中...', {
      fontSize: '16px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#00ff00',
    })
    loadingText.setOrigin(0.5)

    // 监听加载进度
    this.load.on('progress', (value: number) => {
      bar.width = 296 * value
    })

    this.load.on('complete', () => {
      loadingText.setText('加载完成')
    })
  }

  create(): void {
    // 跳转到预加载场景
    this.scene.start('PreloadScene')
  }
}
