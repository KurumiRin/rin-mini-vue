import { ReactiveEffect } from './effect';
class ComputedRefImpl {
  private _getter: any
  private _dirty: boolean = true
  private _value: any
  private _effect: any;

  constructor(getter) {
    this._getter = getter
    // 这一步是将 computed 传入的函数进行 effect 收集到依赖的响应式对象的Set中
    // effect 中如果响应式对象发生改变，会重新执行依赖函数，所以需要设置 scheduler,这样就不会触发依赖函数而是触发 scheduler 函数，将 _dirty 置为 true，这样下次 computed 取值时回重新执行函数，获取最新值。
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }

    })
  }

  get value() {
    // get
    // 当依赖的响应式对象的值发生改变的时候重新为true
    // effect
    if (this._dirty) {
      this._dirty = false
      // 缓存并返回调用结果
      this._value = this._effect.run()

    }
    // 如果已经缓存了，则返回上次缓存的结果
    return this._value
  }
}



export function computed(getter) {
  return new ComputedRefImpl(getter)
}