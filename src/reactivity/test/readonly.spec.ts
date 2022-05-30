import { isReadonly, readonly } from "../reactive"

describe('readonly', () => {
  it('happy path', () => {
    // not set
    const original = { foo: 1, bar: { baz: 2 } }
    const warrped = readonly(original)
    expect(warrped).not.toBe(original)
    expect(isReadonly(warrped)).toBe(true)
    expect(isReadonly(original)).toBe(false)
    expect(isReadonly(warrped.bar)).toBe(true)
    expect(isReadonly(original.bar)).toBe(false)
    expect(warrped.foo).toBe(1)
  })

  it('warn when call set', () => {
    console.warn = jest.fn()
    const user = readonly({
      age: 10
    })
    user.age = 11
    expect(console.warn).toBeCalled()
  })
})