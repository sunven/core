import { ReactiveEffect, trackOpBit } from './effect'

export type Dep = Set<ReactiveEffect> & TrackedMarkers

/**
 * wasTracked and newTracked maintain the status for several levels of effect
 * tracking recursion. One bit per level is used to define whether the dependency
 * was/is tracked.
 * wasTracked 和 newTracked 维护多个级别的效果跟踪递归的状态。 每个级别一位用于定义是否跟踪依赖项
 */
type TrackedMarkers = {
  /**
   * wasTracked
   * 是否已收集
   */
  w: number
  /**
   * newTracked
   * 设置新的跟踪
   */
  n: number
}

export const createDep = (effects?: ReactiveEffect[]): Dep => {
  const dep = new Set<ReactiveEffect>(effects) as Dep
  dep.w = 0
  dep.n = 0
  return dep
}

/**
 * 是否已收集
 * @param dep 
 * @returns 
 */
export const wasTracked = (dep: Dep): boolean => (dep.w & trackOpBit) > 0

/**
 * 设置新的跟踪
 * @param dep 
 * @returns 
 */
export const newTracked = (dep: Dep): boolean => (dep.n & trackOpBit) > 0

export const initDepMarkers = ({ deps }: ReactiveEffect) => {
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].w |= trackOpBit // set was tracked
    }
  }
}

export const finalizeDepMarkers = (effect: ReactiveEffect) => {
  const { deps } = effect
  if (deps.length) {
    let ptr = 0
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i]
      if (wasTracked(dep) && !newTracked(dep)) {
        dep.delete(effect)
      } else {
        deps[ptr++] = dep
      }
      // clear bits
      dep.w &= ~trackOpBit
      dep.n &= ~trackOpBit
    }
    deps.length = ptr
  }
}
