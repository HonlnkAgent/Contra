/**
 * 输入管理系统 - 处理键盘输入
 * 管理键位映射，提供输入状态查询接口
 */
import Phaser from 'phaser'

export class InputSystem {
  private scene: Phaser.Scene
  private keys!: {
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    jump: Phaser.Input.Keyboard.Key
    shoot: Phaser.Input.Keyboard.Key
    pause: Phaser.Input.Keyboard.Key
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.setupKeys()
  }

  /** 初始化键位绑定 */
  private setupKeys(): void {
    const keyboard = this.scene.input.keyboard
    if (!keyboard) {
      this.keys = {
        left: { isDown: false } as any,
        right: { isDown: false } as any,
        up: { isDown: false } as any,
        down: { isDown: false } as any,
        jump: { isDown: false } as any,
        shoot: { isDown: false } as any,
        pause: { isDown: false } as any,
      }
      return
    }

    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      shoot: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    }
  }

  /** 是否按下左键 */
  isLeft(): boolean {
    return this.keys.left.isDown
  }

  /** 是否按下右键 */
  isRight(): boolean {
    return this.keys.right.isDown
  }

  /** 是否按下上键 */
  isUp(): boolean {
    return this.keys.up.isDown
  }

  /** 是否按下下键 */
  isDown(): boolean {
    return this.keys.down.isDown
  }

  /** 是否按下跳跃键（空格） */
  isJump(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.jump)
  }

  /** 是否按住跳跃键 */
  isJumpHeld(): boolean {
    return this.keys.jump.isDown
  }

  /** 是否按下射击键（Z） */
  isShoot(): boolean {
    return this.keys.shoot.isDown
  }

  /** 是否按下暂停键（ESC） */
  isPause(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.pause)
  }

  /** 获取水平方向移动值 (-1, 0, 1) */
  getHorizontalDirection(): number {
    if (this.isLeft()) return -1
    if (this.isRight()) return 1
    return 0
  }

  /** 销毁输入系统 */
  destroy(): void {
    // Phaser 会自动清理键盘事件
  }
}
