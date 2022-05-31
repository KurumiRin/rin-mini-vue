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

// 在 template 中，我们不需要 .value 来获取 ref 的值，就是利用 proxyRefs 做到的
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // get -> 如果访问一个属性，他是 ref，那就给他返回 .value,
      // 如果不是 ref,则返回本身
      return unRef(Reflect.get(target, key))
    },
    set(target, key, newValue) {
      // set -> 如果修改的是 ref,且不是修改为 ref，则赋值给他的 .value
      if (isRef(target[key]) && !isRef(newValue)) {
        return target[key].value = newValue
      } else {
        // 如果是修改为 ref 类型，则替换掉
        return Reflect.set(target, key, newValue)
      }
    }
  })

}