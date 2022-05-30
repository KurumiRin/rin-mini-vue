import { isObject } from './../shared/index';
import { hasChanged } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from './reactive';

class RefImpl {
  private _value: any
  public dep
  private _rawValue: any;

  constructor(value) {
    this._rawValue = value
    this._value = isObject(value) ? reactive(value) : value
    // value -> reactive
    // 1.看看 value 是不是对象


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
      this._value = isObject(newValue) ? reactive(newValue) : newValue
      triggerEffects(this.dep)
    }

  }
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