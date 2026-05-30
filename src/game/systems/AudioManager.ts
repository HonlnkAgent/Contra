/**
 * 音频管理器 - 管理游戏中的所有音效和背景音乐
 * 基于 Phaser 内置音频系统
 */
import Phaser from 'phaser'
import { AUDIO } from '../config/GameConstants'

export class AudioManager {
  private scene: Phaser.Scene
  private musicVolume: number = AUDIO.MUSIC_VOLUME
  private sfxVolume: number = AUDIO.SFX_VOLUME
  private isMuted: boolean = false

  /** 背景音乐引用 */
  private currentMusic: Phaser.Sound.BaseSound | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * 播放音效
   * 由于暂无实际音频文件，使用简单的视觉提示代替
   * @param key 音效键名
   * @param volume 音量 (0-1)
   */
  playSFX(key: string, volume: number = this.sfxVolume): void {
    if (this.isMuted) return

    try {
      if (this.scene.sound.get(key)) {
        this.scene.sound.play(key, { volume })
      }
    } catch {
      // 音频文件未加载，静默忽略
    }
  }

  /**
   * 播放背景音乐
   * @param key 音乐键名
   * @param loop 是否循环播放
   */
  playMusic(key: string, loop: boolean = true): void {
    if (this.isMuted) return

    // 停止当前音乐
    this.stopMusic()

    try {
      if (this.scene.sound.get(key)) {
        this.currentMusic = this.scene.sound.add(key, {
          volume: this.musicVolume,
          loop,
        })
        this.currentMusic.play()
      }
    } catch {
      // 音频文件未加载，静默忽略
    }
  }

  /** 停止背景音乐 */
  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop()
      this.currentMusic.destroy()
      this.currentMusic = null
    }
  }

  /** 暂停背景音乐 */
  pauseMusic(): void {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause()
    }
  }

  /** 恢复背景音乐 */
  resumeMusic(): void {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume()
    }
  }

  /**
   * 设置音乐音量
   * @param volume 音量值 (0-1)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume)
    }
  }

  /**
   * 设置音效音量
   * @param volume 音量值 (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  /** 切换静音状态 */
  toggleMute(): void {
    this.isMuted = !this.isMuted
    if (this.isMuted) {
      this.pauseMusic()
    } else {
      this.resumeMusic()
    }
  }

  /** 是否静音 */
  getIsMuted(): boolean {
    return this.isMuted
  }

  /** 销毁音频管理器 */
  destroy(): void {
    this.stopMusic()
  }
}
