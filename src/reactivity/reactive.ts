import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';
import { track, trigger } from "./effect"

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value) {
  // 随意去读取不存在的值触发 reactive 的 get 方法来判断是否为 reactive 对象
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  // 随意去读取不存在的值触发 reactive 的 get 方法来判断是否为 reactive 对象
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}