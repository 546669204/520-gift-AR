import * as THREE from 'three'
import Base from './base'
import { Resource } from '../allLoader'
// 用 point 实现花海
export default class FlowerPoints extends Base {
  constructor (props) {
    super(props)
    this._particles = null
  }

  onSelect () {
    const env = this.env
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const materials = []

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 6 - 3
      const y = Math.random() * 6 - 3
      const z = Math.random() * 6 - 3
      // x,y,z 表示一个点的三维位置
      vertices.push(x, y, z)
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    )

    const parameters = [[[0.9, 0.05, 0.5], Resource.sprite1, 0.3]]

    for (let i = 0; i < parameters.length; i++) {
      const color = parameters[i][0]
      const sprite = parameters[i][1]
      const size = parameters[i][2]

      materials[i] = new THREE.PointsMaterial({
        size: size,
        map: sprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
      })
      materials[i].color.setHSL(color[0], color[1], color[2])

      const particles = new THREE.Points(geometry, materials[i])

      particles.rotation.x = Math.random() * 6
      particles.rotation.y = Math.random() * 6
      particles.rotation.z = Math.random() * 6
      this._particles = particles
      env.scene.add(particles)
    }
  }

  animationLoop () {
    if (this._particles) {
      const positions = this._particles.geometry.attributes.position
      const count = positions.count
      for (let i = 0; i < count; i++) {
        const px = positions.getX(i)
        const py = positions.getY(i)
        const pz = positions.getZ(i)

        const m = new THREE.Vector2(px, pz)
        m.rotateAround(new THREE.Vector2(0, 0), THREE.Math.degToRad(1))
        positions.setXYZ(
          i,
          m.x,
          py,
          m.y
        )
      }
      positions.needsUpdate = true
    }
  }
}
