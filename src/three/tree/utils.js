
export function Vector3 (x, y, z) {
  this.set(x, y, z)
}

Vector3.prototype = {
  add: function (x, y, z) {
    this.x += x
    this.y += y
    this.z += z
  },

  addVec: function (v) {
    this.x += v.x
    this.y += v.y
    this.z += v.z
  },

  set: function (x, y, z) {
    this.x = x || 0
    this.y = y || 0
    this.z = z || 0
  },

  setVec: function (v) {
    this.x = v.x || 0
    this.y = v.y || 0
    this.z = v.z || 0
  },

  scale: function (ratio) {
    this.x *= ratio
    this.y *= ratio
    this.z *= ratio
  },

  getLength2: function () {
    return this.x * this.x + this.y * this.y + this.z * this.z
  },

  getLength: function () {
    return Math.sqrt(this.getLength2())
  },

  normalize: function () {
    const ratio = 1 / this.getLength()
    this.x *= ratio
    this.y *= ratio
    this.z *= ratio
  },

  setlength: function (length) {
    this.normalize()
    this.scale(length)
  }
}
Vector3.getDiff = function (v1, v2, out) {
  if (!out) out = new Vector3()
  out.x = v2.x - v1.x
  out.y = v2.y - v1.y
  out.z = v2.z - v1.z
  return out
}
