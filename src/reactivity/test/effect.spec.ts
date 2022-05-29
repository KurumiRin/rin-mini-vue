import { effect, stop } from '../effect'
import { reactive } from '../reactive'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({ age: 10 })

    let nextAge

    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    //  update
    user.age++

    expect(nextAge).toBe(12)
  })


  it('', () => {
    // 1.effect -> funciton (runner) -> fn -> return
    let foo = 10
    const runner = effect(() => {
      foo++
      return "foo"
    })

    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe("foo")
  })
})

it('scheduler', () => {
  // 1.通过 effect 的第二个参数给定的 一个 scheduler的 fn
  // 2.effect 第一次执行的时候，还会执行fn
  // 3.当 响应式对象 set update 的时候不会执行 fn 而是执行 scheduler
  // 4.如果当执行 runner 的时候，会再次执行 fn
  let dummy
  let run: any
  const scheduler = jest.fn(() => {
    run = runner
  })
  const obj = reactive({ foo: 1 })
  const runner = effect(
    () => {
      dummy = obj.foo
    },
    { scheduler }
  )
  // scheduler 开始不会执行
  expect(scheduler).not.toHaveBeenCalled()
  expect(dummy).toBe(1)
  // should be called on first trigger
  obj.foo++
  // 如果传入了scheduler,则在set 和 update 时不会触发 effect 的 fn 而是触发 scheduler
  expect(scheduler).toHaveBeenCalledTimes(1)
  expect(dummy).toBe(1)
  // 执行 effect 中的 fn
  run()
  expect(dummy).toBe(2)
})

it("stop", () => {
  let dummy
  const obj = reactive({ props: 1 })
  const runner = effect(() => {
    dummy = obj.prop
  })
  obj.prop = 2
  expect(dummy).toBe(2)
  stop(runner)
  obj.prop = 3
  expect(dummy).toBe(2)

  // stopped effect should still be manually callable
  runner()
  expect(dummy).toBe(3)
})
