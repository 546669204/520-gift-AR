import Base from './base'
import { Resource } from '../allLoader'
// 大量元素 实现花海
export default class FlowerSea extends Base {
  onSelect () {
    const env = this.env
    env.reticle && Resource.roseMesh.scene.position.setFromMatrixPosition(env.reticle.matrix)
    // 遍历 当前位置的 上下左右 放置花朵
    for (let i = -10; i < 10; i++) {
      for (let j = -10; j < 10; j++) {
        if (Math.pow(i, 2) + Math.pow(j, 2) > 64) {
          continue
        }
        // 克隆每一个mesh 防止后续修改的时候串了(应该有优化的空间)
        const _mesh = Resource.roseMesh.scene.clone()
        _mesh.position.set(
          i / 15 + _mesh.position.x,
          _mesh.position.y,
          j / 15 + _mesh.position.z
        )
        const scl = Math.random() * 0.05 + 0.1
        const r = Math.random() * 360
        _mesh.scale.set(scl, scl, scl)
        _mesh.rotation.set(0, r, 0)
        env.scene.add(_mesh)
      }
    }
  }
}
