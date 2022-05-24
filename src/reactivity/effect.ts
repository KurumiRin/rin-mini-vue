
class ReactiveEffect {
  private _fn: any
  constructor(fn) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    this._fn()
  }
}
const targetMap = new Map()

export function track(target, key) {
  //  target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 初始化
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    // 初始化
    dep = new Set()
    depsMap.set(key, dep)
  }

  // 依赖收集
  dep.add(activeEffect)
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  // 触发依赖
  for (const effect of dep) {
    effect.run()
  }
}

let activeEffect
export function effect(fn) {
  //  fn
  const _effect = new ReactiveEffect(fn)

  _effect.run()

}