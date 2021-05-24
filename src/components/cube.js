import * as THREE from 'three'
import Base from './base'

export default class Cube extends Base {
  onSelect () {
    const env = this.env
    const triangles = 160000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(triangles * 3 * 3)
    const normals = new Float32Array(triangles * 3 * 3)
    const colors = new Float32Array(triangles * 3 * 3)

    const color = new THREE.Color()

    const n = 800
    const n2 = n / 2
    const d = 12
    const d2 = d / 2

    const pA = new THREE.Vector3()
    const pB = new THREE.Vector3()
    const pC = new THREE.Vector3()

    const cb = new THREE.Vector3()
    const ab = new THREE.Vector3()

    for (let i = 0; i < positions.length; i += 9) {
      const x = Math.random() * n - n2
      const y = Math.random() * n - n2
      const z = Math.random() * n - n2

      const ax = x + Math.random() * d - d2
      const ay = y + Math.random() * d - d2
      const az = z + Math.random() * d - d2

      const bx = x + Math.random() * d - d2
      const by = y + Math.random() * d - d2
      const bz = z + Math.random() * d - d2

      const cx = x + Math.random() * d - d2
      const cy = y + Math.random() * d - d2
      const cz = z + Math.random() * d - d2

      positions[i] = ax
      positions[i + 1] = ay
      positions[i + 2] = az

      positions[i + 3] = bx
      positions[i + 4] = by
      positions[i + 5] = bz

      positions[i + 6] = cx
      positions[i + 7] = cy
      positions[i + 8] = cz

      pA.set(ax, ay, az)
      pB.set(bx, by, bz)
      pC.set(cx, cy, cz)

      cb.subVectors(pC, pB)
      ab.subVectors(pA, pB)
      cb.cross(ab)

      cb.normalize()
      // 法向量的方向可以这样表示N(nx, ny, nz);
      const nx = cb.x
      const ny = cb.y
      const nz = cb.z

      normals[i] = nx
      normals[i + 1] = ny
      normals[i + 2] = nz

      normals[i + 3] = nx
      normals[i + 4] = ny
      normals[i + 5] = nz

      normals[i + 6] = nx
      normals[i + 7] = ny
      normals[i + 8] = nz
      // 颜色用rgb表示, rgb每一个分量取值范围0-1,vx,vy,vz分别对应rgb值。
      const vx = x / n + 0.5
      const vy = y / n + 0.5
      const vz = z / n + 0.5

      color.setRGB(vx, vy, vz)
      // 将三角形的三个顶点设为同样的颜色
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b

      colors[i + 3] = color.r
      colors[i + 4] = color.g
      colors[i + 5] = color.b

      colors[i + 6] = color.r
      colors[i + 7] = color.g
      colors[i + 8] = color.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    geometry.computeBoundingSphere()

    const material = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      ambient: 0xaaaaaa,
      specular: 0xffffff,
      shininess: 250,
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.x = 0.001
    mesh.scale.y = 0.001
    mesh.scale.z = 0.001
    env.scene.add(mesh)
  }
}
