import { track, trigger } from './effect'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

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

// reactive的Proxy处理函数
export const mutableHandlers = {
  get,
  set
}

// readonly的Proxy处理函数
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key:${key} set can't be set, because ${target} is readonly`)
    return true
  }
}