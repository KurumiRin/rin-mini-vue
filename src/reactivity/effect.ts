import { extend } from "../shared"


let activeEffect
let shouldTrack

export class ReactiveEffect {
  private _fn: any
  deps = []
  // 该依赖函数Effect状态(是否被stop，默认是非stop)
  active = true
  onStop?: () => void
  constructor(fn, public scheduler?) {

    this._fn = fn
  }

  run() {

    // 如果已经被 stop 了，则不会将该依赖函数重新赋值给 activeEffect，防止 get 操作时重新收集该依赖
    if (!this.active) {
      // 返回传入函数的返回值
      return this._fn()
    }

    shouldTrack = true
    activeEffect = this

    // 初始化 effect 时会执行一遍 effect 中的依赖函数，当使用该函数依赖的响应式对象时会触发 get，而这是的 shouldTrack 是 true，所以该依赖函数会被 track 收集
    const result = this._fn()
    // reset
    shouldTrack = false
    return result

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
  effect.deps.length = 0
}

const targetMap = new Map()

// 依赖收集函数 结构为 Map[Set]
export function track(target, key) {
  if (!isTracking()) return

  //  target -> key -> dep
  // 从所有响应式对象 Map 集合中获取当前对象
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 如果没有则初始化
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  // 获取当前响应式对象某一个 key 的值，是一个 Set 集合
  let dep = depsMap.get(key)
  if (!dep) {
    // 如果没有则初始化
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}


export function trackEffects(dep) {
  // 依赖收集(将依赖函数收集) 
  // 在设置 effect 时会先执行 effect 函数，获得一个 activeEffect，他是一个依赖某个响应式对象的函数，然后该函数内部获取这个响应式对象的某一值时会触发该 track，将这个依赖函数存储进对应值的响应式对象的 key 的 Set 集合中，这就完成了依赖收集功能。
  // 如果已经被收集了
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  // dep的每一项自身存储dep集合地址
  activeEffect.deps.push(dep)
}


export function isTracking() {
  // 如果单纯只是定义了 reactive，并没有 effect，则没有 activeEffect
  // if (!activeEffect) return
  // shouldTrack 默认是关闭状态,不收集依赖，只有初始化 effect 调用 run 方法时可能会收集，用于解决 stop 后触发响应式对象 get 方法时又收集依赖的问题
  // if (!shouldTrack) return
  return shouldTrack && activeEffect !== undefined
}



export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  triggerEffects(dep)
}


export function triggerEffects(dep) {
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


export function effect(fn, options: any = {}) {
  //  fn
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // 将 options 内的参数挂到 effect 实例上
  extend(_effect, options)

  _effect.run()

  // this 指向修改为 ReactiveEffect 实例
  const runner: any = _effect.run.bind(_effect)

  // 自身实例
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  // stop 功能是回将传入的依赖函数从之前收集依赖 Set 集合中剔除自身，而最初 effect 创建时会返回一个this指向自身的 ReactiveEffect 实例的 runner。即使调用 runner 因为shouldTrack 是 false 状态，所以也不会被收集依赖
  runner.effect.stop()
}