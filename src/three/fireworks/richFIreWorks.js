import { BasicFIreWorks } from './basicFIreWorks'
import * as THREE from 'three'
import { getRandomNum, getOffsetXYZ, getOffsetRGBA } from './utils'
import { ParticleTailMesh } from './ParticleMesh'

export class RichFIreWorks extends BasicFIreWorks {
  constructor () {
    super()
    const max = 100
    const min = 50
    this.petalsNum = getRandomNum(max, min)
    this.flowerSizeRate = THREE.Math.mapLinear(this.petalsNum, min, max, 1.4, 1.7)
    this.tailMeshGroup = new THREE.Group()
    this.tails = []
  }

  explode (pos) {
    this.isExplode = true
    this.flower = this.getFlower(pos)
    this.tails = this.getTail()
    this.meshGroup.add(this.flower.mesh)
    this.meshGroup.add(this.tailMeshGroup)
  }

  getTail () {
    const tails = []
    const num = 20
    const { color: petalColor } = this.flower.mesh.geometry.attributes

    for (let i = 0; i < this.petalsNum; i++) {
      const vels = []
      for (let j = 0; j < num; j++) {
        const vx = 0
        const vy = 0
        const vz = 0
        vels.push(new THREE.Vector3(vx, vy, vz))
      }
      const tail = new ParticleTailMesh(num, vels)

      const { r, g, b, a } = getOffsetRGBA(i)

      const petalR = petalColor.array[r]
      const petalG = petalColor.array[g]
      const petalB = petalColor.array[b]
      const petalA = petalColor.array[a]

      const { position, color } = tail.mesh.geometry.attributes

      for (let k = 0; k < position.count; k++) {
        const { r, g, b, a } = getOffsetRGBA(k)
        color.array[r] = petalR
        color.array[g] = petalG
        color.array[b] = petalB
        color.array[a] = petalA
      }

      const { x, y, z } = this.flower.mesh.position
      tail.mesh.position.set(x, y, z)
      tails.push(tail)
      this.tailMeshGroup.add(tail.mesh)
    }
    return tails
  }

  update (gravity) {
    if (!this.isExplode) {
      this.drawTail()
    } else {
      this.flower.update(gravity)

      const { position: flowerGeometory } = this.flower.mesh.geometry.attributes

      for (let i = 0, l = this.tails.length; i < l; i++) {
        const tail = this.tails[i]
        tail.update(gravity)
        const { x, y, z } = getOffsetXYZ(i)
        const flowerPos = new THREE.Vector3(
          flowerGeometory.array[x],
          flowerGeometory.array[y],
          flowerGeometory.array[z]
        )
        const { position, velocity } = tail.mesh.geometry.attributes
        for (let k = 0; k < position.count; k++) {
          const { x, y, z } = getOffsetXYZ(k)
          const desiredVelocity = new THREE.Vector3()
          const tailPos = new THREE.Vector3(position.array[x], position.array[y], position.array[z])
          const tailVel = new THREE.Vector3(velocity.array[x], velocity.array[y], velocity.array[z])
          desiredVelocity.subVectors(flowerPos, tailPos)
          const steer = desiredVelocity.sub(tailVel)
          steer.normalize()
          steer.multiplyScalar(Math.random() * 0.0003 * this.life)
          velocity.array[x] += steer.x
          velocity.array[y] += steer.y
          velocity.array[z] += steer.z
        }
        velocity.needsUpdate = true
      }

      if (this.life > 0) this.life -= 1.2
    }
  }
}
