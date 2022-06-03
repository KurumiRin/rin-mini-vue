import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
  return {
    // 返回 mount 方法
    mount(rootContainer) {
      // 先转换成 vnode
      // component -> vnode
      // 所有的逻辑操作 都会基于 vnode 做处理
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }

}
