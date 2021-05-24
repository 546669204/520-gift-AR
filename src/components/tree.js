import * as THREE from 'three'
import Base from './base'
import createTree, { tree } from '../three/tree'
import { Resource } from '../allLoader'
// 爱心树组件
const dummy = new THREE.Object3D()

function smoothstep (min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

export default class LoveTree extends Base {
  constructor (props) {
    super(props)
    this.flows = []
    this.time = 0
    this.instancedGroupMesh = null
  }

  onSelect () {
    const env = this.env
    const treeMesh = createTree()
    env.reticle && treeMesh.position.setFromMatrixPosition(env.reticle.matrix)

    this.shaderMaterial = treeMesh.material
    const s = 0.001
    treeMesh.scale.x = s
    treeMesh.scale.y = -s
    treeMesh.scale.z = s

    // 获取每一个分枝的坐标
    tree.branches
      .map(it => it.slice(-1)[0])
      .forEach(it => {
        if (!it.level) return

        const item = {
          level: it.level,
          x: treeMesh.position.x + it.x * s,
          y: treeMesh.position.y + -it.y * s,
          z: treeMesh.position.z + it.z * s,
          scale: 0.005
        }

        dummy.position.set(item.x, item.y, item.z)
        dummy.scale.set(item.scale, item.scale, item.scale)
        dummy.rotateX(Math.PI / 2)
        dummy.updateMatrix()
        item.matrix = dummy.matrix.clone()
        this.flows.push(item)
      })
    // treeMesh.position.y = 0;
    env.scene.add(treeMesh)

    const _roseMesh = Resource.heartMesh.scene.children[0]
    // 随机在树杈上生成花朵
    this.flows = this.flows.filter(() => Math.random() > 0.8)
    // 当材质一致的时候可以使用 InstancedMesh 来优化性能
    this.instancedGroupMesh = new THREE.InstancedMesh(
      _roseMesh.geometry,
      new THREE.MeshPhongMaterial({
        // light
        specular: '#ffffff',
        // intermediate
        color: '#ff0000',
        // dark
        emissive: '#333333',
        shininess: 100
      }),
      this.flows.length
    )
    this.instancedGroupMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage) // will be updated every frame
    env.scene.add(this.instancedGroupMesh)
  }

  animationLoop () {
    if (this.shaderMaterial) {
      this.time++
      // 通过修改材质里的 time 来控制树的生长
      this.shaderMaterial.uniforms.time.value = this.time
    }
    if (this.flows.length) {
      let updateFlag = false
      this.flows.forEach((it, i) => {
        // 检测花朵是否需要绽放 显示
        if (!it.visible && smoothstep(0, 20, 0.5 * this.time - it.level) >= 1) {
          it.visible = true

          this.instancedGroupMesh.setMatrixAt(i, it.matrix)
          updateFlag = true
        }
      })
      if (updateFlag) {
        this.instancedGroupMesh.instanceMatrix.needsUpdate = true
      }
    }
  }
}
