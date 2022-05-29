import { track, trigger } from "./effect"

// 抽离get,返回一个get函数
function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)
    // 判断是否为 readonly
    if (!isReadonly) {
      // 依赖收集
      track(target, key)
    }
    return res
  }
}

// 抽离set,返回一个set函数
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    // 触发依赖
    trigger(target, key)
    return res
  }
}



export function reactive(raw) {
  return new Proxy(raw, {
    get: createGetter(),
    set: createSetter()
  })
}

export function readonly(raw) {
  return new Proxy(raw, {
    get: createGetter(true),
    set(target, key, value) {
      return true
    }
  })
}