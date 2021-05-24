import { getPointMesh, getOffsetXYZ, getOffsetRGBA } from './utils'
const friction = 0.998

export class ParticleMesh {
  constructor (num, vels, type) {
    this.particleNum = num
    this.timerStartFading = 10
    this.mesh = getPointMesh(num, vels, type)
  }

  update (gravity) {
    if (this.timerStartFading > 0) this.timerStartFading -= 0.3
    const { position, velocity, color, mass } = this.mesh.geometry.attributes
    const decrementRandom = () => (Math.random() > 0.5 ? 0.98 : 0.96)
    const decrementByVel = v => (Math.random() > 0.5 ? 0 : (1 - v) * 0.1)
    for (let i = 0; i < this.particleNum; i++) {
      const { x, y, z } = getOffsetXYZ(i)
      velocity.array[y] += gravity.y - mass.array[i]
      velocity.array[x] *= friction
      velocity.array[z] *= friction
      velocity.array[y] *= friction
      position.array[x] += velocity.array[x]
      position.array[y] += velocity.array[y]
      position.array[z] += velocity.array[z]
      const { a } = getOffsetRGBA(i)
      if (this.timerStartFading <= 0) {
        color.array[a] *= decrementRandom() - decrementByVel(color.array[a])
        if (color.array[a] < 0.001) color.array[a] = 0
      }
    }
    position.needsUpdate = true
    velocity.needsUpdate = true
    color.needsUpdate = true
  }

  disposeAll () {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}

export class ParticleSeedMesh extends ParticleMesh {
  constructor (num, vels) {
    super(num, vels, 'seed')
  }

  update (gravity) {
    const { position, velocity, color, mass } = this.mesh.geometry.attributes
    const decrementRandom = () => (Math.random() > 0.3 ? 0.99 : 0.96)
    const decrementByVel = v => (Math.random() > 0.3 ? 0 : (1 - v) * 0.1)
    const shake = () => (Math.random() > 0.5 ? 0.05 : -0.05)
    const dice = () => Math.random() > 0.1
    const _f = friction * 0.98
    for (let i = 0; i < this.particleNum; i++) {
      const { x, y, z } = getOffsetXYZ(i)
      velocity.array[y] += gravity.y - mass.array[i]
      velocity.array[x] *= _f
      velocity.array[z] *= _f
      velocity.array[y] *= _f
      position.array[x] += velocity.array[x]
      position.array[y] += velocity.array[y]
      position.array[z] += velocity.array[z]
      if (dice()) position.array[x] += shake()
      if (dice()) position.array[z] += shake()
      const { a } = getOffsetRGBA(i)
      color.array[a] *= decrementRandom() - decrementByVel(color.array[a])
      if (color.array[a] < 0.001) color.array[a] = 0
    }
    position.needsUpdate = true
    velocity.needsUpdate = true
    color.needsUpdate = true
  }
}

export class ParticleTailMesh extends ParticleMesh {
  constructor (num, vels) {
    super(num, vels, 'trail')
  }

  update (gravity) {
    const { position, velocity, color, mass } = this.mesh.geometry.attributes
    const decrementRandom = () => (Math.random() > 0.3 ? 0.98 : 0.95)
    const shake = () => (Math.random() > 0.5 ? 0.05 : -0.05)
    const dice = () => Math.random() > 0.2
    for (let i = 0; i < this.particleNum; i++) {
      const { x, y, z } = getOffsetXYZ(i)
      velocity.array[y] += gravity.y - mass.array[i]
      velocity.array[x] *= friction
      velocity.array[z] *= friction
      velocity.array[y] *= friction
      position.array[x] += velocity.array[x]
      position.array[y] += velocity.array[y]
      position.array[z] += velocity.array[z]
      if (dice()) position.array[x] += shake()
      if (dice()) position.array[z] += shake()
      const { a } = getOffsetRGBA(i)
      color.array[a] *= decrementRandom()
      if (color.array[a] < 0.001) color.array[a] = 0
    }
    position.needsUpdate = true
    velocity.needsUpdate = true
    color.needsUpdate = true
  }
}
