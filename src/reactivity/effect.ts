import { extend } from "../shared"

class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  constructor(fn, public scheduler?) {

    this._fn = fn
  }

  run() {
    activeEffect = this
    // 返回传入函数的返回值
    return this._fn()
  }

  stop() {
    // 防止重复清空
    if (this.active) {
      // 清空自身
      cleanupEffect(this)
      // 回调 onStop
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }

  }
}

function cleanupEffect(effect) {
  // 在dep中删除自身
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

const targetMap = new Map()

// 依赖收集函数 结构为 Map[Set]
export function track(target, key) {
  //  target -> key -> dep

  // 对应响应式对象的全部依赖集Map
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 如果没有则初始化
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  // 获取对应响应式对象某个key的依赖函数集和Set
  let dep = depsMap.get(key)
  if (!dep) {
    // 如果没有则初始化
    dep = new Set()
    depsMap.set(key, dep)
  }

  // 依赖收集(将依赖函数收集)
  dep.add(activeEffect)
  // dep的每一项自身存储dep集合地址
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  // 触发依赖
  for (const effect of dep) {
    // 如果 options 中有 scheduler 参数，则触发依赖时执行 scheduler 传入的函数
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      // 执行依赖函数
      effect.run()
    }
  }
}

let activeEffect
export function effect(fn, options: any = {}) {
  //  fn
  const _effect = new ReactiveEffect(fn, options.scheduler)

  extend(_effect, options)

  _effect.run()

  // this指向修改为 ReactiveEffect 实例
  const runner: any = _effect.run.bind(_effect)

  // 自身实例
  runner.effect = _effect

  return runner

}

export function stop(runner) {
  runner.effect.stop()
}