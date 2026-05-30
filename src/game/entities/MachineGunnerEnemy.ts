/**
 * 机枪手敌人 - 射速快、伤害高的远程敌人
 * 行为模式：检测到玩家后快速连续射击
 */
import { Enemy, EnemyConfigData } from './Enemy'
import { EnemyType, Direction } from '../../types/game'
import { EnemyState } from '../../types/enemy'
import { ENEMY } from '../config/GameConstants'
import { Bullet } from './Bullet'
import { eventBus, GameEvents } from '../../utils/EventBus'

export class MachineGunnerEnemy extends Enemy {
  private bullets: Phaser.Physics.Arcade.Group

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number = 80,
    bullets: Phaser.Physics.Arcade.Group
  ) {
    const config: EnemyConfigData = {
      width: ENEMY.MACHINE_GUNNER.WIDTH,
      height: ENEMY.MACHINE_GUNNER.HEIGHT,
      speed: ENEMY.MACHINE_GUNNER.SPEED,
      health: ENEMY.MACHINE_GUNNER.HEALTH,
      damage: ENEMY.MACHINE_GUNNER.DAMAGE,
      score: ENEMY.MACHINE_GUNNER.SCORE,
      detectionRange: ENEMY.MACHINE_GUNNER.DETECTION_RANGE,
      fireRate: ENEMY.MACHINE_GUNNER.FIRE_RATE,
    }

    super(
      scene,
      x,
      y,
      'enemy_machine_gunner',
      EnemyType.MACHINE_GUNNER,
      config,
      patrolRange
    )
    this.bullets = bullets
  }

  /** 攻击行为 - 快速连射 */
  protected attack(): void {
    super.attack()

    const now = this.scene.time.now
    if (now - this.lastFireTime < this.fireRate) return

    this.lastFireTime = now

    // 连续发射3颗子弹
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        if (this.state === EnemyState.DEAD || !this.sprite.active) return

        const offsetX = this.direction === Direction.RIGHT ? 24 : -24
        const bullet = new Bullet(
          this.scene,
          this.sprite.x + offsetX,
          this.sprite.y - 4,
          this.direction,
          false
        )

        this.bullets.add(bullet.sprite)
      })
    }

    eventBus.emit(GameEvents.ENEMY_SHOOT, {
      x: this.sprite.x,
      y: this.sprite.y,
      direction: this.direction,
      type: 'burst',
    })
  }
}
