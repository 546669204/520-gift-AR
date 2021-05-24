import { Vector3 } from './utils'

export function Particle (x, y, z) {
  this.oldPos = new Vector3(x, y, z)
  this.pos = new Vector3(x, y, z)
  this.vel = new Vector3()
  this.radius = 0
  this.time = undefined
  this.maxTime = undefined

  this.oldIds = undefined
  this.newIds = new Float32Array(4)
}

Particle.prototype = {
  update: function () {
    this.oldPos.setVec(this.pos)
    this.pos.addVec(this.vel)
  },

  resetTime: function (minTime, maxTime) {
    this.time = this.maxTime = Math.random() * (maxTime - minTime) + minTime
  },

  draw: function (out) {
    out.beginPath()
    out.lineWidth =
      this.radius +
      (this.sizeSplit - this.radius) * (1 - this.time / this.maxTime)
    out.strokeStyle = 'black'
    out.lineCap = 'round'

    out.moveTo(this.oldPos.x, this.oldPos.y)
    out.lineTo(this.pos.x, this.pos.y)
    out.stroke()
  }
}
