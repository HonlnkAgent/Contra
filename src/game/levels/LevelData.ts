/**
 * 关卡数据结构定义
 * 定义关卡中所有静态数据的接口
 */
import { LevelData, EnemyType, PowerUpType, Direction } from '../../types/game'

/**
 * 第一关卡数据
 * 包含平台布局、敌人配置、道具配置
 */
export const LEVEL_1: LevelData = {
  id: 1,
  name: '丛林基地',
  width: 3200,
  height: 600,
  playerStart: { x: 80, y: 450 },
  platforms: [
    // 地面平台 - 连续的地面
    { x: 0, y: 568, width: 600, height: 32 },
    { x: 650, y: 568, width: 400, height: 32 },
    { x: 1100, y: 568, width: 500, height: 32 },
    { x: 1700, y: 568, width: 300, height: 32 },
    { x: 2100, y: 568, width: 600, height: 32 },
    { x: 2800, y: 568, width: 400, height: 32 },

    // 浮空平台
    { x: 200, y: 440, width: 128, height: 32 },
    { x: 450, y: 380, width: 96, height: 32 },
    { x: 700, y: 420, width: 128, height: 32 },
    { x: 950, y: 350, width: 96, height: 32 },
    { x: 1200, y: 420, width: 160, height: 32 },
    { x: 1500, y: 380, width: 128, height: 32 },
    { x: 1800, y: 340, width: 96, height: 32 },
    { x: 2050, y: 420, width: 128, height: 32 },
    { x: 2300, y: 360, width: 160, height: 32 },
    { x: 2600, y: 420, width: 128, height: 32 },
    { x: 2900, y: 380, width: 96, height: 32 },

    // 高台
    { x: 350, y: 280, width: 64, height: 32 },
    { x: 1050, y: 250, width: 96, height: 32 },
    { x: 1650, y: 260, width: 64, height: 32 },
    { x: 2400, y: 240, width: 96, height: 32 },
  ],
  enemies: [
    // 步兵巡逻
    { type: EnemyType.SOLDIER, x: 400, y: 530, patrolRange: 120 },
    { type: EnemyType.SOLDIER, x: 800, y: 530, patrolRange: 100 },
    { type: EnemyType.SOLDIER, x: 1300, y: 530, patrolRange: 150 },
    { type: EnemyType.SOLDIER, x: 1900, y: 530, patrolRange: 100 },
    { type: EnemyType.SOLDIER, x: 2500, y: 530, patrolRange: 120 },
    { type: EnemyType.SOLDIER, x: 3000, y: 530, patrolRange: 80 },

    // 平台上的步兵
    { type: EnemyType.SOLDIER, x: 240, y: 400, patrolRange: 40 },
    { type: EnemyType.SOLDIER, x: 1250, y: 380, patrolRange: 50 },

    // 机枪手
    { type: EnemyType.MACHINE_GUNNER, x: 550, y: 530, patrolRange: 50 },
    { type: EnemyType.MACHINE_GUNNER, x: 1600, y: 530, patrolRange: 40 },
    { type: EnemyType.MACHINE_GUNNER, x: 2700, y: 530, patrolRange: 50 },

    // 高台上的机枪手
    { type: EnemyType.MACHINE_GUNNER, x: 1080, y: 210, patrolRange: 30 },
    { type: EnemyType.MACHINE_GUNNER, x: 2430, y: 200, patrolRange: 30 },

    // 跳跃兵
    { type: EnemyType.JUMPER, x: 1000, y: 530, patrolRange: 200 },
    { type: EnemyType.JUMPER, x: 2200, y: 530, patrolRange: 250 },
  ],
  powerUps: [
    // 武器道具
    { type: PowerUpType.RAPID_FIRE, x: 480, y: 340 },
    { type: PowerUpType.SPREAD, x: 1050, y: 210 },
    { type: PowerUpType.LASER, x: 1650, y: 220 },
    { type: PowerUpType.RAPID_FIRE, x: 2400, y: 200 },

    // 生命道具
    { type: PowerUpType.LIFE, x: 350, y: 240 },
    { type: PowerUpType.LIFE, x: 2900, y: 340 },

    // 回复道具
    { type: PowerUpType.SHIELD, x: 700, y: 380 },
    { type: PowerUpType.SHIELD, x: 2100, y: 380 },
  ],
  boss: null,
  background: {
    layers: [
      { type: 'gradient', colors: { top: 0x1a1a2e, bottom: 0x16213e } },
      { type: 'parallax', color: 0x0f3460, scrollFactor: 0.3 },
    ],
  },
}

/** 获取关卡数据 */
export function getLevelData(levelId: number): LevelData {
  switch (levelId) {
    case 1:
      return LEVEL_1
    default:
      return LEVEL_1
  }
}
