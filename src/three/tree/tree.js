import { Particle } from './particle'
import { Vector3 } from './utils'

export function Tree (x, y) {
  this.branches = []

  this.particles = []

  this.separation = 0.001
  this.friction = 0.99
  this.minTime = 5
  this.maxTime = 25
  this.maxParticle = 1000

  this.maxSpeed = 5
  this.radiusMin = 1

  this.randomness = 0.25

  this.iteration = 0

  const radiusFuncs = [
    function (radius) {
      return 0.1 * Math.pow(0.4 * radius, 2)
    },
    function (radius) {
      return 0.3 * Math.pow(radius, 1.1)
    }
  ]
  this.radiusFunc = radiusFuncs[Math.floor(Math.random() * radiusFuncs.length)]
  this.radiusFunc = radiusFuncs[1]

  const firstParticle = this.createFirstParticle(x, y)
  this.addParticle(firstParticle)
}

Tree.prototype = {
  createFirstParticle: function (x, y) {
    const p = new Particle()
    p.pos.x = x
    p.pos.y = y
    p.pos.z = 0

    p.vel.x = p.vel.z = 0
    p.vel.y = -this.maxSpeed
    p.radius = 50
    p.sizeSplit = (0.5 + 0.5 * Math.random()) * p.radius
    p.resetTime(this.minTime, this.maxTime)
    return p
  },

  update: function () {
    const tempVec = new Vector3()

    let n = this.particles.length
    for (let i = 0; i < n; i++) {
      const p = this.particles[i]
      p.radius *= 0.977
      for (let j = i + 1; j < n; j++) {
        const p2 = this.particles[j]

        let diff = Vector3.getDiff(p.pos, p2.pos, tempVec)
        const dist2 = diff.getLength2()
        const r = p.radius + p2.radius
        if (dist2 < r * r) {
          const dist = Math.sqrt(dist2)
          const ratio = r / dist
          diff = (r - dist) * ratio

          const influence = p2.radius / (p2.radius + p.radius)

          tempVec.scale(-influence * this.separation * ratio)
          p.vel.addVec(tempVec)

          tempVec.scale(1 - 1 / influence)
          p2.vel.addVec(tempVec)
        }
      }

      tempVec.x = Math.random() * 2 - 1
      tempVec.y = Math.random() * 2 - 1
      tempVec.z = Math.random() * 2 - 1
      tempVec.setlength(this.randomness)
      p.vel.addVec(tempVec)

      p.vel.scale(this.friction)

      const vel2 = p.vel.getLength2()
      if (vel2 > this.maxSpeed * this.maxSpeed) {
        p.vel.setlength(this.maxSpeed)
      }

      p.update()

      if (--p.time <= 0) {
        if (
          this.particles.length < this.maxParticle &&
          p.radius > this.radiusMin
        ) {
          this.splitParticle(p)
        } else {
          this.removeParticle(p)
          n--
          i--
        }
      }

      this.branches[p.bid].push({
        x: p.pos.x,
        y: p.pos.y,
        z: p.pos.z,
        level: this.iteration,
        radius: this.radiusFunc(p.radius)
      })
    }
    this.iteration++
  },

  splitParticle: function (p) {
    const p2 = new Particle(
      p.pos.x + 0.01 * (Math.random() * 2 - 1),
      // p.pos.y + 0.01 * (Math.random() * 2 - 1),
      p.pos.y,
      p.pos.z + 0.01 * (Math.random() * 2 - 1)
    )
    p2.radius = p.radius
    // p.radius = p.radius

    p.sizeSplit = (0.5 + 0.5 * Math.random()) * p.radius
    p2.sizeSplit = (0.5 + 0.5 * Math.random()) * p2.radius

    p2.vel.setVec(p.vel)

    this.addParticle(p2)

    p.resetTime(this.minTime, this.maxTime)
    p2.resetTime(this.minTime, this.maxTime)
  },

  addParticle: function (p) {
    p.bid = this.branches.length
    this.branches.push([])

    p.pid = this.particles.length
    this.particles.push(p)
  },

  removeParticle: function (p) {
    const temp = this.particles[this.particles.length - 1]
    if (temp !== undefined) {
      temp.pid = p.pid
      this.particles[p.pid] = temp
    }
    this.particles.length--
  }
}
