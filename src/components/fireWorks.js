import * as THREE from 'three'
import Base from './base'
import { RichFIreWorks } from '../three/fireworks/richFIreWorks'
// 烟花组件
export default class Fireworks extends Base {
  constructor (props) {
    super(props)
    this.fireworksInstances = []
  }

  onSelect () {
    const env = this.env
    this.timer = setInterval(() => {
      this.addFireWorks(env)
    }, 100)
  }

  animationLoop () {
    const env = this.env
    const exploadedIndexList = []
    for (let i = this.fireworksInstances.length - 1; i >= 0; i--) {
      const instance = this.fireworksInstances[i]
      instance.update(new THREE.Vector3(0, -0.005, 0))
      // 过期之后
      if (instance.isExplode) exploadedIndexList.push(i)
    }
    for (let i = 0, l = exploadedIndexList.length; i < l; i++) {
      const index = exploadedIndexList[i]
      const instance = this.fireworksInstances[index]
      if (!instance) return
      // 过期列表做销毁处理
      instance.meshGroup.remove(instance.seed.mesh)
      instance.seed.disposeAll()
      if (instance.life <= 0) {
        env.scene.remove(instance.meshGroup)
        if (instance.tailMeshGroup) {
          instance.tails.forEach(v => {
            v.disposeAll()
          })
        }
        instance.flower.disposeAll()
        this.fireworksInstances.splice(index, 1)
      }
    }
  }

  addFireWorks () {
    const env = this.env
    for (let index = 0; index < 5 - this.fireworksInstances.length; index++) {
      const fw = new RichFIreWorks() // : new RichFIreWorks();
      this.fireworksInstances.push(fw)
      fw.meshGroup.scale.x = 0.01
      fw.meshGroup.scale.y = 0.01
      fw.meshGroup.scale.z = 0.01
      // env.reticle && fw.meshGroup.position.setFromMatrixPosition(env.last_matrix);
      fw.meshGroup.position.x = env.last_xyz.x + Math.random() * 0.6 - 0.3
      fw.meshGroup.position.y = env.last_xyz.y + Math.random() * 0.6 - 0.3
      fw.meshGroup.position.z = env.last_xyz.z + Math.random() * 0.6 - 0.3

      env.scene.add(fw.meshGroup)
    }
  }
}
