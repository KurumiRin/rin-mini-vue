import { isObject } from './../shared/index';
import { hasChanged } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from './reactive';

class RefImpl {
  private _value: any
  public dep
  private _rawValue: any;
  public __v_isRef = true

  constructor(value) {
    this._rawValue = value

    // 1.看看 value 是不是对象
    this._value = convert(value)

    this.dep = new Set()
  }

  get value() {
    // 收集依赖
    trackRefValue(this)

    return this._value
  }

  set value(newValue) {
    // 如果值改变了
    // 对比的时候需要对比处理前的值，所以用 _rawValue 在处理前存储一下
    if (hasChanged(this._rawValue, newValue)) {

      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }

  }
}

function convert(value) {
  // value -> reactive
  return isObject(value) ? reactive(value) : value
}


function trackRefValue(ref) {
  // 如果有 effect 过，即有 activeEffect 则收集依赖
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}


export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  // 如果是 ref 则返回 ref.value 否则返回本身
  return isRef(ref) ? ref.value : ref
}