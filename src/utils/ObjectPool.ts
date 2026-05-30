/**
 * 对象池 - 管理可复用的游戏对象
 * 减少频繁创建和销毁对象带来的性能开销
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void
  private maxSize: number

  /**
   * @param createFn 创建新对象的工厂函数
   * @param resetFn 重置对象状态的函数
   * @param maxSize 对象池最大容量
   */
  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize: number = 50) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize
  }

  /** 从池中获取一个对象，如果池为空则创建新对象 */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  /** 将对象归还到池中 */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj)
      this.pool.push(obj)
    }
  }

  /** 获取池中当前对象数量 */
  get size(): number {
    return this.pool.length
  }

  /** 清空对象池 */
  clear(): void {
    this.pool = []
  }
}
