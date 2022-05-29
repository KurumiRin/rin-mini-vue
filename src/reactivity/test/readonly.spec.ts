import { readonly } from "../reactive"

describe('readonly', () => {
  it('happy path', () => {
    // not set
    const original = { foo: 1, bar: { baz: 2 } }
    const warrped = readonly(original)
    expect(warrped).not.toBe(original)
    expect(warrped.foo).toBe(1)
  })
})