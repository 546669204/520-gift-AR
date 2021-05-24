import * as THREE from 'three'
import { getRandomNum } from './utils'
import { ParticleSeedMesh, ParticleMesh } from './ParticleMesh'
export class BasicFIreWorks {
  constructor () {
    this.meshGroup = new THREE.Group()
    this.isExplode = false
    const max = 400
    const min = 150
    this.petalsNum = getRandomNum(max, min)
    this.life = 150
    this.seed = this.getSeed()
    this.meshGroup.add(this.seed.mesh)
    this.flowerSizeRate = THREE.Math.mapLinear(this.petalsNum, min, max, 0.4, 0.7)
  }

  getSeed () {
    const num = 4
    const vels = []
    for (let i = 0; i < num; i++) {
      const vx = 0
      const vy = i === 0 ? Math.random() * 2.5 + 0.9 : Math.random() * 2.0 + 0.4
      const vz = 0
      vels.push(new THREE.Vector3(vx, vy, vz))
    }
    const pm = new ParticleSeedMesh(num, vels)
    const x = 0
    const y = 0
    const z = 0
    pm.mesh.position.set(x, y, z)
    return pm
  }

  explode (pos) {
    this.isExplode = true
    this.flower = this.getFlower(pos)
    this.meshGroup.add(this.flower.mesh)
    this.meshGroup.remove(this.seed.mesh)
    this.seed.disposeAll()
  }

  getFlower (pos) {
    const num = this.petalsNum
    const vels = []
    let radius
    const dice = Math.random()

    if (dice > 0.5) {
      for (let i = 0; i < num; i++) {
        radius = getRandomNum(120, 60) * 0.01
        const theta = THREE.Math.degToRad(Math.random() * 180)
        const phi = THREE.Math.degToRad(Math.random() * 360)
        const vx = Math.sin(theta) * Math.cos(phi) * radius
        const vy = Math.sin(theta) * Math.sin(phi) * radius
        const vz = Math.cos(theta) * radius
        const vel = new THREE.Vector3(vx, vy, vz)
        vel.multiplyScalar(this.flowerSizeRate)
        vels.push(vel)
      }
    } else {
      const zStep = 180 / num
      const trad = (360 * (Math.random() * 20 + 1)) / num
      const xStep = trad
      const yStep = trad
      radius = getRandomNum(120, 60) * 0.01
      for (let i = 0; i < num; i++) {
        const sphereRate = Math.sin(THREE.Math.degToRad(zStep * i))
        const vz = Math.cos(THREE.Math.degToRad(zStep * i)) * radius
        const vx = Math.cos(THREE.Math.degToRad(xStep * i)) * sphereRate * radius
        const vy = Math.sin(THREE.Math.degToRad(yStep * i)) * sphereRate * radius
        const vel = new THREE.Vector3(vx, vy, vz)
        vel.multiplyScalar(this.flowerSizeRate)
        vels.push(vel)
      }
    }

    const particleMesh = new ParticleMesh(num, vels)
    particleMesh.mesh.position.set(pos.x, pos.y, pos.z)
    return particleMesh
  }

  update (gravity) {
    if (!this.isExplode) {
      this.drawTail()
    } else {
      this.flower.update(gravity)
      if (this.life > 0) this.life -= 1
    }
  }

  drawTail () {
    this.seed.update(new THREE.Vector3(0, -0.005, 0))
    const { position, velocity } = this.seed.mesh.geometry.attributes
    let count = 0
    let isComplete = true
    // Check if the y-axis speed is down for all particles
    for (let i = 0, l = velocity.array.length; i < l; i++) {
      const v = velocity.array[i]
      const index = i % 3
      if (index === 1 && v > 0) {
        count++
      }
    }

    isComplete = count == 0
    if (!isComplete) return
    const { x, y, z } = this.seed.mesh.position
    const flowerPos = new THREE.Vector3(x, y, z)
    let highestPos = 0
    let offsetPos
    for (let i = 0, l = position.array.length; i < l; i++) {
      const p = position.array[i]
      const index = i % 3
      if (index === 1 && p > highestPos) {
        highestPos = p
        offsetPos = new THREE.Vector3(position.array[i - 1], p, position.array[i + 2])
      }
    }
    flowerPos.add(offsetPos)
    this.explode(flowerPos)
  }
}
